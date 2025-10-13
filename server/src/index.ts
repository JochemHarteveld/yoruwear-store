import { Elysia } from 'elysia';

const app = new Elysia()
  .get('/', () => 'Hello Elysia')
  .get('/health', () => ({ status: 'ok' }))
  // Bind to 0.0.0.0 so the service is reachable from outside the container
  .listen({ port: 3000, hostname: '0.0.0.0' });

console.log(`🦊 Elysia is running at ${app.server?.hostname ?? '0.0.0.0'}:${app.server?.port}`);
