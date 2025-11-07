/**
 * Vercel Serverless Function: /api/admin/live-match
 * Handles live match data operations
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
    // GET - Fetch live match data
    if (req.method === 'GET') {
      const liveMatch = await kv.get('live-match');
      
      return res.status(200).json({
        success: true,
        data: liveMatch || null
      });
    }

    // POST - Save live match data
    if (req.method === 'POST') {
      const data = req.body;
      
      // Add timestamp
      data.lastUpdated = new Date().toISOString();
      
      await kv.set('live-match', data);
      
      return res.status(200).json({
        success: true,
        message: 'Live match data saved successfully',
        data: data
      });
    }

    // DELETE - Clear live match data
    if (req.method === 'DELETE') {
      await kv.del('live-match');
      
      return res.status(200).json({
        success: true,
        message: 'Live match data cleared successfully'
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
