import { getDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = getDb();
    const doc = await db.collection('settings').doc('general').get();
    if (!doc.exists) {
      return NextResponse.json({});
    }
    return NextResponse.json(doc.data());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    
    await db.collection('settings').doc('general').set({
      ...body,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
