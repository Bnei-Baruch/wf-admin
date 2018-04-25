import { mime_list, CONTENT_TYPES_MAPPINGS, MDB_LANGUAGES} from './consts';

const MDB_BACKEND = 'https://insert.kbb1.com/rest';
const WFDB_BACKEND = 'http://wfdb.bbdomain.org:8080';
const WF_BACKEND = 'http://wfsrv.bbdomain.org:8010';

export const toHms = (time) => {
    let totalSec = time ;
    let hours = parseInt( totalSec / 3600 ) % 24;
    let minutes = parseInt( totalSec / 60 ) % 60;
    let seconds = (totalSec % 60).toFixed(2);
    if (seconds < 0) seconds = 0;

    let result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result.split(".")[0];
};

export const getLang = (lang) => {
    return Object.keys(MDB_LANGUAGES).find(key => MDB_LANGUAGES[key] === lang);
};

export const getName = (metadata) => {

    let name = [];

    // Language
    name[0] = metadata.language;
    // Original
    name[1] = name[0] === metadata.line.original_language ? "o" : "t";
    // Lecturer
    name[2] = metadata.line.lecturer;
    // Date
    name[3] = metadata.line.capture_date || metadata.line.film_date;
    // Type
    name[4] = CONTENT_TYPES_MAPPINGS[metadata.line.content_type].pattern;
    // Description
    name[5] = metadata.line.send_name.split("_").slice(5, -1).join("_");

    if(metadata.upload_type === "akladot") {
        name[4] = "akladot";
    } else if(metadata.upload_type === "kitei-makor") {
        name[4] = "kitei-makor";
    } else if(metadata.upload_type === "article") {
        name[2] = "rav";
        name[4] = "art";
        name[5] = metadata.line.upload_filename.split(".")[0].split("_").pop().replace(/([^-a-zA-Z0-9]+)/g, '').toLowerCase();
    } else if(metadata.upload_type === "publication") {
        name[2] = "rav";
        name[4] = "publication";
        name[5] = metadata.publisher + "_" + metadata.line.uid;
    }

    return name.join("_") + '.' + mime_list[metadata.line.mime_type];
};

export const Fetcher = (path, cb) => fetch(`${MDB_BACKEND}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
        throw new Error('Network response was not ok.');
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const fetchSources = cb => Fetcher('sources/', cb);

export const fetchTags = cb => Fetcher('tags/', cb);

export const fetchPublishers = cb => Fetcher('publishers/', cb);

export const fetchUnits = (path, cb) => fetch(`${MDB_BACKEND}/content_units/${path}`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchDataWithCB--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const fetchPersons = (id, cb) => fetch(`${MDB_BACKEND}/content_units/${id}/persons/`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchPersonsName--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${id}`, ex));

export const insertName = (filename, cb) => fetch(`${WFDB_BACKEND}/insert/find?key=insert_name&value=${filename}`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchInsertName--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${filename}`, ex));

export const insertSha = (sha, cb) => fetch(`${MDB_BACKEND}/files/?sha1=${sha}`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchInsertSha--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${sha}`, ex));

//export const fetchUnits = (path,cb) => fetcher(path, cb);

export const fetchCollections = (data,col) => {
    console.log("--FetchCollection--");
    data.data.forEach((u,i) => {
        let path = `${u.id}/collections/`;
        fetchUnits(path,cb => {
                if(cb.length === 0)
                    return;
                u["number"] = cb[0].collection.properties.number || "?";
                u["part"] = cb[0].name || "?";
                col(data)
            }
        )
    })
}


