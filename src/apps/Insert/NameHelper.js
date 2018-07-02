import React, { Component } from 'react';
import {getDataByID} from '../../shared/tools';
import { Grid, Header } from 'semantic-ui-react'

class NameHelper extends Component {

    state = { send_name: "" };

    componentDidMount() {
        if(this.props.id)
            getDataByID(this.props.id, (wfdata) => {
                console.log(":: Got Workflow Data: ", wfdata);
                this.setState({send_name: wfdata.file_name});
            });
    };

    render() {
        return (
            <Grid>
                <Grid.Column textAlign='left'>
                    <Header as='h4' color="red" >
                        {this.state.send_name}
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default NameHelper;

