import React, { Component } from 'react';
import {Progress, Modal, Segment, Icon, Button, Divider, Header, Select, Grid, Checkbox} from 'semantic-ui-react';
import Upload from 'rc-upload';
import {
    getData,
    getMediaType,
    getToken,
    putData,
    toHms,
    WFDB_BACKEND,
    WFNAS_BACKEND,
} from "../../shared/tools";
import {LANG_MAP, PRODUCT_FILE_TYPES, PRODUCT_FILE_TYPES_ALL} from "../../shared/consts";

class FilesUpload extends Component {

    state = {
        archive: false,
        change: false,
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

    startUpload = () => {
        this.setState({uploading: true});
    };

    uploadDone = (file_data) => {
        console.log(":: ProductFiles - got data: ", file_data);
        let {progress} = this.state;
        getData(`files/find?sha1=${file_data.sha1}`, (files_sha) => {
            console.log(":: Files DB Data: ", files_sha);
            if(files_sha.length > 0) {
                alert("File already exist!");
                this.closeModal();
            } else {
                const {product_id, language} = this.props;
                file_data.product_id = product_id;
                file_data.language = language;
                file_data.mime_type = file_data.type;
                file_data.properties = {upload_name: file_data.file_name};
                const file_type = getMediaType(file_data.type)
                const options = PRODUCT_FILE_TYPES[language] ? PRODUCT_FILE_TYPES[language][file_type] : PRODUCT_FILE_TYPES_ALL[file_type];
                const file_type_options = options.map(data => {
                    return ({key: data, value: data, text: data})
                });
                delete file_data.type;
                delete file_data.url;
                delete progress[file_data.file_name];
                this.setState({progress, file_type_options, file_data});
            }
        });
    };

    saveFile = () => {
        const {file_data, file_type, archive, change} = this.state;
        const {to_mdb} = this.props;

        file_data.file_type = file_type;
        file_data.file_name = this.props.file_name;
        file_data.properties.archive = archive;
        file_data.properties.mdb = false;
        if(change) {
            file_data.properties.change_sha1 = to_mdb.sha1;
            file_data.properties.change_id = to_mdb.file_id;
        }
        putData(`${WFNAS_BACKEND}/file/save`, file_data, (file_meta) => {
            console.log(":: UploadApp - workflow respond: ",file_meta);
            if(archive && file_meta.media_info) {
                const d = toHms(file_meta.media_info.format.duration);
                fetch(`${WFDB_BACKEND}/products/${file_data.product_id}/properties?key=duration&value=${d}`,
                    { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
            }
            this.saveMeta(file_meta);
        });
    };

    saveMeta = (file_meta) => {
        putData(`${WFDB_BACKEND}/files/${file_meta.file_id}`, file_meta, (cb) => {
            console.log(":: saveMetadata respond: ",cb);
            this.setState({file_data: null, progress: {}, file_type: null, file_type_options: [], archive: false, uploading: false});
            this.props.onFileUploaded();
        });
    };

    closeModal = () => {
        this.setState({file_data: null, progress: {}, file_type: null, file_type_options: [], archive: false, uploading: false});
        this.props.toggleUpload();
    };

    render() {

        const {progress, file_type, file_type_options, archive, change, uploading} = this.state;

        let files_progress = Object.keys(progress).map((id) => {
            let count = progress[id];
            return (<Progress key={id} label={id} percent={count} indicating progress='percent' />)
        });

        const props = {
            action: `${WFNAS_BACKEND}/products/upload`,
            headers: {'Authorization': 'bearer ' + getToken()},
            type: 'drag',
            accept: '',
            multiple: false,
            beforeUpload(file) {
                console.log('beforeUpload', file);
            },
            onError(err) {
                console.log('onError', err);
            },

        };

        return (
            <Modal closeOnDimmerClick={false}
                   onClose={this.closeModal}
                   open={this.props.show_upload}
                   size='tiny'
                   closeIcon="close">
                <Modal.Header>Add Files For {LANG_MAP[this.props.language].text}</Modal.Header>
                <Modal.Content>
                    {file_type_options.length > 0 ?
                        <Grid columns='equal'>
                            <Grid.Column>
                                <Select
                                    fluid
                                    error={!file_type}
                                    options={file_type_options}
                                    placeholder='File Type'
                                    value={file_type}
                                    onChange={(e, {value}) => this.setState({file_type: value})}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Segment size='mini' basic>
                                    <Checkbox label='File for Archive' checked={archive} disabled={this.props.to_mdb}
                                              onChange={() => this.setState({archive: !archive})} />
                                </Segment>
                                <Segment size='mini' basic>
                                    <Checkbox label='Change in Archive' checked={change} disabled={!this.props.to_mdb}
                                              onChange={() => this.setState({change: !change, archive: !change})} />
                                </Segment>
                            </Grid.Column>
                        </Grid>
                        : null}
                    <Segment basic>
                        <Upload {...props} onStart={this.startUpload} onSuccess={this.uploadDone} onProgress={this.progress} >
                            {!uploading ?
                            <Segment placeholder>
                                <Header icon>
                                    <Icon name='cloud upload' />
                                    Drag ans drop files here
                                </Header>
                                <Divider horizontal>Or</Divider><br />
                                <Button primary>Browse Files</Button>
                            </Segment>
                                : null}
                        </Upload>
                    </Segment>
                    {files_progress}
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.closeModal} >Cancel</Button>
                    <Button positive={true} disabled={!file_type} onClick={this.saveFile} >Apply</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FilesUpload;
