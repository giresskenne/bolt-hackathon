// Record and track failed login attempts
function recordFailedAttempt(req, ip, email) {
  // Store failed attempts in memory (use Redis/DB in production)
  if (!global.__TEST_STATE__) {
    global.__TEST_STATE__ = {
      failedAttempts: new Map()
    };
  }
  
  const key = `${ip}:${email}`;
  const attempts = global.__TEST_STATE__.failedAttempts.get(key) || [];
  attempts.push(Date.now());
  
  // Only keep attempts within the window
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const now = Date.now();
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  global.__TEST_STATE__.failedAttempts.set(key, recentAttempts);
  
  return recentAttempts.length;
}

export { recordFailedAttempt };
