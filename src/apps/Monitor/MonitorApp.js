import React, { Component, Fragment } from 'react';
import { Grid, Popup, Button, Checkbox } from 'semantic-ui-react'
import MonitorCapture from './MonitorCapture';
import MonitorTrimmer from './MonitorTrimmer';
import MonitorCarbon from './MonitorCarbon';
import MonitorKmedia from './MonitorKmedia';
import MonitorUpload from './MonitorUpload';
import './MonitorApp.css';

class MonitorApp extends Component {

    state = {
        removed: false,
        lesson: false,
        program: false,
        kmedia_full: false,
    };

    toggleRemoved = () => this.setState({ removed: !this.state.removed });
    toggleLesson = () => this.setState({ lesson: !this.state.lesson });
    toggleProgram = () => this.setState({ program: !this.state.program });
    toggleKmedia = () => this.setState({ kmedia_full: !this.state.kmedia_full });

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
                        </Popup>
                        <MonitorCapture />
                        <MonitorTrimmer {...this.state} />
                        <MonitorUpload />
                    </Grid.Column>
                    <Grid.Column>
                        <MonitorCarbon />
                        <MonitorKmedia {...this.state} />
                    </Grid.Column>
                </Grid>

            </Fragment>
        );
    }
}

export default MonitorApp;
