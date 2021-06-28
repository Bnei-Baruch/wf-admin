import React, {Component, Fragment} from 'react'
import KtaimTrimmed from "./KtaimTrimmed";
import KtaimTrimmer from "../Trimmer/KtaimTrimmer";
import mqtt from "../../shared/mqtt";

class KtaimApp extends Component {

    state = {
        trimmer: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wfdb/service/trimmer/state';
        const local = window.location.hostname !== "wfsrv.kli.one";
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "trimmer") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({trimmer: message});
    };

    render() {

        return (
            <Fragment>
                <KtaimTrimmer />
                <KtaimTrimmed trimmed={this.state.trimmer} />
            </Fragment>
        );
    }
}

export default KtaimApp;
