import React, { Component } from 'react';
import { Container,Message } from 'semantic-ui-react';
import FilesUpload from "../Upload/FilesUpload";
import {getData, putData, WFSRV_BACKEND} from "../../shared/tools";

class ProductUpload extends Component {

    state = {
        files: [],
    };

    componentDidMount() {
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


    render() {

        const {files} = this.state;

        return (
            <Message>
                <FilesUpload onFileData={this.fileUploaded} />
            </Message>
        );
    }
}

export default ProductUpload;
