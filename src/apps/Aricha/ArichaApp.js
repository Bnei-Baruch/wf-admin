import React, {Component, Fragment} from 'react'
import ArichaAdmin from "./ArichaAdmin";
import ArichaUpload from "./ArichaUpload";
import {WFSRV_BACKEND, putData, getData, MDB_FINDSHA, getUnits} from "../../shared/tools";
import mqtt from "../../shared/mqtt";

class ArichaApp extends Component {

    state = {
        aricha: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wfdb/service/aricha/state';
        const local = window.location.hostname !== "wfsrv.kli.one";
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "aricha") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({aricha: message});
    };

    arichaWorkflow = (filedata) => {
        // Check SHA1 in WFDB
        getData(`trimmer/sha1?value=${file_data.original.format.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in trimmer DB by SHA1: ",trimmer);
                alert("File exist in ingest after trim");
            } else {
                // Check SHA1 in MDB
                let sha1 = file_data.original.format.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The SHA1 exist in MDB!", units);
                        alert("File already in MDB!");
                    } else {
                        console.log(":: ArichaApp - got data: ", filedata);
                        putData(`${WFSRV_BACKEND}/workflow/aricha`, filedata, (cb) => {
                            console.log(":: ArichaApp - workflow respond: ",cb);
                        });
                    }
                });
            }
        });
    };

    render() {

        return (
            <Fragment>
                <ArichaUpload onFileData={this.arichaWorkflow}/>
                <ArichaAdmin user={this.props.user} aricha={this.state.aricha} />
            </Fragment>
        );
    }
}

export default ArichaApp;
