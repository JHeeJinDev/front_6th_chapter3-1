import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const mockEvents = eventsData.events as Event[];
  const currentDate = new Date('2025-10-15');
  const view = 'month' as const;

  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toHaveLength(3);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const mockEvents = eventsData.events as Event[];
  const currentDate = new Date('2025-10-15');
  const view = 'month' as const;

  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  act(() => {
    result.current.setSearchTerm('기존');
  });

  expect(result.current.searchTerm).toBe('기존');
  expect(result.current.filteredEvents).toHaveLength(1);
  expect(result.current.filteredEvents[0].title).toBe('기존 회의');
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const mockEvents = eventsData.events as Event[];
  const currentDate = new Date('2025-10-15');
  const view = 'month' as const;

  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  // 제목으로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.filteredEvents).toHaveLength(3);

  // 위치로 검색
  act(() => {
    result.current.setSearchTerm('회의실');
  });

  expect(result.current.filteredEvents).toHaveLength(3);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const mockEvents = eventsData.events as Event[];
  const currentDate = new Date('2025-10-15');

  // 월간 뷰 테스트
  const { result: monthResult } = renderHook(() => useSearch(mockEvents, currentDate, 'month'));
  expect(monthResult.current.filteredEvents).toHaveLength(3);

  // 다른 날짜로 테스트
  const differentDate = new Date('2025-11-15');
  const { result: differentResult } = renderHook(() =>
    useSearch(mockEvents, differentDate, 'month')
  );
  expect(differentResult.current.filteredEvents).toHaveLength(0);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const mockEvents = eventsData.events as Event[];
  const currentDate = new Date('2025-10-15');
  const view = 'month' as const;

  const { result } = renderHook(() => useSearch(mockEvents, currentDate, view));

  // '회의'로 검색
  act(() => {
    result.current.setSearchTerm('회의');
  });

  expect(result.current.searchTerm).toBe('회의');
  expect(result.current.filteredEvents).toHaveLength(3);

  // '점심'으로 검색
  act(() => {
    result.current.setSearchTerm('점심');
  });

  expect(result.current.searchTerm).toBe('점심');
  expect(result.current.filteredEvents).toHaveLength(0);
});
