// Client-safe helper for the tool UIs. Labels are produced at build time by src/lib/tool-strings (server side) and
// passed to each island as the `labels` prop; a missing key falls back to the key itself.
export type Labels = Record<string, string>;
export type TFn = (key: string, vars?: Record<string, string | number>) => string;
export function makeT(labels?: Labels): TFn {
  return (key, vars) => {
    const s = labels?.[key] ?? key;
    return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
  };
}
