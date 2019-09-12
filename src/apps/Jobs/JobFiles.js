import React, { Component } from 'react';
import { Container,Message } from 'semantic-ui-react';
import moment from 'moment';
import FilesUpload from "./FilesUpload";
import {putData, WFSRV_BACKEND} from "../../shared/tools";

class JobFiles extends Component {

    state = {};

    componentDidMount() {
    };

    fileUploaded = (filedata) => {
        filedata.archive_type = "job";
        filedata.job_id = this.props.active;
        filedata.timestamp = moment().format('x');
        console.log(":: JobFiles - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/jobs`, filedata, (cb) => {
            console.log(":: JobsApp - workflow respond: ",cb);
            this.setState({job_id: null})
        });
    };


    render() {

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>
                        Job Files
                    </Message.Header>
                    <FilesUpload onFileData={this.fileUploaded} />
                    <p>List of job files here</p>
                    <p>List of job files here</p>
                    <p>List of job files here</p>
                </Message>
            </Container>
        );
    }
}

export default JobFiles;
