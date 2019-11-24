import { mime_list, CONTENT_TYPES_MAPPINGS, MDB_LANGUAGES, DCT_OPTS} from './consts';
import moment from 'moment';

export const WFDB_STATE = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFDB_STATE : '/stdb';
export const WFRP_STATE = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFRP_STATE : '/strp';
//export const MDB_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_MDB_BACKEND : '/mdb';
export const MDB_FINDSHA = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_MDB_FINDSHA : '/sha';
export const WFDB_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFDB_BACKEND : '/wfdb';
export const WFRP_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFRP_BACKEND : '/wfrp';
export const WFSRV_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFSRV_BACKEND : '/wfapi';
export const WF_BACKEND = process.env.REACT_APP_WF_BACKEND;
export const MDB_UNIT_URL = process.env.REACT_APP_MDB_UNIT_URL;
export const SIRTUT_URL = process.env.REACT_APP_SIRTUT_URL;
export const CNV_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_CNV_BACKEND : '/cnvapi';
export const MDB_BACKEND = 'http://app.mdb.bbdomain.org/rest';
export const MDB_REST = 'http://app.mdb.bbdomain.org/rest/content_units';
const AUTH_URL = 'https://accounts.kbb1.com/auth/realms/main';

export const IVAL = 1000;

export const toHms = (totalSec) => {
    let hours = parseInt( totalSec / 3600 , 10) % 24;
    let minutes = parseInt( totalSec / 60 , 10) % 60;
    let seconds = (totalSec % 60).toFixed(2);
    if (seconds < 0) seconds = 0;
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
};

export const randomString = (len, charSet) => {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz,randomPoz+1);
    }
    return randomString;
};

const getToken = () => {
    let jwt = sessionStorage.getItem(`oidc.user:${AUTH_URL}:wf-admin`);
    let json = JSON.parse(jwt);
    return json.access_token;
};

