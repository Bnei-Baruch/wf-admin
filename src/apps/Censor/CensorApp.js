import React, {Component, Fragment} from 'react'
//import CensorTrimmer from "../Trimmer/CensorTrimmer";
import CensorCheck from "./CensorCheck";
import mqtt from "../../shared/mqtt";

class CensorApp extends Component {

    state = {
        trimmer: [],
        dgima: [],
        aricha: [],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = 'wf-api/service/+/state';
        const local = true;
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
        const {dgima, trimmer, aricha} = this.state;

        return (
            <Fragment>
                {/*<CensorTrimmer/>*/}
                <CensorCheck user={this.props.user} trimmed={trimmer} dgima={dgima} aricha={aricha} />
            </Fragment>
        );
    }
}

export default CensorApp;
