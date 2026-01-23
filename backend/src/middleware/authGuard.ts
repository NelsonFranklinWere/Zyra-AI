import { FastifyRequest, FastifyReply } from 'fastify';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    console.log('🔐 authGuard: Starting JWT verification');
    console.log('🔐 authGuard: Headers:', {
      authorization: request.headers.authorization,
      cookie: request.headers.cookie
    });
    
    // Add timeout to JWT verification
    const verifyPromise = request.jwtVerify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('JWT verification timeout')), 5000);
    });
    
    await Promise.race([verifyPromise, timeoutPromise]);
    console.log('✅ authGuard: JWT verification successful');
  } catch (err) {
    console.log('❌ authGuard: JWT verification failed:', err);
    return reply.code(401).send({
      success: false,
      message: 'Unauthorized',
    });
  }
}

