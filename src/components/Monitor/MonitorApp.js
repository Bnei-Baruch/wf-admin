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
    };

    toggleRemoved = () => this.setState({ removed: !this.state.removed });
    toggleLesson = () => this.setState({ lesson: !this.state.lesson });
    toggleProgram = () => this.setState({ program: !this.state.program });

    render() {
        return (
            <Fragment>
                <Grid columns={2} padded='horizontally' className='monitor_app'>
                    <Grid.Column>
                        <Popup
                            trigger={<Button size='mini' circular icon='settings' className="settings_btn"></Button>}
                            flowing
                            hoverable
                        >
                            <p><Checkbox label='Hide Removed' onClick={this.toggleRemoved} checked={this.state.removed} /></p>
                            <p><Checkbox label='Hide Lessons' onClick={this.toggleLesson} checked={this.state.lesson} /></p>
                            <p><Checkbox label='Hide Programs' onClick={this.toggleProgram} checked={this.state.program} /></p>
                        </Popup>
                        <Capture />
                        <Trimmer {...this.state} />
                        <Upload />
                    </Grid.Column>
                    <Grid.Column>
                        <Carbon />
                        <Kmedia />
                    </Grid.Column>
                </Grid>

            </Fragment>
        );
    }
}

export default MonitorApp;
