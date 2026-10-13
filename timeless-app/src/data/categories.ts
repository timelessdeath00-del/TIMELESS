import { CategoryInfo } from '@/types/game';

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'action',
    name: 'Action',
    icon: 'Sword',
    description: 'Fast-paced action, combat, and thrill-seeking games',
    gradient: 'from-red-500 to-orange-500',
  },
  {
    slug: 'racing',
    name: 'Racing',
    icon: 'Car',
    description: 'High-speed supercars, drift tracks, and motorbike challenges',
    gradient: 'from-amber-500 to-red-500',
  },
  {
    slug: 'puzzle',
    name: 'Puzzle',
    icon: 'Puzzle',
    description: 'Brain teasers, physics puzzles, and logic challenges',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    slug: 'sports',
    name: 'Sports',
    icon: 'Trophy',
    description: 'Soccer penalty shootouts, basketball hoops, and tennis showdowns',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    slug: 'shooting',
    name: 'Shooting',
    icon: 'Crosshair',
    description: 'FPS arena shooters, sniper missions, and target practice',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    slug: 'multiplayer',
    name: 'Multiplayer',
    icon: 'Users',
    description: 'Battle players worldwide in real-time online arenas',
    gradient: 'from-violet-600 to-indigo-600',
  },
  {
    slug: '2-player',
    name: '2 Player',
    icon: 'Gamepad2',
    description: 'Head-to-head multiplayer fun on the same screen or keyboard',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    slug: 'adventure',
    name: 'Adventure',
    icon: 'Compass',
    description: 'Explore dangerous dungeons, magical realms, and open worlds',
    gradient: 'from-teal-500 to-green-500',
  },
  {
    slug: 'arcade',
    name: 'Arcade',
    icon: 'Sparkles',
    description: 'Retro classics, endless runners, and addictive quick plays',
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    slug: 'casual',
    name: 'Casual',
    icon: 'Smile',
    description: 'Relaxing, bite-sized games to unwind and have fun anytime',
    gradient: 'from-cyan-400 to-blue-500',
  },
];
