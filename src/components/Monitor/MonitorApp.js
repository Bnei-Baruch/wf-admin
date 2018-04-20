import React, { Component, Fragment } from 'react';
import { Grid, Popup, Button, Checkbox } from 'semantic-ui-react'
import Capture from './Capture';
import Trimmer from './Trimmer';
import Carbon from './Carbon';
import Kmedia from './Kmedia';
import Upload from './Upload';
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
                            mountNode={document.getElementById("ltr-modal-mount")}
                        >
                            <p><Checkbox label='Hide Removed' onClick={this.toggleRemoved} checked={this.state.removed} /></p>
                            <p><Checkbox label='Hide Lessons' onClick={this.toggleLesson} checked={this.state.lesson} /></p>
                            <p><Checkbox label='Hide Programs' onClick={this.toggleProgram} checked={this.state.program} /></p>
                            <p><Checkbox label='Kmedia Full' onClick={this.toggleKmedia} checked={this.state.kmedia_full} /></p>
                        </Popup>
                        <Capture />
                        <Trimmer {...this.state} />
                        <Upload />
                    </Grid.Column>
                    <Grid.Column>
                        <Carbon />
                        <Kmedia {...this.state} />
                    </Grid.Column>
                </Grid>

            </Fragment>
        );
    }
}

export default MonitorApp;
