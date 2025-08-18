import { Event } from '../../types';
import {
  fillZero,
  formatDate,
  formatMonth,
  formatWeek,
  getDaysInMonth,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
  isDateInRange,
} from '../../utils/dateUtils';
import eventsData from '../../__mocks__/response/events.json' assert { type: 'json' };

describe('getDaysInMonth', () => {
  it('1월은 31일 수를 반환한다', () => {
    expect(getDaysInMonth(2025, 1)).toBe(31);
  });

  it('4월은 30일 일수를 반환한다', () => {
    expect(getDaysInMonth(2025, 4)).toBe(30);
  });

  it('윤년의 2월에 대해 29일을 반환한다', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
  });

  it('평년의 2월에 대해 28일을 반환한다', () => {
    expect(getDaysInMonth(2025, 2)).toBe(28);
  });

  it('유효하지 않은 월에 대해 적절히 처리한다', () => {
    expect(getDaysInMonth(2025, 0)).toBe(31);
    expect(getDaysInMonth(2025, 13)).toBe(31);
  });
});

describe('getWeekDates', () => {
  it('주중의 날짜(수요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const wednesday = new Date(2025, 6, 9);
    const weekDates = getWeekDates(wednesday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(6);
    expect(weekDates[3].getDate()).toBe(9);
    expect(weekDates[6].getDate()).toBe(12);
  });

  it('주의 시작(월요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const monday = new Date(2025, 6, 7);
    const weekDates = getWeekDates(monday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(6);
    expect(weekDates[1].getDate()).toBe(7);
    expect(weekDates[6].getDate()).toBe(12);
  });

  it('주의 끝(일요일)에 대해 올바른 주의 날짜들을 반환한다', () => {
    const sunday = new Date(2025, 6, 6);
    const weekDates = getWeekDates(sunday);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(6);
    expect(weekDates[6].getDate()).toBe(12);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연말)', () => {
    const date = new Date(2024, 11, 29);
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(4);
  });

  it('연도를 넘어가는 주의 날짜를 정확히 처리한다 (연초)', () => {
    const date = new Date(2025, 0, 1);
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(4);
  });

  it('윤년의 2월 29일을 포함한 주를 올바르게 처리한다', () => {
    const date = new Date(2024, 1, 29);
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(25);
    expect(weekDates[4].getDate()).toBe(29);
    expect(weekDates[6].getDate()).toBe(2);
  });

  it('월의 마지막 날짜를 포함한 주를 올바르게 처리한다', () => {
    const date = new Date(2025, 6, 31);
    const weekDates = getWeekDates(date);

    expect(weekDates).toHaveLength(7);
    expect(weekDates[0].getDate()).toBe(27);
    expect(weekDates[4].getDate()).toBe(31);
    expect(weekDates[6].getDate()).toBe(2);
  });
});

describe('getWeeksAtMonth', () => {
  it('2025년 7월 1일의 올바른 주 정보를 반환해야 한다', () => {
    const date = new Date(2025, 6, 1);
    const weeks = getWeeksAtMonth(date);

    expect(weeks).toBeInstanceOf(Array);
    expect(weeks.length).toBeGreaterThan(0);
    expect(weeks[0]).toContain(1);
  });
});

describe('getEventsForDay', () => {
  const mockEvents = eventsData.events as Event[];

  it('특정 날짜(15일)에 해당하는 이벤트만 정확히 반환한다', () => {
    const result = getEventsForDay(mockEvents, 15);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('1');
  });

  it('해당 날짜에 이벤트가 없을 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 10);
    expect(result).toEqual([]);
  });

  it('날짜가 0일 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 0);
    expect(result).toEqual([]);
  });

  it('날짜가 32일 이상인 경우 빈 배열을 반환한다', () => {
    const result = getEventsForDay(mockEvents, 32);
    expect(result).toEqual([]);
  });
});

