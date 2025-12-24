exports.extractPlaceholders = (text) => {
  return [...text.matchAll(/\[\[(.*?)\]\]/g)].map(m => m[1]);
};
