import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

const mockEvents = eventsData.events as Event[];

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toHaveLength(0);
  expect(result.current.notifiedEvents).toHaveLength(0);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  vi.useFakeTimers();

  const mockDate = new Date('2025-10-15T08:50:00');
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].id).toBe('1');
  expect(result.current.notifications[0].message).toBe('10분 후 기존 회의 일정이 시작됩니다.');
  expect(result.current.notifiedEvents).toContain('1');

  vi.useRealTimers();
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  vi.useFakeTimers();

  const mockDate = new Date('2025-10-15T08:50:00');
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(0);

  vi.useRealTimers();
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  vi.useFakeTimers();

  const mockDate = new Date('2025-10-15T08:50:00');
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useNotifications(mockEvents));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');

  vi.useRealTimers();
});
