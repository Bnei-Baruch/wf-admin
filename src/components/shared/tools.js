const API_BACKEND = 'http://wfrp.bbdomain.org:8080';
const API_STATE = 'http://wfrp.bbdomain.org:8000';
export const IVAL = 1000;

export const toHms = (time) => {
    let totalSec = time ;
    let hours = parseInt( totalSec / 3600 ) % 24;
    let minutes = parseInt( totalSec / 60 ) % 60;
    let seconds = (totalSec % 60).toFixed(2);
    if (seconds < 0) seconds = 0;

    let result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    return result;
};

export const toSeconds = (time) => {
    var hms = time ;
    var a = hms.split(':');
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds;
}

export const getData = (path, cb) => fetch(`${API_BACKEND}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
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
    .catch(ex => console.log("Post Trim Meta:", ex));

export const getConv = (path, cb) => fetch(`${API_STATE}/${path}`)
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        } else {
            let data = {};
            cb(data);
        }
    })
    .catch(ex => console.log(`get ${path}`, ex));

export const getUpload = (cb) => fetch('http://wfserver.bbdomain.org:8080/hooks/wfget?get=tspool')
    .then((response) => {
        if (response.ok) {
            return response.json().then(data => cb(data));
        }
    })
    .catch(ex => console.log(`getUpload`, ex));