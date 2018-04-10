import { extractI18n } from './utils';
import { CONTENT_TYPE_BY_ID, CT_VIDEO_PROGRAM, EVENT_CONTENT_TYPES, LECTURE_CONTENT_TYPES } from './consts';

const API_BACKEND = process.env.NODE_ENV !== 'production' ?
  process.env.REACT_APP_MDB_URL :
  'http://app.mdb.bbdomain.org/';

const Fetcher = (path, cb) => fetch(`${API_BACKEND}${path}`)
  .then((response) => {
    if (response.ok) {
      return response.json().then(data => cb(data));
    }
    throw new Error('Network response was not ok.');
  })
  .catch(ex => console.log(`get ${path}`, ex));

export const fetchSources = cb => Fetcher('hierarchy/sources/', cb);

export const fetchTags = cb => Fetcher('hierarchy/tags/', cb);

export const fetchCollections = (cb) => {
  const contentTypes = EVENT_CONTENT_TYPES
    .concat(LECTURE_CONTENT_TYPES)
    .concat([CT_VIDEO_PROGRAM])
    .map(x => `content_type=${x}`)
    .join('&');
  const pageSize     = 1000;
  const path         = `rest/collections/?${contentTypes}&page_size=${pageSize}`;

  let page     = 1;
  let total    = 0;
  const byType = new Map();

  const processPage = (data) => {
    // process page data
    total += data.data.length;
    data.data.forEach((x) => {
      const langOrder = ['he', 'en', 'ru'];
      if (x.properties.default_language) {
        langOrder.unshift(x.properties.default_language);
      }
      x.name = extractI18n(x.i18n, langOrder, ['name'])[0];  // eslint-disable-line no-param-reassign
      x.type = CONTENT_TYPE_BY_ID[x.type_id];  // eslint-disable-line no-param-reassign
      if (!byType.has(x.type)) {
        byType.set(x.type, []);
      }
      byType.get(x.type).push(x);
    });

    // next page or done ?
    if (total < data.total) {
      Fetcher(`${path}&page_no=${++page}`, processPage);
    } else {
      cb(byType);
    }
  };

  Fetcher(`${path}&page_no=${page}`, processPage);
};
