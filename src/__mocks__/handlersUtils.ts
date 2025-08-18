import { http, HttpResponse } from 'msw';
import { server } from '../setupTests';
import { Event } from '../types';
import eventsData from './response/events.json' assert { type: 'json' };

// 각 테스트마다 독립적인 이벤트 상태를 관리하기 위한 Map
const testEventStates = new Map<string, Event[]>();

// 테스트 ID를 생성하는 함수
const getTestId = (): string => {
  return `test_${Date.now()}`;
};

// 테스트별 이벤트 상태를 초기화하는 함수
const initializeTestState = (testId: string, initialEvents: Event[] = []): Event[] => {
  const events: Event[] =
    initialEvents.length > 0 ? [...initialEvents] : [...(eventsData.events as Event[])];
  testEventStates.set(testId, events);
  return events;
};

// 테스트별 이벤트 상태를 가져오는 함수
const getTestEvents = (testId: string): Event[] => {
  return testEventStates.get(testId) || [];
};

// 테스트별 이벤트 상태를 업데이트하는 함수
const updateTestEvents = (testId: string, events: Event[]): void => {
  testEventStates.set(testId, events);
};

// 테스트 완료 후 상태를 정리하는 함수
const cleanupTestState = (testId: string): void => {
  testEventStates.delete(testId);
};

// ! Hard
// ! 이벤트는 생성, 수정 되면 fetch를 다시 해 상태를 업데이트 합니다. 이를 위한 제어가 필요할 것 같은데요. 어떻게 작성해야 테스트가 병렬로 돌아도 안정적이게 동작할까요?
// ! 아래 이름을 사용하지 않아도 되니, 독립적이게 테스트를 구동할 수 있는 방법을 찾아보세요. 그리고 이 로직을 PR에 설명해주세요.

/**
 * 이벤트 생성 테스트를 위한 독립적인 핸들러 설정
 * 각 테스트마다 고유한 상태를 가지도록 testId를 사용
 * @param initEvents - 초기 이벤트 배열 (선택사항)
 * @returns 정리 함수
 */
export const setupMockHandlerCreation = (initEvents: Event[] = []): (() => void) => {
  const testId: string = getTestId();
  initializeTestState(testId, initEvents);

  // POST 핸들러 설정 (이벤트 생성)
  server.use(
    http.post('/api/events', async ({ request }) => {
      const newEvent = (await request.json()) as Event;
      const currentEvents: Event[] = getTestEvents(testId);

      // 새 이벤트에 ID 할당
      const eventWithId: Event = {
        ...newEvent,
        id: `event_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };

      // 이벤트 추가
      const updatedEvents: Event[] = [...currentEvents, eventWithId];
      updateTestEvents(testId, updatedEvents);

      return HttpResponse.json(eventWithId, { status: 201 });
    }),

    // GET 핸들러 설정 (이벤트 조회)
    http.get('/api/events', () => {
      const currentEvents: Event[] = getTestEvents(testId);
      return HttpResponse.json({ events: currentEvents });
    })
  );

  // 정리 함수 반환
  return (): void => cleanupTestState(testId);
};

/**
 * 이벤트 수정 테스트를 위한 독립적인 핸들러 설정
 * @returns 정리 함수
 */
export const setupMockHandlerUpdating = (): (() => void) => {
  const testId: string = getTestId();
  initializeTestState(testId);

  // PUT 핸들러 설정 (이벤트 수정)
  server.use(
    http.put('/api/events/:id', async ({ params, request }) => {
      const { id } = params;
      const updatedEvent = (await request.json()) as Event;
      const currentEvents: Event[] = getTestEvents(testId);

      const eventIndex: number = currentEvents.findIndex((event: Event) => event.id === id);
      if (eventIndex === -1) {
        return HttpResponse.json(null, { status: 404 });
      }

      // 이벤트 업데이트
      const updatedEvents: Event[] = [...currentEvents];
      updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], ...updatedEvent };
      updateTestEvents(testId, updatedEvents);

      return HttpResponse.json(updatedEvents[eventIndex], { status: 200 });
    }),

    // GET 핸들러 설정 (이벤트 조회)
    http.get('/api/events', () => {
      const currentEvents: Event[] = getTestEvents(testId);
      return HttpResponse.json({ events: currentEvents });
    })
  );

  // 정리 함수 반환
  return (): void => cleanupTestState(testId);
};

/**
 * 이벤트 삭제 테스트를 위한 독립적인 핸들러 설정
 * @returns 정리 함수
 */
export const setupMockHandlerDeletion = (): (() => void) => {
  const testId: string = getTestId();
  initializeTestState(testId);

  // DELETE 핸들러 설정 (이벤트 삭제)
  server.use(
    http.delete('/api/events/:id', ({ params }) => {
      const { id } = params;
      const currentEvents: Event[] = getTestEvents(testId);

      const eventIndex: number = currentEvents.findIndex((event: Event) => event.id === id);
      if (eventIndex === -1) {
        return HttpResponse.json(null, { status: 404 });
      }

      // 이벤트 삭제
      const updatedEvents: Event[] = currentEvents.filter((event: Event) => event.id !== id);
      updateTestEvents(testId, updatedEvents);

      return new HttpResponse(null, { status: 204 });
    }),

    // GET 핸들러 설정 (이벤트 조회)
    http.get('/api/events', () => {
      const currentEvents: Event[] = getTestEvents(testId);
      return HttpResponse.json({ events: currentEvents });
    })
  );

  // 정리 함수 반환
  return (): void => cleanupTestState(testId);
};
