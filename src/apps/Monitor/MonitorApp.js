import React, { Component, Fragment } from 'react';
import { Grid, Popup, Button, Checkbox } from 'semantic-ui-react'
import MonitorCapture from './MonitorCapture';
import MonitorTrimmer from './MonitorTrimmer';
//import MonitorCarbon from './MonitorCarbon';
import MonitorKmedia from './MonitorKmedia';
import MonitorUpload from './MonitorUpload';
import MonitorConvert from "./MonitorConvert";
import './MonitorApp.css';
import mqtt from "../../shared/mqtt";

class MonitorApp extends Component {

    state = {
        removed: false,
        lesson: false,
        program: false,
        kmedia_full: false,
        insert: true,
        //ingest: false,
        aricha: true,
        convert_topic: null,
        wfdb_topic: null,
        upload_topic: null,
        ingest: [],
        trimmer: [],
        archive: [],
        upload: ["", ""],
        convert: ["", ""],
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.wfdb_topic);
        mqtt.exit(this.state.upload_topic);
        mqtt.exit(this.state.convert_topic);
    };

    initMQTT = () => {
        const wfdb_data = 'wfdb/service/+/monitor';
        const upload_data = 'workflow/server/upload/monitor';
        const convert_data = 'workflow/server/convert/monitor';
        const local = window.location.hostname === "wfsrv.bbdomain.org";
        const wfdb_topic = local ? wfdb_data : 'bb/' + wfdb_data;
        const upload_topic = local ? upload_data : 'bb/' + upload_data;
        const convert_topic = local ? convert_data : 'bb/' + convert_data;
        this.setState({wfdb_topic, upload_topic, convert_topic})
        mqtt.join(wfdb_topic);
        mqtt.join(upload_topic);
        mqtt.join(convert_topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        //console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({[type]: message})
    };

    toggleRemoved = () => this.setState({ removed: !this.state.removed });
    toggleLesson = () => this.setState({ lesson: !this.state.lesson });
    toggleProgram = () => this.setState({ program: !this.state.program });
    toggleKmedia = () => this.setState({ kmedia_full: !this.state.kmedia_full });
    toggleInsert = () => this.setState({ insert: !this.state.insert });
    //toggleIngest = () => this.setState({ ingest: !this.state.ingest });
    toggleAricha = () => this.setState({ aricha: !this.state.aricha });

    render() {
        const {ingest, trimmer, archive, upload, convert} = this.state;
        return (
            <Fragment>
                <Grid columns={2} padded='horizontally' className='monitor_app'>
                    <Grid.Column>
                        <Popup
                            trigger={<Button size='mini' circular icon='settings' className="settings_btn" />}
                            flowing
                            hoverable
                            mountNode={document.getElementById("ltr-modal-mount")}>
                            <Checkbox label='Hide Removed' onClick={this.toggleRemoved} checked={this.state.removed} /><br />
                            <Checkbox label='Hide Lessons' onClick={this.toggleLesson} checked={this.state.lesson} /><br />
                            <Checkbox label='Hide Programs' onClick={this.toggleProgram} checked={this.state.program} /><br />
                            <Checkbox label='Kmedia Full' onClick={this.toggleKmedia} checked={this.state.kmedia_full} /><br />
                            <Checkbox label='Hide Insert' onClick={this.toggleInsert} checked={this.state.insert} /><br />
                            <Checkbox label='Hide Ingest' onClick={this.toggleIngest} checked={this.state.ingest} /><br />
                            <Checkbox label='Hide Aricha' onClick={this.toggleAricha} checked={this.state.aricha} /><br />
                        </Popup>
                        <MonitorCapture ingest={ingest} />
                        <MonitorTrimmer trimmer={trimmer} />
                    </Grid.Column>
                    <Grid.Column>
                        <MonitorKmedia archive={archive} />
                        {convert[1] !== "" ? <MonitorConvert convert={convert} /> : null}
                        {upload[1] !== "" ? <MonitorUpload upload={upload} /> : null}
                    </Grid.Column>
                </Grid>

            </Fragment>
        );
    }
}

export default MonitorApp;
