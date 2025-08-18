import { http, HttpResponse } from 'msw';

import eventsData from '../__mocks__/response/events.json' assert { type: 'json' };
import { Event } from '../types';

// events 배열을 복사해서 사용 (원본 데이터 보호)
let events = [...eventsData.events];

// ! HARD
// ! 각 응답에 대한 MSW 핸들러를 작성해주세요. GET 요청은 이미 작성되어 있는 events json을 활용해주세요.
export const handlers = [
  http.get('/api/events', () => {
    return HttpResponse.json({ events }, { status: 200 });
  }),

  http.post('/api/events', async ({ request }) => {
    const event = (await request.json()) as Event;
    events.push(event);
    return HttpResponse.json(event, { status: 201 });
  }),

  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedEvent = (await request.json()) as Event;

    const eventIndex = events.findIndex((event) => event.id === id);

    if (eventIndex === -1) {
      return HttpResponse.json(null, { status: 404 });
    }

    events[eventIndex] = { ...events[eventIndex], ...updatedEvent };
    return HttpResponse.json(events[eventIndex], { status: 200 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;

    const index = events.findIndex((event) => event.id === id);

    if (index !== -1) {
      return new HttpResponse(null, { status: 204 });
    }

    return new HttpResponse(null, { status: 404 });
  }),
];
