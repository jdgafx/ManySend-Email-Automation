import type { Handler } from '@netlify/functions';

const MANYSEND_BASE = 'https://api.manyreach.com/api/v2';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const handler: Handler = async (event) => {
  const apiKey = process.env.MANYSEND_API_KEY;

  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'API key not configured' }) };
  }

  const manysendPath = event.path
    .replace(/^\/.netlify\/functions\/api/, '')
    .replace(/^\/api/, '');
  const queryString = event.rawQuery ? `?${event.rawQuery}` : '';
  const url = `${MANYSEND_BASE}${manysendPath}${queryString}`;

  const fetchHeaders: Record<string, string> = {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const fetchOptions: RequestInit = {
    method: event.httpMethod,
    headers: fetchHeaders,
  };

  if (event.body && ['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
    fetchOptions.body = event.body;
  }

  try {
    const response = await fetch(url, fetchOptions);
    const data = await response.text();
    return { statusCode: response.status, headers, body: data || '{}' };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { statusCode: 502, headers, body: JSON.stringify({ message: `Proxy error: ${errorMessage}` }) };
  }
};

export { handler };
