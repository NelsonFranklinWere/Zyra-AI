import { FastifyInstance } from 'fastify';
import { authGuard } from '../middleware/authGuard';
import { requireOrgAccess } from '../middleware/roleGuard';
import {
  simulateMessage,
  getTraces,
  getBusinessMemoryHandler,
  updateBusinessMemoryHandler,
  processComment,
  replayAction,
} from '../controllers/ai.controller';

export async function aiRoutes(app: FastifyInstance) {
  // Simulate message processing
  app.post(
    '/simulate',
    { preHandler: [authGuard, requireOrgAccess] },
    simulateMessage
  );

  // Get traces
  app.get(
    '/traces',
    { preHandler: [authGuard, requireOrgAccess] },
    getTraces
  );

  // Business memory
  app.get(
    '/memory',
    { preHandler: [authGuard, requireOrgAccess] },
    getBusinessMemoryHandler
  );

  app.put(
    '/memory',
    { preHandler: [authGuard, requireOrgAccess] },
    updateBusinessMemoryHandler
  );

  // Social comment processing
  app.post(
    '/comment',
    { preHandler: [authGuard, requireOrgAccess] },
    processComment
  );

  // Replay action
  app.post(
    '/replay-action',
    { preHandler: [authGuard, requireOrgAccess] },
    replayAction
  );
}

