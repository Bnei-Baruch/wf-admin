import React, { Component } from 'react';
import { Progress,Message,Segment } from 'semantic-ui-react';
import Upload from 'rc-upload';

class ArichaUpload extends Component {

    state = { percent: 0 };

    progress = (step, file) => {
        let count = Math.round(step.percent);
        //console.log('onProgress', step, file.name);
        this.setState({percent: count});
    };

    uploadDone = (file) => {
        console.log(':: upload done: ', file);
        //this.props.onFileData(file);
        this.setState({percent: 0})
    };

    render() {

        const props = {
            action: 'http://wfsrv.bbdomain.org:8010/aricha/upload',
            type: 'drag',
            accept: '.mp4',
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
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
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
            </Segment>
        );
    }
}

export default ArichaUpload;