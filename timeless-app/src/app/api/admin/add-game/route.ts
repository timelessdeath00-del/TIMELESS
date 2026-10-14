import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Game } from '@/types/game';

const CUSTOM_GAMES_PATH = path.join(process.cwd(), 'src', 'data', 'custom_games.json');

async function getCustomGames(): Promise<Game[]> {
  try {
    const data = await fs.readFile(CUSTOM_GAMES_PATH, 'utf-8');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

async function saveCustomGames(games: Game[]): Promise<void> {
  await fs.writeFile(CUSTOM_GAMES_PATH, JSON.stringify(games, null, 2), 'utf-8');
}

export async function GET() {
  const games = await getCustomGames();
  return NextResponse.json({ success: true, games });
}

export async function POST(request: Request) {
  try {
    const game: Game = await request.json();

    if (!game || !game.id || !game.slug || !game.title || !game.embedUrl) {
      return NextResponse.json({ error: 'Missing required game fields' }, { status: 400 });
    }

    const currentGames = await getCustomGames();
    const existingIndex = currentGames.findIndex(
      (g) => g.id === game.id || g.slug === game.slug
    );

    let updated: Game[];
    if (existingIndex >= 0) {
      currentGames[existingIndex] = { ...currentGames[existingIndex], ...game };
      updated = currentGames;
    } else {
      updated = [game, ...currentGames];
    }

    await saveCustomGames(updated);
    return NextResponse.json({ success: true, action: 'saved', game, totalCustom: updated.length });
  } catch (error: any) {
    console.error('Admin add game API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
