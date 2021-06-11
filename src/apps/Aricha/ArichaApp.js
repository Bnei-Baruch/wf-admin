import React, {Component, Fragment} from 'react'
import ArichaAdmin from "./ArichaAdmin";
import ArichaUpload from "./ArichaUpload";
import {WFSRV_BACKEND, putData} from "../../shared/tools";
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
        console.log(":: ArichaApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/aricha`, filedata, (cb) => {
            console.log(":: ArichaApp - workflow respond: ",cb);
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
