import React, { Component } from 'react';
import { Progress,Message } from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getToken, putData, WF_BACKEND, WFSRV_BACKEND} from "../../shared/tools";

class FilesUpload extends Component {

    state = {
        progress: {},
    };

    progress = (step, file) => {
        let {progress} = this.state;
        let count = Math.round(step.percent);
        progress[file.name] = count;
        this.setState({progress});
    };

    uploadDone = (filedata) => {
        let {progress} = this.state;
        const {product_id, language} = this.props;
        filedata.file_type = "1";
        filedata.product_id = product_id;
        filedata.language = language;
        filedata.mime_type = filedata.type;
        delete filedata.type;
        delete filedata.url;
        console.log(":: ProductFiles - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/products`, filedata, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
        });
        console.log("Upload done", filedata);
        delete progress[filedata.file_name];
        this.setState({progress})
    };

    render() {

        const {progress} = this.state;

        let files_progress = Object.keys(progress).map((id) => {
            let count = progress[id];
            return (<Progress key={id} label={id} percent={count} indicating progress='percent' />)
            });

        const props = {
            action: `${WF_BACKEND}/products/upload`,
            headers: {'Authorization': 'bearer ' + getToken()},
            type: 'drag',
            accept: '',
            multiple: true,
            beforeUpload(file) {
                console.log('beforeUpload', file);
            },
            onStart(file) {
                console.log('onStart', file);
            },
            onError(err) {
                console.log('onError', err);
            },

        };

        return (
            <Message>
                <Upload
                    {...this.props}
                    {...props}
                    className="backup"
                    onSuccess={this.uploadDone}
                    onProgress={this.progress} >
                    Drop file here or click me
                </Upload>
                {files_progress}
            </Message>
        );
    }
}

export default FilesUpload;
