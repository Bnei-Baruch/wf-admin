import React, { Component } from 'react';
import { Fetcher } from '../../shared/tools';
import { Grid, Header } from 'semantic-ui-react'

class PopupInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
        };
    };

    componentDidMount() {
        console.log("--Did mount--");
        let path = this.props.id + '/files/';
        Fetcher(path)
            .then(data => {
                this.setState({files: data});
            })
    };

    render() {
        let files = this.state.files.map((file) => {
            if (file.name.split(".")[0].split("_").pop().match(/^t[\d]{10}o$/))
                return (
                    <p key={file.id}>{file.name}</p>
                );
        });
        return (
            <Grid>
                <Grid.Column textAlign='left'>
                    <Header as='h4'>{files}</Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default PopupInfo;

