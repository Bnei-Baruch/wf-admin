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
        const {active, language} = this.props;
        filedata.file_type = "1";
        filedata.product_id = active;
        filedata.language = language;
        filedata.mime_type = filedata.type;
        delete filedata.type;
        delete filedata.url;
        console.log(":: ProductFiles - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/products`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
    };

    getFilesJob = () => {
        getData(`files/find?key=product_id&value=${this.props.active}`, (files) => {
            console.log(":: Files DB Data: ", files);
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
