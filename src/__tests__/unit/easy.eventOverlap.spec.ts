import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

describe('parseDateTime', () => {
  it('2025-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const result = parseDateTime('2025-07-01', '14:30');
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(6);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('invalid-date', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const result = parseDateTime('2025-07-01', 'invalid-time');
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const result = parseDateTime('', '14:30');
    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    const event = eventsData.events[0] as Event;

    const result = convertEventToDateRange(event);

    expect(result.start.getFullYear()).toBe(2025);
    expect(result.start.getMonth()).toBe(9); // 10월은 9 (0-based)
    expect(result.start.getDate()).toBe(15);
    expect(result.start.getHours()).toBe(9);
    expect(result.start.getMinutes()).toBe(0);

    expect(result.end.getFullYear()).toBe(2025);
    expect(result.end.getMonth()).toBe(9);
    expect(result.end.getDate()).toBe(15);
    expect(result.end.getHours()).toBe(10);
    expect(result.end.getMinutes()).toBe(0);
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: 'invalid-date',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const event: Event = {
      id: '1',
      title: '회의',
      date: '2025-07-01',
      startTime: 'invalid-time',
      endTime: 'invalid-time',
      description: '팀 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const result = convertEventToDateRange(event);
    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = eventsData.events[1] as Event;

    expect(isOverlapping(event1, event2)).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    const event1 = eventsData.events[0] as Event;
    const event2 = eventsData.events[2] as Event;

    expect(isOverlapping(event1, event2)).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    const existingEvents = eventsData.events as Event[];

    const newEvent: Event = {
      ...eventsData.events[0],
      id: '4',
      title: '새 회의',
      startTime: '09:45',
      endTime: '10:15',
      description: '새로운 회의',
      location: '회의실 D',
    } as Event;

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(overlappingEvents).toHaveLength(2);
    expect(overlappingEvents.map((e) => e.id)).toContain('1');
    expect(overlappingEvents.map((e) => e.id)).toContain('2');
    expect(overlappingEvents.map((e) => e.id)).not.toContain('3');
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    const existingEvents = [eventsData.events[0], eventsData.events[2]] as Event[];

    const newEvent: Event = {
      ...eventsData.events[0],
      id: '3',
      title: '새 회의',
      startTime: '10:00',
      endTime: '10:30',
      description: '새로운 회의',
      location: '회의실 C',
    } as Event;

    const overlappingEvents = findOverlappingEvents(newEvent, existingEvents);
    expect(overlappingEvents).toHaveLength(0);
  });
});
