// Use these for immutable default values
export const EMPTY_ARRAY  = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze({});

export const getUploadOptions = (roles, content_type) => {
    let archive_typist = roles.find(r => r === "archive_typist");
    let archive_media = roles.find(r => r === "archive_media");
    if(content_type === "SOURCE") {
        return [
            { value: 'source', text: 'Text', icon: 'file video outline'},
            { value: 'source-scan', text: 'Scan', icon: 'sun'},
        ]
    } else {
        return [
            { value: 'akladot', text: ' ‏הקלדות', icon: 'file word outline', disabled: (!archive_typist || content_type === "ARTICLES") },
            { value: 'tamlil', text: 'תמליל', icon: 'indent', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'kitei-makor', text: 'קיטעי-מקור', icon: 'copyright', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'sirtutim', text: ' ‏שרטוטים', icon: 'edit', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'dibuv', text: 'דיבוב', icon: 'translate', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'research-material', text: 'נספחים', icon: 'copy', disabled: (archive_typist || content_type === "ARTICLES") },
            { value: 'aricha', text: ' עריכה', icon: 'paint brush', disabled: true},
            { value: 'declamation', text: ' דיקלום', icon: 'unmute', disabled: true},
            { value: 'article', text: 'מאמרים ', icon: 'newspaper', disabled: (archive_typist || content_type !== "ARTICLES") },
            { value: 'publication', text: 'פירסומים ', icon: 'announcement', disabled: (archive_typist || content_type !== "ARTICLES") },
            { value: 'media', text: 'Media', icon: 'file video outline', disabled: !archive_media },
            { value: 'summary', text: 'Summary', icon: 'sun'},
        ]
    }
};

export const getContentOptions = (roles, type) => {
    const audio = mime_list[type] === "mp3";
    let disabled = true;
    if(roles.find(r => r === "archive_mekorot")) {
        disabled = false;
    }
    if(roles.find(r => r === "archive_audio-maamarim") && audio) {
        disabled = false;
    }
    return [
        { value: 'LESSONS', text: ' ‏שיעור', icon: 'student' },
        { value: 'SOURCE', text: ' ‏מקורות', icon: 'sitemap', disabled},
        { value: 'LIKUTIM', text: 'ליקוטים', icon: 'tasks' },
        { value: 'WEBINARS', text: ' ‏וובינר', icon: 'conversation' },
        { value: 'PROGRAMS', text: ' ‏תוכנית', icon: 'record' },
        { value: 'CLIPS', text: ' ‏קליפ', icon: 'film' },
        { value: 'MEALS', text: ' ‏סעודה', icon: 'food' },
        // { value: 'OTHER', text: ' ‏אחר', icon: 'unordered list' },
        { value: 'ARTICLES', text: 'מאמרים ', icon: 'newspaper' },
        { value: 'BLOG_POST', text: 'Blog-Post', icon: 'unmute' },
        //{ value: 'PUBLICATION', text: 'פירסומים ', icon: 'announcement' },
    ];
};

export const upload_extensions = {
    "akladot": ["doc","docx"],
    "tamlil": ["doc","docx"],
    "kitei-makor": ["doc","docx"],
    "likutim": ["doc","docx","mp3"],
    "research-material": ["doc","docx"],
    "sirtutim": ["zip"],
    "dibuv": ["wav"],
    "aricha": ["mp4","mpg"],
    "dgima": ["mp4","mp3"],
    "article": ["doc","docx","pdf"],
    "publication": ["zip"],
    "declamation": ["mp3"],
    "source": ["doc","docx","pdf","mp3"],
    "source-scan": ["pdf"],
    "media": ["mp4","mp3"],
    "summary": ["doc","docx"],
};

export const DCT_OPTS = {
    LESSONS: ['LESSON_PART','FULL_LESSON','WOMEN_LESSON','KTAIM_NIVCHARIM'],
    PROGRAMS: ['VIDEO_PROGRAM_CHAPTER'],
    WEBINARS: ['VIRTUAL_LESSON'],
    CLIPS: ['CLIP'],
    MEALS: ['MEAL'],
    OTHER: ['LECTURE','FRIENDS_GATHERING','EVENT_PART','TRAINING'],
    ARTICLES: ['ARTICLE'],
    BLOG_POST: ['BLOG_POST'],
    LIKUTIM: ['LIKUTIM'],
};

export const mime_list = {
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "video/mp4": "mp4",
    "application/pdf": "pdf",
    "video/mpeg": "mpg",
    "application/zip": "zip",
    "application/x-zip-compressed": "zip"
};

