import {mime_list, CONTENT_TYPES_MAPPINGS, MDB_LANGUAGES, DCT_OPTS, CONTENT_TYPE_BY_ID, langs_bb} from './consts';

import kc from "../components/UserManager";

//export const MDB_BACKEND = 'http://dev.mdb.bbdomain.org/rest';
export const MDB_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_MDB_BACKEND : '/mdb';
export const MDB_FINDSHA = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_MDB_FINDSHA : '/sha';
export const WFDB_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFDB_BACKEND : '/wfdb';
export const WFRP_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFRP_BACKEND : '/wfrp';
export const WFSRV_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_WFSRV_BACKEND : '/wfapi';
export const WF_BACKEND = process.env.REACT_APP_WF_BACKEND;
export const WFNAS_BACKEND = window.location.hostname === "wfsrv.kli.one" ? process.env.REACT_APP_WFNAS_BACKEND : WFSRV_BACKEND;
export const MDB_LOCAL_URL = process.env.REACT_APP_MDB_LOCAL_URL;
export const MDB_EXTERNAL_URL = process.env.REACT_APP_MDB_EXTERNAL_URL;
export const MDB_UNIT_URL = process.env.REACT_APP_MDB_UNIT_URL;
export const MDB_ADMIN_URL = 'https://kabbalahmedia.info/admin';
export const KMEDIA_URL = 'https://kabbalahmedia.info/he';
//export const SIRTUT_URL = process.env.REACT_APP_SIRTUT_URL;
export const CNV_BACKEND = process.env.NODE_ENV !== 'production' ? process.env.REACT_APP_CNV_BACKEND : '/cnvapi';

//export const MDB_BACKEND = 'https://kabbalahmedia.info/mdb-api';
export const MDB_REST = 'http://app.mdb.bbdomain.org/rest/content_units';
const AUTH_URL = 'https://accounts.kab.info/auth/realms/main';
export const MQTT_LCL_URL = process.env.REACT_APP_MQTT_LCL_URL;
export const MQTT_EXT_URL = process.env.REACT_APP_MQTT_EXT_URL;

export const IVAL = 1000;

export const toSeconds = (time) => {
    let parts = time.split(':');
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
};

export const toHms = (totalSec) => {
    let hours = parseInt( totalSec / 3600 , 10) % 24;
    let minutes = parseInt( totalSec / 60 , 10) % 60;
    let seconds = (totalSec % 60).toFixed(2);
    if (seconds < 0) seconds = 0;
    return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
};

