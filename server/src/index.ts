/**
 * Production Entry Point - Cluster Mode
 * Following Elysia production deployment best practices
 * Optimized for Railway's container constraints
 */

import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

if (cluster.isPrimary) {
  console.log(`🚀 Starting YoruWear API in cluster mode`);
  
  // Get available CPU cores but limit for Railway's memory constraints
  const availableCores = os.availableParallelism();
  
  // Railway containers have limited memory - use max 4 workers to prevent OOM
  const maxWorkers = process.env.NODE_ENV === 'production' 
    ? Math.min(availableCores, 4)  // Max 4 workers for production stability
    : Math.min(availableCores, 2); // Max 2 workers for development
    
  console.log(`📊 CPU cores available: ${availableCores}, using: ${maxWorkers} workers`);
  console.log(`✅ Primary process ${process.pid} starting with ${maxWorkers} workers`);
  
  // Fork workers
  for (let i = 0; i < maxWorkers; i++) {
    cluster.fork();
  }

  // Handle worker crashes with exponential backoff to prevent crash loops
  let restartAttempts = 0;
  const MAX_RESTART_ATTEMPTS = 10;
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    
    if (restartAttempts < MAX_RESTART_ATTEMPTS && !worker.exitedAfterDisconnect) {
      restartAttempts++;
      const delay = Math.min(1000 * restartAttempts, 30000); // Max 30s delay
      console.log(`🔄 Restarting worker in ${delay}ms (attempt ${restartAttempts}/${MAX_RESTART_ATTEMPTS})`);
      
      setTimeout(() => cluster.fork(), delay);
    } else if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
      console.error(`❌ Max restart attempts reached (${MAX_RESTART_ATTEMPTS}), shutting down`);
      process.exit(1);
    }
  });

  // Reset restart counter on successful worker startup
  cluster.on('online', (worker) => {
    console.log(`✅ Worker ${worker.process.pid} online and ready`);
    restartAttempts = 0; // Reset counter on success
  });
  
} else {
  // Worker process - import and start the server
  await import('./server');
  console.log(`🦊 Worker ${process.pid} started and ready`);
}
