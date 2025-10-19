/**
 * Production Entry Point - Single Process Mode
 * Simplified deployment for stability and easier management
 */

import './server';

// Single server process - no cluster complexity
console.log(`🦊 YoruWear API Server started in single process mode (PID: ${process.pid})`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚀 Server ready for requests`);
