import React, { Component } from 'react';
import { Label,Progress,Message,Segment } from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getToken, WF_BACKEND} from "../../shared/tools";

class RawUpload extends Component {

    state = {
        progress: {},
    };

    progress = (step, file) => {
        let {progress} = this.state;
        let count = Math.round(step.percent);
        progress[file.name] = count;
        this.setState({progress});
    };

    uploadDone = (file) => {
        let {progress} = this.state;
        this.props.onFileData(file);
        console.log("Upload done", file);
        delete progress[file.file_name];
        this.setState({progress})
    };

    render() {

        const {progress} = this.state;

        let files_progress = Object.keys(progress).map((id) => {
            let count = progress[id];
            return (<Progress key={id} label={id} percent={count} indicating progress='percent' />)
            });

        const props = {
            action: `${WF_BACKEND}/raw/upload`,
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
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label">Cloud</Label>
                <Message>
                    <Upload
                        {...this.props}
                        {...props}
                        className="raw"
                        onSuccess={this.uploadDone}
                        onProgress={this.progress} >
                        Drop file here or click me
                    </Upload>
                    {files_progress}
                </Message>
            </Segment>
        );
    }
}

export default RawUpload;