export const kmHms = (totalSec) => {
    let hours = parseInt( totalSec / 3600 , 10) % 24;
    let minutes = parseInt( totalSec / 60 , 10) % 60;
    let seconds = (totalSec % 60).toFixed(0);
    if(seconds < 0) seconds = 0;
    return (hours === 0 ? "" : hours + "h") + (minutes === 0 ? "" : minutes + "m") + seconds + "s";
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

export const getToken = () => {
    return kc.token;
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

export const getData = (path, cb) => fetch(`${WFRP_BACKEND}/${path}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            return response.json().then(cb(null));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const getDataByID = (id, cb) =>  {
    fetch(`${WFRP_BACKEND}/${getEndpoint(id)}/${id}`,{
        headers: {
            'Authorization': 'bearer ' + getToken(),
            'Content-Type': 'application/json'
        }
    })
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

export const postData = (path, data, cb) => fetch(`${path}`, {
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

export const removeData = (path, cb) => fetch(`${path}`, {
    method: 'DELETE',
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    },
})
    .then((response) => {
        if (response.ok) {
            return response.json().then(respond => cb(respond));
        }
    })
    .catch(ex => console.log("Remove Data error:", ex));

export const getState = (path, cb) => fetch(`${WFDB_BACKEND}/${path}`, {
    headers: {
        'Authorization': 'bearer ' + getToken(),
        'Content-Type': 'application/json'
    }
})
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
    fetch(`${url}/${ep}/status`, {
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
        .catch(ex => console.log(`getUpload`, ex));
};


export const getLang = (lang) => {
    return Object.keys(MDB_LANGUAGES).find(key => MDB_LANGUAGES[key] === lang);
};

export const getDCT = (val) => {
    return Object.entries(DCT_OPTS).find(i => i[1].filter(p => p === val)[0])[0];
};

export const getMediaType = (mime_type) => {
    const media_type = mime_type.split('/')[0];
    if(media_type === "video" || media_type === "audio") {
        return media_type;
    } else {
        return "other";
    }
}

export const getName = (metadata) => {
    //console.log(":: GetName - got metadata: ",metadata);
    let name = [];
    const {line,language,upload_type} = metadata;

    // Language
    name[0] = language;
    // Original
    name[1] = name[0] === line.original_language ? "o" : "t";
    // Lecturer
    name[2] = line.lecturer;
    // Date
    name[3] = line.capture_date && line.capture_date !== "0001-01-01" ? line.capture_date : line.film_date;
    // Type
    name[4] = CONTENT_TYPES_MAPPINGS[line.content_type].pattern;
    // Description
    name[5] = line.send_name.split("_").slice(5).join("_").replace(/([^-_a-zA-Z0-9]+)/g, '').toLowerCase();

    if(upload_type === "akladot") {
        name[4] = "akladot";
    } else if(upload_type === "tamlil") {
        name[4] = line.send_name.split("_").slice(4).join("_").replace(/([^-_a-zA-Z0-9]+)/g, '').toLowerCase();
        name.splice(-1,1);
    //FIXME: It's was in wf-admin only
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
    } else if(upload_type === "declamation") {
        name[1] = "o";
        name[2] = "rav";
        name[4] = "declamation";
        name[5] =  "blog-rav_full";
    } else if(upload_type === "likutim") {
        name[5] = line.pattern;
    }

    return name.join("_") + '.' + mime_list[line.mime_type];
};

export const insertLine = (metadata,unit) => {
    if(!unit) {
        let type_id = 44;
        metadata.line.content_type = CONTENT_TYPE_BY_ID[type_id];
        metadata.line.send_name = metadata.line.upload_filename.split('.')[0];
        metadata.line.lecturer = "rav";
        metadata.line.has_translation = false;
        metadata.line.film_date = metadata.date;
        metadata.line.language = metadata.language;
        metadata.line.original_language = metadata.language;
        metadata.send_id = null;
        metadata.line.uid = null;
        metadata.insert_name = getName(metadata);
        metadata.line.final_name = metadata.insert_name.split('.')[0];
        return metadata;
    } else if(metadata.content_type === "SOURCE") {
        let {uid, id} = unit;
        metadata.line.uid = uid;
        metadata.line.unit_id = id;
        metadata.line.content_type = "SOURCE";
        metadata.line.capture_date = metadata.date;
        metadata.line.original_language = metadata.language;
        metadata.send_id = null;
        metadata.insert_name = metadata.line.upload_filename;
        return metadata;
    } else {
        let {properties, uid, type_id, id} = unit;
        const {capture_date,film_date} = properties;
        metadata.line.uid = uid;
        metadata.line.unit_id = id;
        metadata.line.content_type = CONTENT_TYPE_BY_ID[type_id];
        metadata.line.capture_date = capture_date && capture_date !== "0001-01-01" ? capture_date : metadata.date;
        metadata.line.film_date = film_date.split('T')[0];
        metadata.line.original_language = MDB_LANGUAGES[properties.original_language];
        metadata.send_id = properties.workflow_id || null;
        if(properties.pattern)
            metadata.line.pattern = properties.pattern;
        return metadata;
    }
};

export const remuxLine = (unit, metadata, cb) => {
    const {language} = metadata;
    let {uid,id} = unit;
    fetchUnits(`${id}/files/`, (data) => {
        console.log(" :: Fetch files: ", data);
        let published = data.filter(p => p.published && p.removed_at === null);
        console.log(" :: Published: ", published);
        let lchk = published.find(l => l.name.match(language+"_"));
        console.log(" :: Check: ", lchk);
        // Check if uploaded language already exist
        if(lchk && metadata.insert_type === "1") {
            alert("Selected language already exist");
            cb(null);
        } else if(lchk && metadata.insert_type === "2") {
            insertData(uid, "uid", (data) => {
                console.log(":: insert data - got: ",data);
                if(data.length > 0) {
                    //ARCHIVE_BUG: Not in all files we got original_language property so we going to check string
                    //let remux_src = published.filter(s => s.language === properties.original_language && s.mime_type === "video/mp4");
                    //ARCHIVE_BUG: We got case where two langueags wa with _o_ name, so there is no normal way to know original language
                    // So we going to check filename string for heb and rus order
                    let remux_src = published.filter(s => s.name.match("heb_o_") && s.mime_type === "video/mp4");
                    if(remux_src.length === 0) {
                        remux_src = published.filter(s => s.name.match("rus_o_") && s.mime_type === "video/mp4");
                    }
                    console.log(" :: Got sources for remux: ", remux_src);
                    // We must get here 1 or 2 files and save their url
                    if(remux_src.length === 0 || remux_src.length > 2) {
                        alert("Fail to get valid sources for remux");
                        cb(null);
                        // It's mean we did not get HD here
                    } else if(remux_src.length === 1) {
                        metadata.insert_id = data[0].insert_id;
                        metadata.line.nHD = remux_src[0].properties.url;
                        metadata.line.nHD_sha1 = remux_src[0].sha1;
                        metadata.line.HD = null;
                        metadata.line.HD_sha1 = null;
                        metadata.insert_type = "5";
                        metadata.insert_name = language + "_t_" +remux_src[0].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                        cb(metadata);
                        // It's mean we get HD and nHD here
                    } else {
                        for(let i=0;i<remux_src.length;i++) {
                            metadata.line[remux_src[i].properties.video_size] = remux_src[i].properties.url;
                            metadata.line[remux_src[i].properties.video_size + "_sha1"] = remux_src[i].sha1;
                            if(remux_src[i].properties.video_size === "nHD")
                                metadata.insert_name = language + "_t_" +remux_src[i].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                        }
                        metadata.insert_type = "5";
                        metadata.insert_id = data[0].insert_id;
                        cb(metadata);
                    }
                } else {
                    console.log("Not found insert we going to fix");
                    alert("Not found insert we going to fix");
                    cb(null);
                }
            });
        } else if(lchk && metadata.insert_type === "3") {
            //TODO: Rename mode
            alert("Not ready yet");
            cb(null);
        } else {
            //ARCHIVE_BUG: Not in all files we got original_language property so we going to check string
            // let remux_src = published.filter(s => s.language === properties.original_language && s.mime_type === "video/mp4");
            //ARCHIVE_BUG: We got case where two langueags wa with _o_ name, so there is no normal way to know original language
            // So we going to check filename string for heb and rus order
            let remux_src = published.filter(s => s.name.match("heb_o_") && s.mime_type === "video/mp4");
            if(remux_src.length === 0) {
                remux_src = published.filter(s => s.name.match("rus_o_") && s.mime_type === "video/mp4");
            }
            console.log(" :: Got sources for remux: ", remux_src);
            // We must get here 1 or 2 files and save their url
            if(remux_src.length === 0 || remux_src.length > 2) {
                alert("Fail to get valid sources for remux");
                cb(null);
                // It's mean we did not get HD here
            } else if(remux_src.length === 1) {
                metadata.line.nHD = remux_src[0].properties.url;
                metadata.line.nHD_sha1 = remux_src[0].sha1;
                metadata.line.HD = null;
                metadata.line.HD_sha1 = null;
                metadata.insert_type = "4";
                metadata.insert_name = language + "_t_" +remux_src[0].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                cb(metadata);
                // It's mean we get HD and nHD here
            } else {
                for(let i=0;i<remux_src.length;i++) {
                    metadata.line[remux_src[i].properties.video_size] = remux_src[i].properties.url;
                    metadata.line[remux_src[i].properties.video_size + "_sha1"] = remux_src[i].sha1;
                    if(remux_src[i].properties.video_size === "nHD")
                        metadata.insert_name = language + "_t_" +remux_src[i].name.split("_").slice(2).join("_").split(".")[0]+".wav";
                }
                metadata.insert_type = "4";
                cb(metadata);
            }
        }
    });
};

export const newTrimMeta = (data, mode, source) => {

    const {line,original,proxy,file_name,stop_name,wfstatus,capture_id,trim_id,dgima_id,parent} = data;
    let p = source.match(/^(main|backup|trimmed|custom|ktaim|rroom)$/) ? "t" : "d";
    let key_id = p === "t" ? "trim_id" : "dgima_id";
    let wfid = p + Math.floor(Date.now() / 1000);
    let date = new Date(wfid.substr(1) * 1000).toLocaleDateString('sv');
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
            langcheck: !!original.languages,
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
    metadata.insert_id = "i" + Math.floor(Date.now() / 1000);
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
    let job_id = "j" + Math.floor(Date.now() / 1000);
    let date = new Date(job_id.substr(1) * 1000).toLocaleDateString('sv');
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

export const newProductMeta = (product_name, product_description, language) => {
    let product_id = "p" + Math.floor(Date.now() / 1000);
    let date = new Date(product_id.substr(1) * 1000).toLocaleDateString('sv');
    let metadata = {
        product_id, date, product_name, language, type_id: null,
        product_type: "media", i18n: {[language]: {name: product_name, description: product_description}}, line: null, parent: {},
        pattern: null,
        properties: {
            buffer: false,
            fixed: false,
            renamed: false,
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

export const getUnit = (url, cb) => fetch(`${url}`, {
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
    .catch(ex => console.log(`get ${url}`, ex));

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

export const insertName = (filename, key, cb) => fetch(`${WFDB_BACKEND}/insert/find?key=${key}&value=${filename}`,{
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
    .catch(ex => console.log(`get ${filename}`, ex));

export const insertData = (value, key, cb) => fetch(`${WFDB_BACKEND}/insert/line?key=${key}&value=${value}`,{
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
    .catch(ex => console.log(`get ${value}`, ex));

export const getChildren = (value, key, cb) => fetch(`${WFDB_BACKEND}/dgima/parent?key=${key}&value=${value}`,{
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
    .catch(ex => console.log(`get ${value}`, ex));

export const arichaName = (filename, cb) => fetch(`${WFDB_BACKEND}/aricha/find?key=file_name&value=${filename}`,{
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

export const captureSha = (sha, cb) => fetch(`${WFDB_BACKEND}/capture/find?key=sha1&value=${sha}`,{
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

export const newLanguages = () => {
    let languages = {};
    langs_bb.map((lang) => languages[lang] = false);
    return languages;
}
