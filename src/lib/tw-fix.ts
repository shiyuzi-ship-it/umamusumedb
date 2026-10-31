// Post-OpenCC fixes for mainland terms that OpenCC's twp profile leaves in Taiwan text (and the TW-server stat terms).
export const twFix = (s: string) =>
  s.replace(/耐力/g, '持久力').replace(/毅力/g, '意志力')
    .replace(/型別/g, '類型').replace(/跟蹤/g, '追蹤').replace(/訪問/g, '造訪').replace(/反饋/g, '回饋');
export const twFixLegal = (s: string) => twFix(s).replace(/通過/g, '透過');
