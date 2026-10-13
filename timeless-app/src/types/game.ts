export type GameProvider =
  | 'gamedistribution'
  | 'gamemonetize'
  | 'gamepix'
  | 'famobi'
  | 'playgama'
  | 'custom';

export type GameOrientation = 'landscape' | 'portrait' | 'both';

export type GameCategory =
  | 'action'
  | 'racing'
  | 'puzzle'
  | 'sports'
  | 'shooting'
  | 'multiplayer'
  | '2-player'
  | 'adventure'
  | 'arcade'
  | 'casual';

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructions: string;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  embedType: 'iframe' | 'script';
  embedUrl: string;
  provider: GameProvider;
  providerGameId?: string;
  width?: number;
  height?: number;
  orientation: GameOrientation;
  mobileFriendly: boolean;
  category: GameCategory;
  tags: string[];
  playsCount: number;
  likes: number;
  dislikes: number;
  rating: number; // e.g. 4.8 / 5
  developer?: string;
  releaseDate?: string;
  featured?: boolean;
  isNew?: boolean;
  isHot?: boolean;
  isTopRated?: boolean;
  badge?: 'TOP RATED' | 'NEW' | 'HOT' | 'POPULAR';
  bentoSize?: '1x1' | '2x1' | '2x2'; // For homepage mosaic
}

export interface CategoryInfo {
  slug: GameCategory;
  name: string;
  icon: string;
  description: string;
  gradient: string;
}
