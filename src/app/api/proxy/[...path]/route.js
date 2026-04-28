import { NextResponse } from 'next/server';

const API_BASE = 'https://sii.celaya.tecnm.mx/api';

export async function GET(request, { params }) {
  const path = (await params).path.join('/');
  const token = request.headers.get('authorization');

  const res = await fetch(`${API_BASE}/${path}`, {
    headers: {
      'Authorization': token || '',
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const path = (await params).path.join('/');
  const body = await request.json();

  const res = await fetch(`${API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
