/**
 * Simple Production Entry Point - No Cluster
 * For Railway deployment without memory constraints
 */

import './server';

// Single worker mode - no cluster complexity
console.log(`🦊 YoruWear API Server started on single worker mode (PID: ${process.pid})`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Server ready for requests`);