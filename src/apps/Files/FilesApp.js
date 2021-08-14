import React, {Component, Fragment} from 'react'
import FilesWorkflow from "./FilesWorkflow";
import '../WFDB/WFDB.css';
import mqtt from "../../shared/mqtt";

class FilesApp extends Component {

    state = {
        ingest: [],
        trimmer: [],
        archive: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wfdb/service/+/monitor';
        const local = window.location.hostname === "wfsrv.bbdomain.org";
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({[type]: message})
    };

    render() {
        const {ingest, trimmer, archive} = this.state;

        return (
            <Fragment>
                <FilesWorkflow user={this.props.user} ingest={ingest} trimmer={trimmer} archive={archive} />
            </Fragment>
        );
    }
}

export default FilesApp;
