import React, { Component } from 'react';
import { Progress,Message } from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getToken, WFSRV_BACKEND} from "../../shared/tools";

class ProductUpload extends Component {

    state = {
        file: null,
        percent: 0,
        uploading: false,
    };

    progress = (step, file) => {
        let count = Math.round(step.percent);
        //console.log('onProgress', step, file.name);
        this.setState({percent: count});
    };

    beforeUpload = (file) => {
        this.setState({uploading: true});
        console.log('beforeUpload', file.name);
    };

    onStart = (file) => {
        this.setState({file});
        console.log('onStart', file.name);
    };

    onError = (err) => {
        this.setState({uploading: false, file: null});
        console.log('onError', err);
        alert(err)
    };

    uploadDone = (file) => {
        this.props.onFileData(file);
        this.setState({percent: 0, uploading: false, file: null});
    };

    render() {
        const {uploading, file} = this.state;

        const props = {
            action: `${WFSRV_BACKEND}/job/upload`,
            headers: {'Authorization': 'bearer ' + getToken()},
            type: 'drag',
            accept: '.mp4',
        };

        return (
            <Message>
                <Upload
                    {...this.props}
                    {...props}
                    className={uploading ? "uploading" : "aricha"}
                    openFileDialogOnClick={!uploading}
                    onStart={this.onStart}
                    beforeUpload={this.beforeUpload}
                    onError={this.onError}
                    onSuccess={this.uploadDone}
                    onProgress={this.progress} >
                    {uploading ? "Uploading... " : "Drop your complete product here or click me for select from local disk"}
                </Upload>
                <Progress label={file?.name ? file?.name : ''} percent={this.state.percent} indicating progress='percent' />
            </Message>
        );
    }
}

export default ProductUpload;
