import React, { Component } from 'react';
import {Progress, Modal, Segment, Icon, Button, Divider, Header, Select} from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getMediaType, getToken, putData, WF_BACKEND, WFSRV_BACKEND} from "../../shared/tools";
import {LANG_MAP, PRODUCT_FILE_TYPES} from "../../shared/consts";

class FilesUpload extends Component {

    state = {
        file_data: null,
        progress: {},
        file_type: null,
        file_type_options:[],
    };

    progress = (step, file) => {
        let {progress} = this.state;
        let count = Math.round(step.percent);
        progress[file.name] = count;
        this.setState({progress});
    };

    uploadDone = (file_data) => {
        //TODO: Check if file already exist
        console.log(":: ProductFiles - got data: ", file_data);
        let {progress} = this.state;
        const {product_id, language} = this.props;
        file_data.product_id = product_id;
        file_data.language = language;
        file_data.mime_type = file_data.type;
        file_data.properties = {upload_name: file_data.file_name};
        const file_type = getMediaType(file_data.type)
        const file_type_options = PRODUCT_FILE_TYPES[language][file_type].map(data => {
            return ({key: data, value: data, text: data})
        });

        delete file_data.type;
        delete file_data.url;
        delete progress[file_data.file_name];
        this.setState({progress, file_type_options, file_data});
    };

    saveFileData = () => {
        const {file_data, file_type} = this.state;
        file_data.file_type = file_type;
        file_data.file_name = this.props.file_name;
        putData(`${WFSRV_BACKEND}/workflow/products`, file_data, (cb) => {
            console.log(":: UploadApp - workflow respond: ",cb);
            this.props.onFileUploaded();
        });
    }

    render() {

        const {progress, file_type, file_type_options} = this.state;

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
                    {file_type_options.length > 0 ?
                        <Select
                            error={!file_type}
                            options={file_type_options}
                            placeholder='File Type'
                            value={file_type}
                            onChange={(e, {value}) => this.setState({file_type: value})}
                        /> : null}
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
                    <Button positive={true} disabled={!file_type} onClick={this.saveFileData} >Apply</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FilesUpload;
