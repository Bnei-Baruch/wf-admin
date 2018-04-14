import { mime_list, CONTENT_TYPES_MAPPINGS, MDB_LANGUAGES} from './consts';

const API_BACKEND = 'https://upload.kli.one/rest';
// const API_BACKEND = 'http://app.mdb.bbdomain.org/rest/content_units';
// http://app.mdb.bbdomain.org/rest/content_units/33573/persons/ uid: "abcdefgh" ; rav

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
    switch (metadata.upload_type) {
        case "akladot":
            var lecturer = metadata.line.lecturer;
            var type = "akladot";
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
            break;
        case "tamlil":
            var lecturer = metadata.line.lecturer;
            var type = CONTENT_TYPES_MAPPINGS[metadata.line.content_type].pattern;
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
            break;
        case "kitei-makor":
            var lecturer = metadata.line.lecturer;
            var type = "kitei-makor";
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
            break;
        case "sirtutim":
            var lecturer = metadata.line.lecturer;
            var type = CONTENT_TYPES_MAPPINGS[metadata.line.content_type].pattern;
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
            break;
        case "aricha":
            break;
        case "dibuv":
            var lecturer = metadata.line.lecturer;
            var type = CONTENT_TYPES_MAPPINGS[metadata.line.content_type].pattern;
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
            break;
        case "publication":
            var lecturer = "rav";
            var type = "publication";
            var desc = metadata.publisher + "_" + metadata.line.uid;
            break;
        case "article":
            var lecturer = "rav";
            var type = "art";
            var desc = metadata.line.uid;
            break;
        default:
            var lecturer = metadata.line.lecturer;
            var type = CONTENT_TYPES_MAPPINGS[metadata.line.content_type].pattern;
            var desc = metadata.line.send_name.split("_").slice(5, -1).join("_");
    };

    let lang = metadata.language;
    let ot = lang === metadata.line.original_language ? "o" : "t";
    let date = metadata.line.capture_date || metadata.line.film_date;

    let filename = [lang,ot,lecturer,date,type,desc].join("_");
    let ext = mime_list[metadata.line.mime_type];
    return filename + '.' + ext;
}

export const Fetcher = (path, cb) => fetch(`${API_BACKEND}/${path}`)
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

export const fetchUnits = (path, cb) => fetch(`${API_BACKEND}/content_units/${path}`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchDataWithCB--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const fetchPersons = (id, cb) => fetch(`${API_BACKEND}/content_units/${id}/persons/`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchPersonsName--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${id}`, ex));

export const insertName = (filename, cb) => fetch(`https://upload.kli.one/insert/find?key=insert_name&value=${filename}`)
    .then((response) => {
        if (response.ok) {
            console.log("--FetchInsertName--");
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`get ${filename}`, ex));

export const insertSha = (sha, cb) => fetch(`https://upload.kli.one/rest/files/?sha1=${sha}`)
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


