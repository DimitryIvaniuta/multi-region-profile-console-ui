import type { Page } from '@playwright/test';

const now = new Date('2026-05-22T12:00:00.000Z').toISOString();
const profileId = '11111111-1111-4111-8111-111111111111';

const json = (payload: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(payload),
});

export const mockBackend = async (page: Page) => {
  await page.route('**/actuator/health', async (route) => {
    await route.fulfill(json({ status: 'UP', components: { readinessState: { status: 'UP' } } }));
  });

  await page.route('**/api/v1/consistency/sla', async (route) => {
    await route.fulfill(json({ region: 'eu-read', role: 'READ_REPLICA', visibilitySlaSeconds: 5, cacheTtlSeconds: 60, model: 'EVENTUAL_CONSISTENCY' }));
  });

  await page.route('**/internal/replication/lag', async (route) => {
    await route.fulfill(json({ region: 'eu-read', role: 'READ_REPLICA', latestEventTime: now, measuredAt: now, lagSeconds: 2, visibilitySlaSeconds: 5, withinSla: true, lagSource: 'WATERMARK' }));
  });

  await page.route('**/api/v1/profiles', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill(json({ profileId, email: 'alice@example.com', displayName: 'Alice Example', phone: '+48100100200', status: 'ACTIVE', version: 1, createdAt: now, updatedAt: now }, 201));
      return;
    }
    await route.fallback();
  });

  await page.route('**/api/v1/profiles/**', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await route.fulfill(json({ profileId, email: 'alice@example.com', displayName: 'Alice Example', phone: '+48100100200', status: 'ACTIVE', version: 1, createdAt: now, updatedAt: now, sourceRegion: 'primary', eventId: '22222222-2222-4222-8222-222222222222', eventTime: now, replicatedAt: now, replicationLagSeconds: 2, withinSla: true }));
      return;
    }
    if (method === 'PUT') {
      await route.fulfill(json({ profileId, email: 'alice@example.com', displayName: 'Alice Updated', phone: '+48100100299', status: 'ACTIVE', version: 2, createdAt: now, updatedAt: now }));
      return;
    }
    if (method === 'DELETE') {
      await route.fulfill(json({ profileId, email: 'alice@example.com', displayName: 'Alice Updated', phone: '+48100100299', status: 'INACTIVE', version: 3, createdAt: now, updatedAt: now }));
      return;
    }
    await route.fallback();
  });

  await page.route('**/internal/projection/watermarks', async (route) => {
    await route.fulfill(json([{ topicName: 'profile.changes.v1', partitionId: 0, currentOffset: 42, latestEventTime: now, lastConsumedAt: now, region: 'eu-read' }]));
  });

  await page.route('**/internal/projection/invalid-events**', async (route) => {
    await route.fulfill(json([{ id: 1, topicName: 'profile.changes.v1', partitionId: 0, recordOffset: 41, recordKey: profileId, error: 'Invalid payload', occurredAt: now, region: 'eu-read' }]));
  });

  await page.route('**/internal/outbox/stats', async (route) => {
    await route.fulfill(json({ countsByStatus: { PUBLISHED: 12, PENDING: 1, EXHAUSTED: 0 } }));
  });

  await page.route('**/internal/outbox/replay**', async (route) => {
    await route.fulfill(json({ requestedLimit: 100, submitted: 1 }));
  });
};

export { profileId };
