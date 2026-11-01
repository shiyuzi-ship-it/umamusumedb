import { describe, it, expect } from 'vitest';
// @ts-ignore
import { charName, cardName, skillName, skillDesc } from '../localized.js';

describe('localized fallbacks keep the original text', () => {
  const ch: any = { name_en: 'A (T)', name_jp: 'ア（タ）', title_jp: 'タ', i18n: { zh: { name: '甲', title: null }, ko: { name: '가', title: '제목' } } };
  it('uses the Japanese title when no localized title exists', () => {
    expect(charName(ch, 'zh')).toBe('甲 (タ)');
    expect(charName(ch, 'ko')).toBe('가 (제목)');
  });
  it('cards too', () => {
    expect(cardName({ name_jp: 'x[y]', title_jp: 'y', i18n: { zh: { name: '乙', title: null } } }, 'zh')).toBe('乙 [y]');
  });
  it('JP-only skills without translation show the original, global ones keep English', () => {
    const jp: any = { server: 'jp', name_en: 'Fan TL', name_jp: '原名', description_en: 'fan', description_jp: '原文', i18n: {} };
    expect(skillName(jp, 'ko')).toBe('原名');
    expect(skillName(jp, 'zh')).toBe('原名');
    expect(skillDesc(jp, 'zh')).toBe('原文');
    const gl: any = { server: 'global', name_en: 'Name', name_jp: '名', description_en: 'official', description_jp: '文', i18n: {} };
    expect(skillDesc(gl, 'ko')).toBe('official');
    expect(skillName(gl, 'ko')).toBe('Name');
    expect(skillDesc({ ...gl, i18n: { ko: { name: 'k', desc: 'kd' } } }, 'ko')).toBe('kd');
  });
});
