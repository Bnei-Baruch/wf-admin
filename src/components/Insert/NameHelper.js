import React, { Component } from 'react';
import { fetchUnits } from '../../shared/tools';
import { Grid, Header } from 'semantic-ui-react'

class NameHelper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
        };
    };

    componentDidMount() {
        console.log("--componentDidMount--");
        let path = this.props.id + '/files/';
        fetchUnits(path, (data) => {
            // TODO: make sure we get last trimmed
            let unit_file = data.filter((file) => file.name.split(".")[0].split("_").pop().match(/^t[\d]{10}o$/));
            console.log("Try to get trim source:",unit_file);
            this.setState({
                files: data,
                send_name: unit_file ? unit_file[0].name : null,
                file_name: unit_file ? unit_file[0].name.split("_").slice(0, -1).join("_") : null
            });
        });
    };

    render() {
        return (
            <Grid>
                <Grid.Column textAlign='left'>
                    <Header
                        as='h4'
                        color={ this.props.line.upload_filename === this.state.name ? "" : "red" } >
                    {this.state.file_name}
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default NameHelper;

