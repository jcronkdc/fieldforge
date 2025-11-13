import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/dist/server.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Remove /api prefix from the path
  if (req.url?.startsWith('/api/')) {
    req.url = req.url.slice(4);
  }
  
  // Let Express handle the request
  return new Promise((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });
}
