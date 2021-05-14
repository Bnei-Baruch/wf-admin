import React, { Component } from 'react';
import { Progress,Message,Segment } from 'semantic-ui-react';
import Upload from 'rc-upload';
import {WFSRV_BACKEND} from "../../shared/tools";

class ProductUpload extends Component {

    state = { percent: 0 };

    progress = (step, file) => {
        let count = Math.round(step.percent);
        //console.log('onProgress', step, file.name);
        this.setState({percent: count});
    };

    uploadDone = (file) => {
        this.props.onFileData(file);
        this.setState({percent: 0})
    };

    render() {

        const props = {
            action: `${WFSRV_BACKEND}/products/upload`,
            type: 'drag',
            accept: 'mp3, .mp4, .doc, .docx',
            beforeUpload(file) {
                console.log('beforeUpload', file.name);
            },
            onStart(file) {
                console.log('onStart', file.name);
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
                    className="aricha"
                    onSuccess={this.uploadDone}
                    onProgress={this.progress} >
                    Drop file here or click me
                </Upload>
                <Progress label='' percent={this.state.percent} indicating progress='percent' />
            </Message>
        );
    }
}

export default ProductUpload;
