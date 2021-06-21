import React, { Component } from 'react';
import {Progress, Modal, Segment, Icon, Button, Divider, Header} from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getToken, putData, WF_BACKEND, WFSRV_BACKEND} from "../../shared/tools";
import {LANG_MAP} from "../../shared/consts";

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
            this.props.onFileUploaded();
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
            <Modal closeOnDimmerClick={false}
                   onClose={this.props.toggleUpload}
                   open={this.props.show_upload}
                   size='tiny'
                   closeIcon="close">
                <Modal.Header>Add Files For {LANG_MAP[this.props.language].text}</Modal.Header>
                <Modal.Content>
                    <Segment>
                        <Upload {...props} onSuccess={this.uploadDone} onProgress={this.progress} >
                            <Segment placeholder>
                                <Header icon>
                                    <Icon name='cloud upload' />
                                    Drag ans drop files here
                                </Header>
                                <Divider horizontal>Or</Divider><br />
                                <Button primary>Browse Files</Button>
                            </Segment>
                        </Upload>
                    </Segment>
                    {files_progress}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleUpload} >Cancel</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FilesUpload;
