import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDirectory = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

const server = createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/profile') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ saved: true }));
    return;
  }

  const pathname = new URL(request.url || '/', 'http://127.0.0.1').pathname;
  const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  if (!requestedPath || requestedPath.includes('..')) {
    response.writeHead(404);
    response.end();
    return;
  }

  try {
    const filePath = join(appDirectory, requestedPath);
    const body = await readFile(filePath);
    response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] || 'text/plain' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end();
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Synthetic demo app listening on http://127.0.0.1:${port}`);
});
