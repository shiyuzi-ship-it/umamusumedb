import { supportCards } from '@/lib/static-content';
import releases from '../../public/data/releases.json';
import { buildRankings } from './card-rankings';

export const rankings = buildRankings(supportCards as any[]);
export const rankingsUpdated = String((releases as any).generatedAt ?? '').slice(0, 10);
