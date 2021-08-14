import React, {Component, Fragment} from 'react'
//import CensorTrimmer from "../Trimmer/CensorTrimmer";
import CensorCheck from "./CensorCheck";
import mqtt from "../../shared/mqtt";

class CensorApp extends Component {

    state = {
        trimmer: [],
        dgima: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wfdb/service/+/state';
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
        const {dgima, trimmer} = this.state;

        return (
            <Fragment>
                {/*<CensorTrimmer/>*/}
                <CensorCheck user={this.props.user} trimmed={trimmer} dgima={dgima} />
            </Fragment>
        );
    }
}

export default CensorApp;
