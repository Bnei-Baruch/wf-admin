import React, {Component, Fragment} from 'react'
import DgimaTrimmer from "../Trimmer/DgimaTrimmer";
import DgimaTrimmed from "./DgimaTrimmed";
import mqtt from "../../shared/mqtt";
import {MQTT_ROOT} from "../../shared/consts";

class DgimaApp extends Component {

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
        const data = MQTT_ROOT + '/service/cassette/state';
        const local = true;
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "cassette") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({dgima: message});
    };

    render() {

        return (
            <Fragment>
                <DgimaTrimmer/>
                <DgimaTrimmed user={this.props.user} dgima={this.state.dgima} />
            </Fragment>
        );
    }
}

export default DgimaApp;
