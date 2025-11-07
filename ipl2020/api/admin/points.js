/**
 * Vercel Serverless Function: /api/admin/points
 * Handles points table CRUD operations
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
    // GET - Fetch points table
    if (req.method === 'GET') {
      const points = await kv.get('points-table');
      
      return res.status(200).json({
        success: true,
        data: points || []
      });
    }

    // POST - Save points table
    if (req.method === 'POST') {
      const { points } = req.body;
      
      if (!points) {
        return res.status(400).json({
          success: false,
          error: 'Points table data is required'
        });
      }

      await kv.set('points-table', points);
      
      return res.status(200).json({
        success: true,
        message: 'Points table saved successfully',
        data: points
      });
    }

    // DELETE - Clear points table
    if (req.method === 'DELETE') {
      await kv.del('points-table');
      
      return res.status(200).json({
        success: true,
        message: 'Points table deleted successfully'
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
