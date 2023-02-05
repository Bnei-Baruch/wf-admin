import React, {Component, Fragment} from 'react'
import AdminTrimmer from "../Trimmer/AdminTrimmer";
import AdminTrimmed from "./AdminTrimmed";
import mqtt from "../../shared/mqtt";

class AdminApp extends Component {

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
        const data = 'wf-api/service/trimmer/state';
        const local = true;
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
                <AdminTrimmer/>
                <AdminTrimmed user={this.props.user} trimmed={this.state.trimmer} />
            </Fragment>
        );
    }
}

export default AdminApp;
