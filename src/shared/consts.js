// Use these for immutable default values
export const EMPTY_ARRAY  = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze({});

export const content_options = [
    { value: 'LESSON_PART', text: ' ‏שיעור', icon: 'student' },
    //{ value: 'FRIENDS_GATHERING', text: ' ‏חברים', icon: 'users' },
    { value: 'VIRTUAL_LESSON', text: ' ‏וובינר', icon: 'conversation' },
    { value: 'VIDEO_PROGRAM_CHAPTER', text: ' ‏תוכנית', icon: 'record' },
    { value: 'CLIP', text: ' ‏קליפ', icon: 'film' },
    { value: 'MEAL', text: ' ‏סעודה', icon: 'food' },
    { value: 'OTHER', text: ' ‏אחר', icon: 'unordered list' },
    { value: 'ARTICLE', text: 'מאמרים ', icon: 'newspaper' },
    //{ value: 'PUBLICATION', text: 'פירסומים ', icon: 'announcement' },
];

export const article_options = [
    { value: 'article', text: 'מאמרים ', icon: 'newspaper' },
    { value: 'publication', text: 'פירסומים ', icon: 'announcement' },
];

export const upload_options = [
    //{ value: 'article', text: 'מאמרים ', icon: 'newspaper' },
    //{ value: 'publication', text: 'פירסומים ', icon: 'announcement', disabled: true },
    { value: 'dibuv', text: 'דיבוב', icon: 'translate' },
    { value: 'aricha', text: ' עריכה', icon: 'paint brush', disabled: true},
    { value: 'sirtutim', text: ' ‏שרטוטים', icon: 'edit' },
    { value: 'kitei-makor', text: 'קיטעי-מקור', icon: 'copyright' },
    { value: 'tamlil', text: 'תמליל', icon: 'indent' },
    { value: 'akladot', text: ' ‏הקלדות', icon: 'file word outline' },
];

export const mime_list = {
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "video/mp4": "mp4",
    "application/zip": "zip"
};

export const language_options = [
    { key: 'he', value: 'heb', flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: 'rus', flag: 'ru', text: 'Russian' },
    { key: 'en', value: 'eng', flag: 'us', text: 'English' },
    { key: 'es', value: 'spa', flag: 'es', text: 'Spanish' },
    { key: 'fr', value: 'fre', flag: 'fr', text: 'French' },
    { key: 'it', value: 'ita', flag: 'it', text: 'Italian' },
    { key: 'de', value: 'ger', flag: 'de', text: 'German' },
    { key: 'tr', value: 'trk', flag: 'tr', text: 'Turkish' },
    { key: 'pt', value: 'por', flag: 'pt', text: 'Portuguese' },
    { key: 'bg', value: 'bul', flag: 'bg', text: 'Bulgarian' },
    { key: 'ka', value: 'geo', flag: 'ge', text: 'Georgian' },
    { key: 'ro', value: 'ron', flag: 'ro', text: 'Romanian' },
    { key: 'hu', value: 'hun', flag: 'hu', text: 'Hungarian' },
    { key: 'sv', value: 'swe', flag: 'se', text: 'Swedish' },
    { key: 'lt', value: 'lit', flag: 'lt', text: 'Lithuanian' },
    { key: 'hr', value: 'hrv', flag: 'hr', text: 'Croatian' },
    { key: 'ja', value: 'jpn', flag: 'jp', text: 'Japanese' },
    { key: 'sl', value: 'slv', flag: 'si', text: 'Slovenian' },
    { key: 'pl', value: 'pol', flag: 'pl', text: 'Polish' },
    { key: 'no', value: 'nor', flag: 'no', text: 'Norwegian' },
    { key: 'lv', value: 'lav', flag: 'lv', text: 'Latvian' },
    { key: 'ua', value: 'ukr', flag: 'ua', text: 'Ukrainian' },
    { key: 'nl', value: 'dut', flag: 'nl', text: 'Dutch' },
    { key: 'cn', value: 'chn', flag: 'cn', text: 'Chinese' },
    { key: 'zz', value: 'mlt', text: 'Multi', icon: 'world' },
];

