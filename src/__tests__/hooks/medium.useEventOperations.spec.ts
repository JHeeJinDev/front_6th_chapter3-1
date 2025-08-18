import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

beforeEach(() => {
  enqueueSnackbarFn.mockClear();
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const cleanup = setupMockHandlerCreation();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
    expect(result.current.events[0].title).toBe('기존 회의');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 로딩 완료!', { variant: 'info' });

  cleanup();
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  const cleanup = setupMockHandlerCreation();

  const newEvent = {
    title: '새로운 회의',
    date: '2025-10-20',
    startTime: '14:00',
    endTime: '15:00',
    description: '새로운 팀 미팅',
    location: '회의실 D',
    category: '업무',
    repeat: { type: 'none' as const, interval: 0 },
    notificationTime: 15,
  };

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', { variant: 'success' });

  cleanup();
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  const cleanup = setupMockHandlerUpdating();

  const updatedEvent: Event = {
    ...(eventsData.events[0] as Event),
    title: '수정된 회의',
    endTime: '11:00',
  };

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', { variant: 'success' });

  cleanup();
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  const cleanup = setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 삭제되었습니다.', { variant: 'info' });

  cleanup();
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });
  });

  expect(result.current.events).toHaveLength(0);
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const cleanup = setupMockHandlerUpdating();

  const nonExistentEvent: Event = {
    ...(eventsData.events[0] as Event),
    id: 'nonexistent',
    title: '존재하지 않는 이벤트',
  };

  const { result } = renderHook(() => useEventOperations(true));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });

  cleanup();
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  const cleanup = setupMockHandlerDeletion();

  server.use(
    http.delete('/api/events/1', () => {
      return HttpResponse.error();
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toHaveLength(3);
  });

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(3);

  cleanup();
});