describe('formatWeek', () => {
  it('월의 중간 날짜에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 15);
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 3주');
  });

  it('월의 첫 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 1);
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 1주');
  });

  it('월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 6, 31);
    const result = formatWeek(date);
    expect(result).toBe('2025년 7월 5주');
  });

  it('연도가 바뀌는 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2024, 11, 31);
    const result = formatWeek(date);
    expect(result).toBe('2025년 1월 1주');
  });

  it('윤년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2024, 1, 29);
    const result = formatWeek(date);
    expect(result).toBe('2024년 2월 5주');
  });

  it('평년 2월의 마지막 주에 대해 올바른 주 정보를 반환한다', () => {
    const date = new Date(2025, 1, 28);
    const result = formatWeek(date);
    expect(result).toBe('2025년 2월 4주');
  });
});

describe('formatMonth', () => {
  it("2025년 7월 10일을 '2025년 7월'로 반환한다", () => {
    const date = new Date(2025, 6, 10);
    const result = formatMonth(date);
    expect(result).toBe('2025년 7월');
  });
});

describe('isDateInRange', () => {
  const rangeStart = new Date(2025, 6, 1);
  const rangeEnd = new Date(2025, 6, 31);

  it('범위 내의 날짜 2025-07-10에 대해 true를 반환한다', () => {
    const date = new Date(2025, 6, 10);
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 시작일 2025-07-01에 대해 true를 반환한다', () => {
    const date = new Date(2025, 6, 1);
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위의 종료일 2025-07-31에 대해 true를 반환한다', () => {
    const date = new Date(2025, 6, 31);
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(true);
  });

  it('범위 이전의 날짜 2025-06-30에 대해 false를 반환한다', () => {
    const date = new Date(2025, 5, 30);
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('범위 이후의 날짜 2025-08-01에 대해 false를 반환한다', () => {
    const date = new Date(2025, 7, 1);
    expect(isDateInRange(date, rangeStart, rangeEnd)).toBe(false);
  });

  it('시작일이 종료일보다 늦은 경우 모든 날짜에 대해 false를 반환한다', () => {
    const invalidStart = new Date(2025, 6, 31);
    const invalidEnd = new Date(2025, 6, 1);
    const date = new Date(2025, 6, 15);
    expect(isDateInRange(date, invalidStart, invalidEnd)).toBe(false);
  });
});

describe('fillZero', () => {
  it("5를 2자리로 변환하면 '05'를 반환한다", () => {
    expect(fillZero(5, 2)).toBe('05');
  });

  it("10을 2자리로 변환하면 '10'을 반환한다", () => {
    expect(fillZero(10, 2)).toBe('10');
  });

  it("3을 3자리로 변환하면 '003'을 반환한다", () => {
    expect(fillZero(3, 3)).toBe('003');
  });

  it("100을 2자리로 변환하면 '100'을 반환한다", () => {
    expect(fillZero(100, 2)).toBe('100');
  });

  it("0을 2자리로 변환하면 '00'을 반환한다", () => {
    expect(fillZero(0, 2)).toBe('00');
  });

  it("1을 5자리로 변환하면 '00001'을 반환한다", () => {
    expect(fillZero(1, 5)).toBe('00001');
  });

  it("소수점이 있는 3.14를 5자리로 변환하면 '03.14'를 반환한다", () => {
    expect(fillZero(3.14, 5)).toBe('03.14');
  });

  it('size 파라미터를 생략하면 기본값 2를 사용한다', () => {
    expect(fillZero(5)).toBe('05');
  });

  it('value가 지정된 size보다 큰 자릿수를 가지면 원래 값을 그대로 반환한다', () => {
    expect(fillZero(123, 2)).toBe('123');
  });
});

describe('formatDate', () => {
  it('날짜를 YYYY-MM-DD 형식으로 포맷팅한다', () => {
    const date = new Date(2025, 6, 15);
    const result = formatDate(date);
    expect(result).toBe('2025-07-15');
  });

  it('day 파라미터가 제공되면 해당 일자로 포맷팅한다', () => {
    const date = new Date(2025, 6, 15);
    const result = formatDate(date, 20);
    expect(result).toBe('2025-07-20');
  });

  it('월이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 2, 15);
    const result = formatDate(date);
    expect(result).toBe('2025-03-15');
  });

  it('일이 한 자리 수일 때 앞에 0을 붙여 포맷팅한다', () => {
    const date = new Date(2025, 6, 5);
    const result = formatDate(date);
    expect(result).toBe('2025-07-05');
  });
});