export const langs_bb = ["heb","rus","eng","spa","fre","ita","ger","por","trk","bul","geo","ron","hun","swe","lit","hrv","jpn","slv","pol","nor","lav","ukr","chn","amh","hin","per","ara","ind"];

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
    { key: 'et', value: 'amh', flag: 'et', text: 'Amharic' },
    { key: 'in', value: 'hin', flag: 'in', text: 'Hindi' },
    { key: 'ir', value: 'per', flag: 'ir', text: 'Persian' },
    { key: 'ar', value: 'ara', flag: 'sa', text: 'Arabic' },
    { key: 'id', value: 'ind', flag: 'id', text: 'Indonesian' },
    { key: 'zz', value: 'mlt', text: 'Multi', icon: 'world' },
];

export const insert_language_options = [
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
    { key: 'et', value: 'amh', flag: 'et', text: 'Amharic' },
    { key: 'in', value: 'hin', flag: 'in', text: 'Hindi' },
    { key: 'ir', value: 'per', flag: 'ir', text: 'Persian' },
    { key: 'ar', value: 'ara', flag: 'sa', text: 'Arabic' },
    { key: 'id', value: 'ind', flag: 'id', text: 'Indonesian' },
    { key: 'cs', value: 'cze', flag: 'cz', text: 'Czech' },
    { key: 'zz', value: 'mlt', text: 'Multi', icon: 'world' },
];


export const dep_options = [
    { key: 'he', value: 'heb', flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: 'rus', flag: 'ru', text: 'Russian' },
    { key: 'en', value: 'eng', flag: 'us', text: 'English' },
    { key: 'es', value: 'spa', flag: 'es', text: 'Spanish' },
];