export const LANGUAGES = [
  { text: 'עברית', value: 'heb' },
  { text: 'אנגלית', value: 'eng' },
  { text: 'רוסית', value: 'rus' },
  { text: 'ספרדית', value: 'spa' },
  { text: 'אוקראינית', value: 'ukr' },
  { text: 'איטלקית', value: 'ita' },
  { text: 'גרמנית', value: 'ger' },
  { text: 'הולנדית', value: 'dut' },
  { text: 'צרפתית', value: 'fre' },
  { text: 'פורטוגזית', value: 'por' },
  { text: 'טורקית', value: 'trk' },
  { text: 'פולנית', value: 'pol' },
  { text: 'ערבית', value: 'arb' },
  { text: 'הונגרית', value: 'hun' },
  { text: 'פינית', value: 'fin' },
  { text: 'ליטאית', value: 'lit' },
  { text: 'יפנית', value: 'jpn' },
  { text: 'בולגרית', value: 'bul' },
  { text: 'גאורגית', value: 'geo' },
  { text: 'נורבגית', value: 'nor' },
  { text: 'שבדית', value: 'swe' },
  { text: 'קרואטית', value: 'hrv' },
  { text: 'סינית', value: 'chn' },
  { text: 'פרסית', value: 'far' },
  { text: 'רומנית', value: 'ron' },
  { text: 'הינדי', value: 'hin' },
  { text: 'מקדונית', value: 'mkd' },
  { text: 'סלובנית', value: 'slv' },
  { text: 'לטבית', value: 'lav' },
  { text: 'סלובקית', value: 'slk' },
  { text: 'צ\'כית', value: 'cze' },
];

export const MDB_LANGUAGES = {
  en: 'eng',
  he: 'heb',
  ru: 'rus',
  es: 'spa',
  it: 'ita',
  de: 'ger',
  nl: 'dut',
  fr: 'fre',
  pt: 'por',
  tr: 'trk',
  pl: 'pol',
  ar: 'arb',
  hu: 'hun',
  fi: 'fin',
  lt: 'lit',
  ja: 'jpn',
  bg: 'bul',
  ka: 'geo',
  no: 'nor',
  sv: 'swe',
  hr: 'hrv',
  zh: 'chn',
  fa: 'far',
  ro: 'ron',
  hi: 'hin',
  mk: 'mkd',
  sl: 'slv',
  lv: 'lav',
  sk: 'slk',
  cs: 'cze',
  ua: 'ukr',
  zz: 'mlt',
  xx: 'unk',
};

export const LECTURERS = [
  { text: 'רב', value: 'rav' },
  { text: 'בלי רב', value: 'norav' },
];

// Collection Types
export const CT_DAILY_LESSON       = 'DAILY_LESSON';
export const CT_SPECIAL_LESSON     = 'SPECIAL_LESSON';
export const CT_FRIENDS_GATHERINGS = 'FRIENDS_GATHERINGS';
export const CT_CONGRESS           = 'CONGRESS';
export const CT_VIDEO_PROGRAM      = 'VIDEO_PROGRAM';
export const CT_LECTURE_SERIES     = 'LECTURE_SERIES';
export const CT_CHILDREN_LESSONS   = 'CHILDREN_LESSONS';
export const CT_WOMEN_LESSONS      = 'WOMEN_LESSONS';
export const CT_VIRTUAL_LESSONS    = 'VIRTUAL_LESSONS';
export const CT_MEALS              = 'MEALS';
export const CT_HOLIDAY            = 'HOLIDAY';
export const CT_PICNIC             = 'PICNIC';
export const CT_UNITY_DAY          = 'UNITY_DAY';
export const CT_CLIPS              = 'CLIPS';
export const CT_ARTICLES           = 'ARTICLES';

// Content Unit Types
export const CT_LESSON_PART           = 'LESSON_PART';
export const CT_LECTURE               = 'LECTURE';
export const CT_CHILDREN_LESSON       = 'CHILDREN_LESSON';
export const CT_WOMEN_LESSON          = 'WOMEN_LESSON';
export const CT_VIRTUAL_LESSON        = 'VIRTUAL_LESSON';
export const CT_FRIENDS_GATHERING     = 'FRIENDS_GATHERING';
export const CT_MEAL                  = 'MEAL';
export const CT_VIDEO_PROGRAM_CHAPTER = 'VIDEO_PROGRAM_CHAPTER';
export const CT_FULL_LESSON           = 'FULL_LESSON';
export const CT_ARTICLE               = 'ARTICLE';
export const CT_UNKNOWN               = 'UNKNOWN';
export const CT_EVENT_PART            = 'EVENT_PART';
export const CT_CLIP                  = 'CLIP';
export const CT_TRAINING              = 'TRAINING';
export const CT_KITEI_MAKOR           = 'KITEI_MAKOR';
export const CT_PUBLICATION           = 'PUBLICATION';
export const CT_LELO_MIKUD            = 'LELO_MIKUD';

export const EVENT_CONTENT_TYPES   = [CT_CONGRESS, CT_HOLIDAY, CT_PICNIC, CT_UNITY_DAY];
export const LECTURE_CONTENT_TYPES = [CT_LECTURE_SERIES, CT_CHILDREN_LESSONS, CT_WOMEN_LESSONS, CT_VIRTUAL_LESSONS];

export const ARTIFACT_TYPES = [
  { text: 'תוכן מרכזי', value: 'main' },
  { text: 'קטעי מקור', value: CT_KITEI_MAKOR },
  { text: 'ללא קבוצת מיקוד', value: CT_LELO_MIKUD, disabled: true },
];

