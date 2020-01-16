import React, { Component } from 'react';
import {Progress, Container, Divider} from 'semantic-ui-react';
import Upload from 'rc-upload';
import {WFSRV_BACKEND} from "../../shared/tools";
class UploadFile extends Component {

    state = { percent: 0 };

    progress = (step, file) => {
        let count = Math.round(step.percent);
        this.setState({percent: count});
    };

    uploadDone = (file) => {
        this.props.onFileData(file);
        this.setState({percent: 0})
    };

    render() {

        const props = {
            action: `${WFSRV_BACKEND}/insert/upload`,
            type: 'drag',
            onError(err) {
                console.log('onError', err);
            },

        };

        return (
            <Container textAlign='center'>
                <Divider hidden />
                <Upload
                    {...props}
                    className={this.props.mode === "1" ? "insert" : "update"}
                    onSuccess={this.uploadDone}
                    onProgress={this.progress} >
                    Drop file here or click me
                </Upload>
                <Progress label='' percent={this.state.percent} indicating progress='percent' />
            </Container>
        );
    }
}

export default UploadFile;
