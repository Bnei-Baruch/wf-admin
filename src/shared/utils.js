export const formatDate = (d) => {
  const year  = d.getFullYear();
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day   = `0${d.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};

export const today = () =>
  formatDate(new Date());

export const extractI18n = (i18ns, languages, fields) => {
  // Order i18ns by language
  const orderedI18ns = [];
  for (let i = 0; i < languages.length; i++) {
    const i18n = i18ns[languages[i]];
    if (i18n) {
      orderedI18ns.push(i18n);
    }
  }

  // Coalesce values per field
  return fields.map((x) => {
    let value;
    for (let i = 0; i < orderedI18ns.length; i++) {
      value = orderedI18ns[i][x];
      if (value) {
        break;
      }
    }
    return value;
  });
};

export const isActive = collection =>
  !Object.prototype.hasOwnProperty.call(collection.properties, 'active') || collection.properties.active;

export const findPath = (forest, uid) => {
  // Put trees in stack
  const s = [];
  for (let i = 0; i < forest.length; i++) {
    s.push(forest[i], Number.NaN);
  }

  // DFS forest to find path to requested node.
  // We simulate the recursive nature of such traversal with a marker for branching in.
  // This way we can eliminate the recursion and perform correct bookkeeping of the actual path.
  const path = [];
  while (s.length > 0) {
    const node = s.pop();
    if (Number.isNaN(node)) {  // is marker ?
      path.pop();
      continue; // eslint-disable-line no-continue
    }

    path.push(node);
    s.push(Number.NaN);
    if (node.uid === uid) {
      return path;
    }

    const childs = node.children || [];
    for (let i = 0; i < childs.length; i++) {
      s.push(childs[i]);
    }
  }

  return [];
};

export const sourcesTagsPattern = (sources, tags, major) => {
  let pattern = '';

  if (major.type) {
    const selection = major.type === 'source' ? sources : tags;
    const item      = selection[major.idx];
    if (Array.isArray(item)) {
      // pattern is the deepest node in the chain with a pattern
      for (let j = item.length - 1; j >= 0; j--) {
        const x = item[j];
        if (x.pattern) {
          pattern = x.pattern;
          break;
        }
      }
    }
  }

  // Note: We keep the 2 following paragraphs for cases where
  // major has no pattern in it's chain.
  // In such cases we take what we have if possible.

  // pattern is the deepest node in the chain with a pattern
  for (let i = 0; pattern === '' && i < tags.length; i++) {
    const tag = tags[i];
    for (let j = tag.length - 1; j >= 0; j--) {
      const t = tag[j];
      if (t.pattern) {
        pattern = t.pattern;
        break;
      }
    }
  }

  // if no tag was selected take pattern from sources, same logic as above
  for (let i = 0; pattern === '' && i < sources.length; i++) {
    const source = sources[i];
    for (let j = source.length - 1; j >= 0; j--) {
      const s = source[j];
      if (s.pattern) {
        pattern = s.pattern;
        break;
      }
    }
  }

  return pattern;
};