export const ui_options = [
    { key: 'he', value: 'he', flag: 'il', text: 'Hebrew' },
    { key: 'ru', value: 'ru', flag: 'ru', text: 'Russian' },
    { key: 'en', value: 'en', flag: 'us', text: 'English' },
    { key: 'es', value: 'es', flag: 'es', text: 'Spanish' },
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

export const LANG_HEBREW     = 'heb';
export const LANG_ENGLISH    = 'eng';
export const LANG_RUSSIAN    = 'rus';
export const LANG_SPANISH    = 'spa';
export const LANG_ITALIAN    = 'ita';
export const LANG_GERMAN     = 'ger';
export const LANG_DUTCH      = 'dut';
export const LANG_FRENCH     = 'fre';
export const LANG_PORTUGUESE = 'por';
export const LANG_TURKISH    = 'trk';
export const LANG_POLISH     = 'pol';
export const LANG_ARABIC     = 'ara';
export const LANG_HUNGARIAN  = 'hun';
export const LANG_FINNISH    = 'fin';
export const LANG_LITHUANIAN = 'lit';
export const LANG_JAPANESE   = 'jpn';
export const LANG_BULGARIAN  = 'bul';
export const LANG_GEORGIAN   = 'geo';
export const LANG_NORWEGIAN  = 'nor';
export const LANG_SWEDISH    = 'swe';
export const LANG_CROATIAN   = 'hrv';
export const LANG_CHINESE    = 'chn';
export const LANG_PERSIAN    = 'per';
export const LANG_ROMANIAN   = 'ron';
export const LANG_HINDI      = 'hin';
export const LANG_UKRAINIAN  = 'ukr';
export const LANG_SLOVENIAN  = 'slv';
export const LANG_LATVIAN    = 'lit';
export const LANG_AMHARIC    = 'amh';
export const LANG_INDONESIAN = 'ind';
export const LANG_MULTI      = 'mtl';
export const LANG_UNKNOWN    = 'xxx';

export const LANG_MAP = {
    [LANG_HEBREW]: { text: 'Hebrew', value: LANG_HEBREW, flag: 'il' },
    [LANG_ENGLISH]: { text: 'English', value: LANG_ENGLISH, flag: 'us' },
    [LANG_RUSSIAN]: { text: 'Russian', value: LANG_RUSSIAN, flag: 'ru' },
    [LANG_SPANISH]: { text: 'Spanish', value: LANG_SPANISH, flag: 'es' },
    [LANG_ITALIAN]: { text: 'Italian', value: LANG_ITALIAN, flag: 'it' },
    [LANG_GERMAN]: { text: 'German', value: LANG_GERMAN, flag: 'de' },
    [LANG_DUTCH]: { text: 'Dutch', value: LANG_DUTCH, flag: 'nl' },
    [LANG_FRENCH]: { text: 'French', value: LANG_FRENCH, flag: 'fr' },
    [LANG_PORTUGUESE]: { text: 'Portuguese', value: LANG_PORTUGUESE, flag: 'pt' },
    [LANG_TURKISH]: { text: 'Turkish', value: LANG_TURKISH, flag: 'tr' },
    [LANG_POLISH]: { text: 'Polish', value: LANG_POLISH, flag: 'pl' },
    [LANG_ARABIC]: { text: 'Arabic', value: LANG_ARABIC, flag: 'sa' },
    [LANG_HUNGARIAN]: { text: 'Hungarian', value: LANG_HUNGARIAN, flag: 'hu' },
    [LANG_FINNISH]: { text: 'Finnish', value: LANG_FINNISH, flag: 'fi' },
    [LANG_LITHUANIAN]: { text: 'Lithuanian', value: LANG_LITHUANIAN, flag: 'lt' },
    [LANG_JAPANESE]: { text: 'Japanese', value: LANG_JAPANESE, flag: 'jp' },
    [LANG_BULGARIAN]: { text: 'Bulgarian', value: LANG_BULGARIAN, flag: 'bg' },
    [LANG_GEORGIAN]: { text: 'Georgian', value: LANG_GEORGIAN, flag: 'ge' },
    [LANG_NORWEGIAN]: { text: 'Norwegian', value: LANG_NORWEGIAN, flag: 'no' },
    [LANG_SWEDISH]: { text: 'Swedish', value: LANG_SWEDISH, flag: 'se' },
    [LANG_CROATIAN]: { text: 'Croatian', value: LANG_CROATIAN, flag: 'hr' },
    [LANG_CHINESE]: { text: 'Chinese', value: LANG_CHINESE, flag: 'cn' },
    [LANG_PERSIAN]: { text: 'Persian', value: LANG_PERSIAN, flag: 'ir' },
    [LANG_ROMANIAN]: { text: 'Romanian', value: LANG_ROMANIAN, flag: 'ro' },
    [LANG_HINDI]: { text: 'Hindi', value: LANG_HINDI, flag: 'in' },
    [LANG_UKRAINIAN]: { text: 'Ukrainian', value: LANG_UKRAINIAN, flag: 'ua' },
    [LANG_SLOVENIAN]: { text: 'Slovenian', value: LANG_SLOVENIAN, flag: 'si' },
    [LANG_LATVIAN]: { text: 'Latvian', value: LANG_LATVIAN, flag: 'lv' },
    [LANG_AMHARIC]: { text: 'Amharic', value: LANG_AMHARIC, flag: 'et' },
    [LANG_INDONESIAN]: { text: 'Indonesian', value: LANG_INDONESIAN, flag: 'id' },
    [LANG_MULTI]: { text: 'Multi', value: LANG_MULTI },
    [LANG_UNKNOWN]: { text: 'Unknown', value: LANG_UNKNOWN },
};

export const PRODUCT_FILE_TYPES = {
    [LANG_HEBREW]: {
        video: [
            "16x9_Clean",
            "16x9_Logo-Kab",
            "16x9_No-LOGO",
            "4x4_FB",
            "16x9_Logo-Kab_SUB",
            "16x9_No-LOGO_SUB",
            "4x4_FB_SUB",
            "16x9_Telegram_8M",
            "16x9_Whatsapp_64M",
            "4x4",
            "4x4_KAB",
        ],
        audio: [
            "voice",
            "music",
            "sfx",
            "mix"
        ],
        other: [
            "Text",
            "SRT",
            "text_masah",
            "text_roller",
            "text_tzitut",
        ]
    },
    [LANG_RUSSIAN]: {
        video: [
            "16x9_Clean",
            "16x9_Logo-Kab",
            "16x9_Logo-Kab-Strelka",
            "16x9_Logo-OpTV",
            "16x9_Logo-MAK",
            "16x9_Strelka",
            "4x4_MAK",
            "4x4_OpTV",
            "16x9_Logo-Kab_SUB",
            "16x9_Logo-Kab-Strelka_SUB",
            "16x9_Logo-OpTV_SUB",
            "16x9_Logo-MAK_SUB",
            "16x9_Strelka_SUB",
            "4x4_MAK_SUB",
            "4x4_OpTV_SUB",
            "4x4",
            "4x4_KAB",
        ],
        audio: [
            "voice",
            "music",
            "sfx",
            "mix"
        ],
        other: [
            "Text",
            "SRT",
            "text_masah",
            "text_roller",
            "text_tzitut",
        ]
    }
};

export const PRODUCT_FILE_TYPES_ALL = {
    video: [
        "16x9_Clean",
        "16x9_Logo-Kab",
        "16x9_No-LOGO",
        "16x9_Logo-Kab_SUB",
        "16x9_No-LOGO_SUB",
        "4x4",
        "4x4_KAB",
    ],
    audio: [
        "voice",
        "music",
        "sfx",
        "mix"
    ],
    other: [
        "Text",
        "SRT",
        "text_masah",
        "text_roller",
        "text_tzitut",
    ]
}

export const PRODUCT_FILE_TYPES_LIST = ["16x9_Clean", "16x9_Logo-Kab", "16x9_Logo-Kab-Strelka", "16x9_Logo-OpTV", "16x9_Logo-MAK",
        "16x9_Strelka", "4x4_MAK", "4x4_OpTV", "16x9_Logo-Kab_SUB", "16x9_Logo-Kab-Strelka_SUB", "16x9_Logo-OpTV_SUB", "16x9_Telegram_8M", "16x9_Whatsapp_64M",
        "16x9_Logo-MAK_SUB", "16x9_Strelka_SUB", "4x4_MAK_SUB", "4x4_OpTV_SUB", "4x4", "4x4_KAB", "voice", "music", "sfx", "mix", "Text", "SRT", "text_masah",
        "text_roller", "text_tzitut"].map(data => {
    return ({key: data, value: data, text: data})})


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
  ar: 'ara',
  id: 'ind',
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

export const WF_LANGUAGES = {"eng":"en","heb":"he","rus":"ru","spa":"es","ita":"it","ger":"de","dut":"nl","fre":"fr","por":"pt","trk":"tr","pol":"pl","ara":"ar","ind":"id","hun":"hu","fin":"fi","lit":"lt","jpn":"ja","bul":"bg","geo":"ka","nor":"no","swe":"sv","hrv":"hr","chn":"zh","far":"fa","ron":"ro","hin":"hi","mkd":"mk","slv":"sl","lav":"lv","slk":"sk","cze":"cs","ukr":"ua","mlt":"zz","unk":"xx"}

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
export const CT_RESEARCH_MATERIAL     = 'RESEARCH_MATERIAL';
export const CT_BLOG_POST             = 'BLOG_POST';
export const CT_KTAIM_NIVCHARIM       = 'KTAIM_NIVCHARIM';
export const CT_SOURCE                = 'SOURCE';
export const CT_LIKUTIM               = 'LIKUTIM';

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
    44: CT_BLOG_POST,
    45: CT_RESEARCH_MATERIAL,
    46: CT_KTAIM_NIVCHARIM,
    47: CT_SOURCE,
    48: CT_LIKUTIM,
};

