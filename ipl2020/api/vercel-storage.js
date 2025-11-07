/**
 * Vercel Serverless Functions for IPL Cricket Hub Admin
 * Uses Vercel KV (Redis) for persistent storage
 */

// Install: npm install @vercel/kv

import { kv } from '@vercel/kv';

// PLAYERS API
export async function savePlayers(request) {
  try {
    const { team, players } = await request.json();
    
    // Save to Vercel KV
    await kv.set(`players:${team}`, JSON.stringify(players));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Players saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getPlayers(request) {
  try {
    const url = new URL(request.url);
    const team = url.searchParams.get('team');
    
    const players = await kv.get(`players:${team}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: players ? JSON.parse(players) : []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// FIXTURES API
export async function saveFixtures(request) {
  try {
    const { fixtures } = await request.json();
    
    await kv.set('fixtures', JSON.stringify(fixtures));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Fixtures saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getFixtures(request) {
  try {
    const fixtures = await kv.get('fixtures');
    
    return new Response(JSON.stringify({
      success: true,
      data: fixtures ? JSON.parse(fixtures) : []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POINTS TABLE API
export async function savePoints(request) {
  try {
    const { points } = await request.json();
    
    await kv.set('points-table', JSON.stringify(points));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Points table saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getPoints(request) {
  try {
    const points = await kv.get('points-table');
    
    return new Response(JSON.stringify({
      success: true,
      data: points ? JSON.parse(points) : []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// LIVE MATCH DATA API
export async function saveLiveMatch(request) {
  try {
    const data = await request.json();
    
    await kv.set('live-match', JSON.stringify(data));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Live match data saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getLiveMatch(request) {
  try {
    const data = await kv.get('live-match');
    
    return new Response(JSON.stringify({
      success: true,
      data: data ? JSON.parse(data) : null
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// USERS API
export async function saveUser(request) {
  try {
    const user = await request.json();
    const userId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    
    await kv.set(`user:${userId}`, JSON.stringify(user));
    
    // Add to users list
    const usersList = await kv.get('users-list') || [];
    if (!usersList.includes(userId)) {
      usersList.push(userId);
      await kv.set('users-list', usersList);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'User saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function getAllUsers(request) {
  try {
    const usersList = await kv.get('users-list') || [];
    const users = [];
    
    for (const userId of usersList) {
      const user = await kv.get(`user:${userId}`);
      if (user) {
        users.push(JSON.parse(user));
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: users
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
