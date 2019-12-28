import React, { Component, Fragment } from 'react';
import { Grid, Popup, Button, Checkbox } from 'semantic-ui-react'
import MonitorCapture from './MonitorCapture';
import MonitorTrimmer from './MonitorTrimmer';
//import MonitorCarbon from './MonitorCarbon';
import MonitorKmedia from './MonitorKmedia';
import MonitorUpload from './MonitorUpload';
import MonitorConvert from "./MonitorConvert";
import './MonitorApp.css';

class MonitorApp extends Component {

    state = {
        removed: false,
        lesson: false,
        program: false,
        kmedia_full: false,
        insert: true,
        ingest: false,
        aricha: true,
    };

    toggleRemoved = () => this.setState({ removed: !this.state.removed });
    toggleLesson = () => this.setState({ lesson: !this.state.lesson });
    toggleProgram = () => this.setState({ program: !this.state.program });
    toggleKmedia = () => this.setState({ kmedia_full: !this.state.kmedia_full });
    toggleInsert = () => this.setState({ insert: !this.state.insert });
    toggleIngest = () => this.setState({ ingest: !this.state.ingest });
    toggleAricha = () => this.setState({ aricha: !this.state.aricha });

    render() {
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
                        <MonitorCapture />
                        <MonitorTrimmer {...this.state} />
                    </Grid.Column>
                    <Grid.Column>
                        <MonitorKmedia {...this.state} />
                        <MonitorConvert />
                        <MonitorUpload />
                    </Grid.Column>
                </Grid>

            </Fragment>
        );
    }
}

export default MonitorApp;