export const CONTENT_ID_BY_TYPE = function() {
    let ret = {};
    for(let key in CONTENT_TYPE_BY_ID) {
        ret[CONTENT_TYPE_BY_ID[key]] = key;
    }
    return ret;
}()

export const CONTENT_TYPES_MAPPINGS = {
    [CT_LESSON_PART]: { collection_type: CT_DAILY_LESSON, pattern: 'lesson' },
    [CT_FULL_LESSON]: { collection_type: CT_DAILY_LESSON, pattern: 'lesson' },
    [CT_KITEI_MAKOR]: { collection_type: null, pattern: 'kitei-makor' },
    [CT_LELO_MIKUD]: { collection_type: null, pattern: 'lelo-mikud' },
    [CT_KTAIM_NIVCHARIM]: { collection_type: null, pattern: 'ktaim-nivcharim' },
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
    [CT_BLOG_POST]: { collection_type: null, pattern: 'declamation' },
    [CT_RESEARCH_MATERIAL]: { collection_type: null, pattern: 'research-material' },
    [CT_LIKUTIM]: { collection_type: null, pattern: 'likutim' },
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

export const JOB_STATUS = [
    {name: "M", desc: "Materials", status: "materials", value: false},
    {name: "GP", desc: "Got Product", status: "product", value: false},
    {name: "TC", desc: "To Censor", status: "censored", value: false},
    {name: "C", desc: "Censor Checked", status: "checked", value: false},
    {name: "TF", desc: "To Fix", status: "fix_req", value: false},
    {name: "F", desc: "Fix Done", status: "fixed", value: false},
    {name: "TS", desc: "To Sub", status: "sub_req", value: false},
    {name: "S", desc: "Sub Done", status: "subed", value: false},
    {name: "TP", desc: "To Post", status: "post_req", value: false},
    {name: "P", desc: "Post Done", status: "subed", value: false},
    {name: "J", desc: "Job Finished", status: "wfsend", value: false},
]
