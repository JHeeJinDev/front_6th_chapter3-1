import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const mockDate = new Date('2025-10-01');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCalendarView());

    assertDate(result.current.currentDate, mockDate);

    vi.useRealTimers();
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const mockDate = new Date('2025-10-01');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
      '2025-10-09': '한글날',
    });

    vi.useRealTimers();
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const mockDate = new Date('2025-10-01');
  const expectedDate = new Date('2025-10-08');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, expectedDate);

  vi.useRealTimers();
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const mockDate = new Date('2025-10-01');
  const expectedDate = new Date('2025-09-24');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, expectedDate);

  vi.useRealTimers();
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const mockDate = new Date('2025-10-01');
  const expectedDate = new Date('2025-11-01');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, expectedDate);

  vi.useRealTimers();
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const mockDate = new Date('2025-10-01');
  const expectedDate = new Date('2025-09-01');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, expectedDate);

  vi.useRealTimers();
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const mockDate = new Date('2025-10-01');
  vi.useFakeTimers();
  vi.setSystemTime(mockDate);

  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  expect(result.current.holidays).toEqual({
    '2025-03-01': '삼일절',
  });

  vi.useRealTimers();
});
