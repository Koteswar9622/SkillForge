import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports that depend on them
// Load from .env first, then override with .env.local
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const apiRouter = (await import('./server/routes')).default;
  const app = express();
  const PORT = 3000;

  // Use standard express body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register API routes
  app.use('/api', apiRouter);

  // Serve static assets or mount Vite dev middleware depending on environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in Development mode. Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in Production mode. Serving built static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SkillForge Server] Running smoothly on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[SkillForge Server] Failed to start:', error);
});
