import React, { Component } from 'react';
import { Container,Message } from 'semantic-ui-react';
import FilesUpload from "../Upload/FilesUpload";
import {getData, putData, WFSRV_BACKEND} from "../../shared/tools";

class ProductFiles extends Component {

    state = {
        files: [],
    };

    componentDidMount() {
        this.getFilesJob()
    };

    fileUploaded = (filedata) => {
        filedata.file_type = "files";
        filedata.archive_type = "files";
        filedata.send_id = this.props.active;
        filedata.line = {};
        filedata.line.mime_type = filedata.type;
        delete filedata.type;
        delete filedata.url;
        console.log(":: JobFiles - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/upload`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    getFilesJob = () => {
        getData(`files/find?key=send_id&value=${this.props.active}`, (files) => {
            console.log(":: Files DB Data: ",files);
            this.setState({files});
        });
    };


    render() {

        const {files} = this.state;

        let list_files = files.map((file,i) => {
            return (<p key={i} >{file.file_id}</p>)
        });

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>
                        Job Files
                    </Message.Header>
                    <FilesUpload onFileData={this.fileUploaded} />
                    {list_files}
                </Message>
            </Container>
        );
    }
}

export default ProductFiles;
