import React, {Component} from 'react'
import {WFDB_BACKEND, getToken, getMediaType, putData, postData} from '../../shared/tools';
import {Divider, Button, Modal, Grid, Confirm, Segment, Select} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import {PRODUCT_FILE_TYPES} from "../../shared/consts";

class FileManager extends Component {

    state = {
        active: null,
        file_type: "",
        langs_files: {},
        product_name: "",
        files: [],
        product_data: {},
        filedata: {},
        language: "heb",
        original_language: "heb",
        metadata: {},
        showConfirm: false,
        showEditFile: false,
    };

    checkEdit = () => {
        if(this.props.file_data) {
            const {file_type} = this.props.file_data;
            this.setState({file_type});
        } else {
            this.setState({file_type: ""});
        }
    };

    sortFiles = () => {
        const {langs, files} = this.props;
        Object.keys(langs).map(l => langs[l]["files"] = files.filter(f => f.language === l));
        this.setState({langs_files: langs});
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    setRemoved = () => {
        let {file_data} = this.props;
        console.log(":: FileManager - set removed: ", file_data);
        fetch(`${WFDB_BACKEND}/files/${file_data.file_id}/status/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        this.setState({showConfirm: false});
        setTimeout(() => {
            this.props.getProductFiles();
            this.props.toggleFileManager();
        }, 1000)
    };

    saveFileData = () => {
        const {file_data} = this.props;
        file_data.file_type = this.state.file_type;
        delete file_data.id;
        putData(`${WFDB_BACKEND}/files/${file_data.file_id}`, file_data, (cb) => {
            console.log(":: EditFile respond: ",cb);
            this.setState({showEditFile: false});
            this.props.getProductFiles();
        });
    };

    makeUnit = () => {
        const data = {
            "type_id":29,
            "properties":{
                "film_date":"2021-07-09",
                "original_language":"he",
                "pattern":"test-pattern-wf2"},
            "i18n":{
                "he":{"name":"test_heb_title","language":"he"},
                "en":{"name":"test_eng_title","language":"en"},
                "ru":{"name":"test_rus_title","language":"ru"}
            }
        };
        postData("http://dev.mdb.bbdomain.org/rest/content_units/", data, (cb) => {
            console.log("makeUnit: ", cb)
        });
    };

    render() {
        const {showConfirm, showEditFile, file_type} = this.state;
        const {source, file_data} = this.props;
        if(Object.keys(file_data).length === 0) return null

        const full_name = file_data.file_name+'.'+file_data.extension;

        const type = getMediaType(file_data.mime_type)
        const file_type_options = PRODUCT_FILE_TYPES[file_data.language][type].map(data => {
            return ({key: data, value: data, text: data})
        });

        const message = (
            <div>
                <Segment size='massive' basic textAlign='center'>Delete {full_name}?</Segment>
                <Segment size='massive' basic textAlign='center'>This action can't be undone!</Segment>
            </div>
        )

        return (
            <Modal closeOnDimmerClick={false}
                   onMount={this.checkEdit}
                   onClose={this.props.toggleFileManager}
                   open={this.props.show_filemanager}
                   size='small'
                   closeIcon="close">
                <Modal.Header style={{display: "flex", justifyContent: "center"}}>{full_name}</Modal.Header>
                <Modal.Content>
                    <Grid textAlign='center'>
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                <Modal
                                    onClose={() => this.setState({showEditFile: false})}
                                    onOpen={() => this.setState({showEditFile: true})}
                                    open={showEditFile}
                                    trigger={<Button color='green' basic content='Edit' />}
                                    size='small'>
                                    <Modal.Content>
                                        <Segment size='massive' basic textAlign='center'>Change File Type.</Segment>
                                        <Segment size='massive' basic textAlign='center'>{full_name}</Segment>
                                        <Segment size='small' basic textAlign='center'>
                                            <Select fluid
                                                error={!file_type}
                                                options={file_type_options}
                                                placeholder='File Type'
                                                value={file_type}
                                                onChange={(e, {value}) => this.setState({file_type: value})}
                                            />
                                        </Segment>
                                    </Modal.Content>
                                    <Modal.Actions>
                                        <Button onClick={() => this.setState({showEditFile: false})} >Cancel</Button>
                                        <Button positive={true} disabled={!file_type} onClick={this.saveFileData} >Apply</Button>
                                    </Modal.Actions>
                                </Modal>
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='red' basic content='Delete' onClick={() => this.setState({showConfirm: true})} />
                                <Confirm
                                    content={message}
                                    open={showConfirm}
                                    onCancel={() => this.setState({showConfirm: false})}
                                    onConfirm={this.setRemoved}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Divider hidden />
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                <Modal trigger={<Button color='blue' basic content='Play' />} size='tiny'>
                                    <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                                </Modal>
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='violet' basic content='Download' href={source} download />
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='orange' basic content='Youtube' />
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='yellow' basic content='Mdb' onClick={this.makeUnit} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleFileManager} >Cancel</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileManager;
