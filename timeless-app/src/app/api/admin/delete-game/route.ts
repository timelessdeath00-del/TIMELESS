import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DELETED_GAMES_PATH = path.join(process.cwd(), 'src', 'data', 'deleted_games.json');

async function getDeletedGameIds(): Promise<string[]> {
  try {
    const data = await fs.readFile(DELETED_GAMES_PATH, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

async function saveDeletedGameIds(ids: string[]): Promise<void> {
  const uniqueIds = Array.from(new Set(ids));
  await fs.writeFile(DELETED_GAMES_PATH, JSON.stringify(uniqueIds, null, 2), 'utf-8');
}

export async function GET() {
  const deletedIds = await getDeletedGameIds();
  return NextResponse.json({ success: true, deletedIds });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = 'delete', gameId, slug } = body;

    if (!gameId && !slug) {
      return NextResponse.json({ error: 'gameId or slug required' }, { status: 400 });
    }

    const currentDeleted = await getDeletedGameIds();
    let updated: string[] = [];

    const targets = [gameId, slug].filter(Boolean) as string[];

    if (action === 'delete') {
      updated = Array.from(new Set([...currentDeleted, ...targets]));
      await saveDeletedGameIds(updated);
      return NextResponse.json({ success: true, action: 'deleted', deletedIds: updated });
    } else if (action === 'restore') {
      updated = currentDeleted.filter((id) => !targets.includes(id));
      await saveDeletedGameIds(updated);
      return NextResponse.json({ success: true, action: 'restored', deletedIds: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin game management error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
