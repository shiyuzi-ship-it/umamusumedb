// Structured page content for the legal / info pages. Strings may contain trusted inline HTML (links, <strong>).
// `{L}` in an href is replaced with the locale prefix ('' for English, '/ja', '/zh', ...).
export type Block = { p: string } | { ul: string[] } | { h3: string } | { box: string };
export interface Section { id?: string; h: string; icon?: string; blocks: Block[] }
export interface Doc {
  title: string; description: string; h1: string; updated?: string; intro?: string;
  cards?: { id: string; title: string; desc: string; icon: string }[];
  sections: Section[];
}
// Authored: en, ja, zh (Simplified), ko. zh-tw is generated from zh with OpenCC (cn -> Taiwan phrases) at build time.
export type Docs = Record<'en' | 'ja' | 'zh' | 'ko', Doc>;
