# NLCF Church Website

Frontend starter for a church website inspired by CCF structure, connected to a NestJS backend.

## Stack

- React + TypeScript + Vite
- CSS (no framework yet)
- API integration via `fetch` to NestJS endpoints

## Run locally

1. Install dependencies:
   - `npm install`
2. Set API URL:
   - copy `.env.example` to `.env`
   - update `VITE_API_BASE_URL`
3. Start dev server:
   - `npm run dev`

## Build and lint

- `npm run build`
- `npm run lint`

## Current API integration

- Contact form posts to:
  - `POST {VITE_API_BASE_URL}/contact`
- Events page fetches:
  - `GET {VITE_API_BASE_URL}/events`

This matches your NestJS-style controller pattern where endpoints are organized by resource.

## Next recommended steps

- Add real content from your ministry (events, resources, schedules)
- Add media pages (sermons, podcast, livestream embeds)
- Add admin/content endpoints in NestJS (for events/resources updates)
- Add CORS in NestJS for your frontend domain(s)
