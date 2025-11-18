/**
 * Vercel Serverless Function - Express Backend Wrapper
 * 
 * This handler imports the full FieldForge Express backend
 * and routes all /api/* requests through it.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy-load the Express app to avoid cold start issues
let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set Vercel environment flag to prevent Express from calling listen()
    process.env.VERCEL = '1';
    
    // Load the Express app on first request
    if (!app) {
      const serverModule = await import('../backend/dist/server.js');
      
      console.log('Server module details:', {
        moduleKeys: Object.keys(serverModule),
        hasDefault: !!serverModule.default,
        defaultType: typeof serverModule.default,
        defaultIsFunction: typeof serverModule.default === 'function',
        defaultConstructor: serverModule.default?.constructor?.name,
        defaultKeys: serverModule.default ? Object.keys(serverModule.default).slice(0, 10) : []
      });
      
      // Try to get the app - it might be wrapped
      app = serverModule.default?.default || serverModule.default || serverModule;
      
      console.log('Final app details:', {
        type: typeof app,
        isFunction: typeof app === 'function',
        constructor: app?.constructor?.name
      });
      
      if (typeof app !== 'function') {
        // Last resort: maybe it's in a different export
        const allExports = Object.entries(serverModule)
          .filter(([key, value]) => typeof value === 'function')
          .map(([key]) => key);
        
        console.error('ERROR: app is not a function!', {
          type: typeof app,
          availableFunctionExports: allExports
        });
        throw new Error(`Invalid Express app export: type=${typeof app}, available functions: ${allExports.join(', ')}`);
      }
    }
    
    // Express apps can be used as request handlers
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}