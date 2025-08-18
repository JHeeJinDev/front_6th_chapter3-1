import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

describe('getUpcomingEvents', () => {
  const mockEvents = eventsData.events as Event[];

  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    const now = new Date('2025-10-15T08:50:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    const now = new Date('2025-10-15T08:50:00');
    const notifiedEvents = ['1'];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T08:30:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    const now = new Date('2025-10-15T09:10:00');
    const notifiedEvents: string[] = [];

    const result = getUpcomingEvents(mockEvents, now, notifiedEvents);

    expect(result).toHaveLength(0);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    const event = eventsData.events[0] as Event;
    const result = createNotificationMessage(event);

    expect(result).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  });
});
