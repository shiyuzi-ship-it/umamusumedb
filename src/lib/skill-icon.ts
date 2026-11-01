export const SKILL_ICON_PLACEHOLDER = '/img/skills/placeholder.webp';
/** Real GameTora icon url, or undefined for the shared placeholder (so it is not used as og:image / structured-data image). */
export const realSkillIcon = (url?: string | null) => (url && url !== SKILL_ICON_PLACEHOLDER ? url : undefined);