export const CONTENT_TYPE_BY_ID = {
  1: CT_DAILY_LESSON,
  2: CT_SPECIAL_LESSON,
  3: CT_FRIENDS_GATHERINGS,
  4: CT_CONGRESS,
  5: CT_VIDEO_PROGRAM,
  6: CT_LECTURE_SERIES,
  7: CT_MEALS,
  8: CT_HOLIDAY,
  9: CT_PICNIC,
  10: CT_UNITY_DAY,
  11: CT_LESSON_PART,
  12: CT_LECTURE,
  13: CT_CHILDREN_LESSON,
  14: CT_WOMEN_LESSON,
  16: CT_VIRTUAL_LESSON,
  18: CT_FRIENDS_GATHERING,
  19: CT_MEAL,
  20: CT_VIDEO_PROGRAM_CHAPTER,
  21: CT_FULL_LESSON,
  22: CT_ARTICLE,
  27: CT_UNKNOWN,
  28: CT_EVENT_PART,
  29: CT_CLIP,
  30: CT_TRAINING,
  31: CT_KITEI_MAKOR,
  32: CT_VIRTUAL_LESSONS,
  33: CT_CHILDREN_LESSONS,
  34: CT_WOMEN_LESSONS,
  35: CT_CLIPS,
  36: CT_PUBLICATION,
  37: CT_ARTICLES,
  38: CT_LELO_MIKUD,
};

export const CONTENT_TYPES_MAPPINGS = {
  [CT_LESSON_PART]: { collection_type: CT_DAILY_LESSON, pattern: 'lesson' },
  [CT_FULL_LESSON]: { collection_type: CT_DAILY_LESSON, pattern: 'lesson' },
  [CT_KITEI_MAKOR]: { collection_type: null, pattern: 'kitei-makor' },
  [CT_LELO_MIKUD]: { collection_type: null, pattern: 'lelo-mikud' },
  [CT_VIDEO_PROGRAM_CHAPTER]: { collection_type: CT_VIDEO_PROGRAM, pattern: 'program' },
  [CT_FRIENDS_GATHERING]: { collection_type: CT_FRIENDS_GATHERINGS, pattern: 'yeshivat-haverim' },
  [CT_MEAL]: { collection_type: CT_MEALS, pattern: 'seuda' },
  [CT_LECTURE]: { collection_type: CT_LECTURE_SERIES, pattern: 'lecture' },
  [CT_TRAINING]: { collection_type: null, pattern: 'training' },
  [CT_CLIP]: { collection_type: null, pattern: 'clip' },
  [CT_CHILDREN_LESSON]: { collection_type: CT_CHILDREN_LESSONS, pattern: 'children-lesson' },
  [CT_WOMEN_LESSON]: { collection_type: CT_WOMEN_LESSONS, pattern: 'women-lesson' },
  [CT_VIRTUAL_LESSON]: { collection_type: CT_VIRTUAL_LESSONS, pattern: 'vl' },
  [CT_EVENT_PART]: { collection_type: null, pattern: 'event-part' },
    [CT_ARTICLE]: { collection_type: null, pattern: 'art' },
    [CT_PUBLICATION]: { collection_type: null, pattern: 'pub' },
};

export const EVENT_PART_TYPES = [
  { text: 'שיעור', content_type: CT_LESSON_PART, pattern: 'lesson' },
  { text: 'ישיבת חברים', content_type: CT_FRIENDS_GATHERING, pattern: 'yeshivat-haverim' },
  { text: 'סעודה', content_type: CT_MEAL, pattern: 'seuda' },
  { text: 'טקס פתיחה', content_type: CT_EVENT_PART, pattern: 'tekes-ptiha' },
  { text: 'טקס סיום', content_type: CT_EVENT_PART, pattern: 'tekes-siyum' },
  { text: 'ערב פתוח', content_type: CT_EVENT_PART, pattern: 'erev-patuah' },
  { text: 'ערב תרבות', content_type: CT_EVENT_PART, pattern: 'erev-tarbut' },
  { text: 'הצגת פרויקט', content_type: CT_EVENT_PART, pattern: 'atzagat-proekt' },
  { text: 'הענקת תעודות', content_type: CT_EVENT_PART, pattern: 'haanakat-teudot' },
  { text: 'חתימת ספרים', content_type: CT_EVENT_PART, pattern: 'hatimat-sfarim' },
  { text: 'אחר', content_type: CT_EVENT_PART, pattern: 'event' },
];

export const LESSON_PARTS_OPTIONS = [{ text: 'הכנה', value: 0 }]
  .concat([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map(i => ({ text: `חלק ${i}`, value: i })));

export const DATE_FORMAT = 'YYYY-MM-DD';
