// Build-time singleton: the schedule is computed from public/data/*.json on every build, so the weekly data refresh updates the page.
import characters from '../../public/data/characters.json';
import cards from '../../public/data/supportCards.json';
import releases from '../../public/data/releases.json';
import { buildSchedule } from './release-schedule';

export const schedule = buildSchedule(characters as any[], cards as any[]);
export const scheduleUpdated = String((releases as any).generatedAt ?? '').slice(0, 10);
