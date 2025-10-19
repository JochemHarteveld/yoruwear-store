/**
 * Production Entry Point - Cluster Mode
 * Following Elysia production deployment best practices
 */

import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

if (cluster.isPrimary) {
  console.log(`🚀 Starting YoruWear API in cluster mode`);
  console.log(`📊 CPU cores available: ${os.availableParallelism()}`);
  
  // Fork workers for each CPU core
  for (let i = 0; i < os.availableParallelism(); i++) {
    cluster.fork();
  }

  // Handle worker exit and restart
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
    console.log('🔄 Starting a new worker...');
    cluster.fork();
  });

  console.log(`✅ Primary process ${process.pid} started with ${os.availableParallelism()} workers`);
} else {
  // Worker process - import and start the server
  await import('./server');
  console.log(`🦊 Worker ${process.pid} started and ready`);
}
