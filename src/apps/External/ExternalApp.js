import React, {Component, Fragment} from 'react'
import ExternalUpload from "./ExternalUpload";
import ExternalTrimmed from "./ExternalTrimmed";
import {captureSha, putData, WFSRV_BACKEND} from "../../shared/tools";
import ExternalTrimmer from "../Trimmer/ExternalTrimmer";
import mqtt from "../../shared/mqtt";

class ExternalApp extends Component {

    state = {
        dgima: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wfdb/service/dgima/state';
        const local = window.location.hostname !== "wfsrv.kli.one";
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "dgima") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({dgima: message});
    };

    dgimaWorkflow = (filedata) => {
        console.log(":: DgimaApp - got data: ", filedata);
        captureSha(filedata.sha1, (data) => {
            console.log(":: Check captured sha: ",data);
            if(data.length > 0) {
                alert("File already exist!")
                //TODO: make option to autoselect exist file
            } else {
                putData(`${WFSRV_BACKEND}/workflow/dgima`, filedata, (cb) => {
                    console.log(":: DgimaApp - workflow respond: ",cb);
                });
            }
        });
    };

    render() {

        return (
            <Fragment>
                <ExternalUpload onFileData={this.dgimaWorkflow}/>
                <ExternalTrimmer/>
                <ExternalTrimmed user={this.props.user} dgima={this.state.dgima} />
            </Fragment>
        );
    }
}

export default ExternalApp;
