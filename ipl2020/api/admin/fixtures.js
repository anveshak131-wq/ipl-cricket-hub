/**
 * Vercel Serverless Function: /api/admin/fixtures
 * Handles fixtures data CRUD operations
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Fetch all fixtures
    if (req.method === 'GET') {
      const fixtures = await kv.get('fixtures');
      
      return res.status(200).json({
        success: true,
        data: fixtures || []
      });
    }

    // POST - Save fixtures
    if (req.method === 'POST') {
      const { fixtures } = req.body;
      
      if (!fixtures) {
        return res.status(400).json({
          success: false,
          error: 'Fixtures data is required'
        });
      }

      await kv.set('fixtures', fixtures);
      
      return res.status(200).json({
        success: true,
        message: 'Fixtures saved successfully',
        data: fixtures
      });
    }

    // DELETE - Clear all fixtures
    if (req.method === 'DELETE') {
      await kv.del('fixtures');
      
      return res.status(200).json({
        success: true,
        message: 'All fixtures deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
