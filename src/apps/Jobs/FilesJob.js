import React, { Component } from 'react';
import { Container,Message } from 'semantic-ui-react';
import FilesUpload from "../Upload/FilesUpload";
import {putData, WFSRV_BACKEND} from "../../shared/tools";

class FilesJob extends Component {

    state = {};

    componentDidMount() {
    };

    fileUploaded = (filedata) => {
        filedata.archive_type = "files";
        filedata.send_id = this.props.active;
        console.log(":: JobFiles - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
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

export default FilesJob;
