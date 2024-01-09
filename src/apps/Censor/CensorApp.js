import React, {Component, Fragment} from 'react'
//import CensorTrimmer from "../Trimmer/CensorTrimmer";
import CensorCheck from "./CensorCheck";
import mqtt from "../../shared/mqtt";
import {MQTT_ROOT} from "../../shared/consts";

class CensorApp extends Component {

    state = {
        cassette: [],
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
    const data = MQTT_ROOT + '/service/+/state';
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
        const {dgima, trimmer, aricha, cassette} = this.state;

        return (
            <Fragment>
                {/*<CensorTrimmer/>*/}
                <CensorCheck user={this.props.user} cassette={cassette} trimmed={trimmer} dgima={dgima} aricha={aricha} />
            </Fragment>
        );
    }
}

export default CensorApp;