export const mdbPost = (token, data, cb) => fetch(`${MDB_REST}`, {
    method: 'POST',
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    },
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const getData = (path, cb) => fetch(`${WFRP_BACKEND}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            return response.json().then(cb(null));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const getDataByID = (id, cb) =>  {
    fetch(`${WFRP_BACKEND}/${getEndpoint(id)}/${id}`)
        .then((response) => {
            if (response.ok) {
                return response.json().then(data => cb(data));
            } else {
                return response.json().then(cb(null));
            }
        })
        .catch(ex => console.log(`get ${id}`, ex));
};

export const getEndpoint = (id) => {
    if(id.match(/^t[\d]{10}$/)) return "trimmer";
    if(id.match(/^a[\d]{10}$/)) return "aricha";
    if(id.match(/^d[\d]{10}$/)) return "dgima";
    if(id.match(/^i[\d]{10}$/)) return "insert";
};

export const getUnits = (path, cb) => fetch(`${path}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            return cb({total: 0});
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const putData = (path, data, cb) => fetch(`${path}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const postData = (path, data, cb) => fetch(`${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body:  JSON.stringify(data)
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Put Data error:", ex));

export const removeData = (path, cb) => fetch(`${path}`, {
    method: 'DELETE',
    headers: {'Content-Type': 'application/json'},
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Remove Data error:", ex));

export const getState = (path, cb) => fetch(`${WFDB_BACKEND}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            let data = {};
            cb(data);
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const getStatus = (ep, cb) => {
    let url = ep === "convert" ? CNV_BACKEND : WFSRV_BACKEND;
    fetch(`${url}/${ep}/status`)
        .then((response) => {
            if (response.ok) {
                return response.json().then(data => cb(data));
            }
        })
        .catch(ex => console.log(`getUpload`, ex));
};


export const getLang = (lang) => {
    return Object.keys(MDB_LANGUAGES).find(key => MDB_LANGUAGES[key] === lang);
};

export const getDCT = (val) => {
    return Object.entries(DCT_OPTS).find(i => i[1].filter(p => p === val)[0])[0];
};

export const getName = (metadata) => {

    let name = [];
    const {line,language,upload_type} = metadata;

    // Language
    name[0] = language;
    // Original
    name[1] = name[0] === line.original_language || language === "mlt" ? "o" : "t";
    // Lecturer
    name[2] = line.lecturer;
    // Date
    name[3] = line.capture_date || line.film_date;
    // Type
    name[4] = CONTENT_TYPES_MAPPINGS[line.content_type].pattern;
    // Description
    name[5] = line.send_name.split("_").slice(5).join("_").replace(/([^-_a-zA-Z0-9]+)/g, '').toLowerCase();

    if(upload_type === "akladot") {
        name[4] = "akladot";
    } else if(upload_type === "tamlil") {
        name[4] = line.send_name.split("_").slice(4).join("_").replace(/([^-_a-zA-Z0-9]+)/g, '').toLowerCase();
        name.splice(-1,1);
    } else if(line.collection_type === "CONGRESS") {
        return line.upload_filename;
    } else if(upload_type === "kitei-makor") {
        name[4] = "kitei-makor";
    } else if(upload_type === "research-material") {
        name[4] = "research-material";
    } else if(upload_type === "article") {
        //Validate file name
        if(line.upload_filename.split("_").length < 6) {
            return null
        }
        name[2] = "rav";
        name[4] = "art";
        name[5] = line.upload_filename.split(".")[0].split("_").pop().replace(/([^-a-zA-Z0-9]+)/g, '').toLowerCase();
    } else if(upload_type === "publication") {
        //Validate file name
        if(line.upload_filename.split("_").length < 6) {
            return null
        }
        name[2] = "rav";
        name[4] = "pub";
        name[5] =  line.upload_filename.split("_").slice(5)[0].replace(/([^-a-zA-Z0-9]+)/g, '').toLowerCase() + "_" + line.publisher;
    }

    return name.join("_") + '.' + mime_list[line.mime_type];
};

export const newTrimMeta = (data, mode, source) => {

    const {line,original,proxy,file_name,stop_name,wfstatus,capture_id,trim_id,dgima_id,parent} = data;
    let p = source.match(/^(main|backup|trimmed|custom)$/) ? "t" : "d";
    let key_id = p === "t" ? "trim_id" : "dgima_id";
    let wfid = p + moment().format('X');
    let date = moment.unix(wfid.substr(1)).format("YYYY-MM-DD");
    let originalsha1 = original.format.sha1;
    let proxysha1 = proxy ? proxy.format.sha1 : null;
    let name = file_name || stop_name;
    let censored = mode === "censor";
    let buffer = mode === "wfadmin";
    let secured = wfstatus.secured || false;
    return {date, line,
        file_name: name,
        [key_id]: wfid,
        inpoints: [],
        outpoints: [],
        original,
        proxy,
        parent: {
            id: parent ? p === "t" ? trim_id : dgima_id : capture_id,
            capture_id: parent ? parent.capture_id : data.capture_id,
            original_sha1: originalsha1,
            proxy_sha1: proxysha1,
            file_name: name,
            source: source.match(/^(joined|search)$/) ? "cassette" : source,
        },
        wfstatus: {
            aricha: false,
            buffer: buffer,
            fixed: false,
            trimmed: false,
            renamed: !!source.match(/^(congress)$/),
            wfsend: false,
            removed: false,
            kmedia: false,
            backup: false,
            metus: false,
            censored: censored,
            secured: secured,
            locked: false
        }
    };

};

export const newInsertMeta = (file_data) => {
    let date = file_data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];
    let ext = file_data.original.format.format_name === "mp3" ? "mp3" : "mp4";
    let metadata = {};
    metadata.insert_id = "i"+moment().format('X');
    metadata.line = file_data.line;
    if(ext === "mp4") metadata.line.mime_type = "video/mp4";
    metadata.content_type = getDCT(file_data.line.content_type);
    metadata.date = date;
    metadata.file_name = file_data.file_name;
    metadata.extension = ext;
    metadata.insert_name = `${file_data.file_name}.${metadata.extension}`;
    // In InsertApp upload_filename use for filename gen in OldWF
    metadata.line.upload_filename = metadata.insert_name;
    metadata.insert_type = file_data.line && file_data.line.fix_unit_uid ? "2" : "3";
    metadata.language = file_data.line.language;
    metadata.send_id = file_data.dgima_id;
    metadata.send_uid = "";
    metadata.upload_type = "dgima";
    metadata.sha1 = file_data.original.format.sha1;
    metadata.size = parseInt(file_data.original.format.size, 10);
    return metadata;
};

export const newJobMeta = (job_name) => {
    let job_id = "j"+moment().format('X');
    let date = moment.unix(job_id.substr(1)).format("YYYY-MM-DD");
    let metadata = {
        job_id, date,
        file_name: null,
        job_name: job_name,
        job_type: "video",
        line: null,
        original: null,
        parent: {doers: []},
        product: {notes: []},
        proxy: null,
        wfstatus: {
            aricha: false,
            buffer: false,
            fix_req: false,
            fixed: false,
            post_req: false,
            posted: false,
            sub_req: false,
            subed: false,
            renamed: false,
            wfsend: false,
            removed: false,
            censored: false,
            checked: false,
            secured: false,
            locked: false
        }
    };
    return metadata;
};

export const Fetcher = (path, cb) => fetch(`${MDB_BACKEND}/${path}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
        throw new Error('Network response was not ok.');
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const fetchPublishers = cb => Fetcher('publishers/', cb);

export const fetchUnits = (path, cb) => fetch(`${MDB_BACKEND}/content_units/${path}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const fetchPersons = (id, cb) => fetch(`${MDB_BACKEND}/content_units/${id}/persons/`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${id}`, ex));

export const insertName = (filename, key, cb) => fetch(`${WFDB_BACKEND}/insert/find?key=${key}&value=${filename}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${filename}`, ex));

export const insertData = (value, key, cb) => fetch(`${WFDB_BACKEND}/insert/line?key=${key}&value=${value}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${value}`, ex));

export const getChildren = (value, key, cb) => fetch(`${WFDB_BACKEND}/dgima/parent?key=${key}&value=${value}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${value}`, ex));

export const arichaName = (filename, cb) => fetch(`${WFDB_BACKEND}/aricha/find?key=file_name&value=${filename}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${filename}`, ex));

export const insertSha = (sha, cb) => fetch(`${MDB_BACKEND}/files/?sha1=${sha}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${sha}`, ex));

export const captureSha = (sha, cb) => fetch(`${WFDB_BACKEND}/capture/find?key=sha1&value=${sha}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${sha}`, ex));



