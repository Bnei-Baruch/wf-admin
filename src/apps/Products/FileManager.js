import React, {Component} from 'react'
import {getData, WFDB_BACKEND, WFSRV_BACKEND, getToken} from '../../shared/tools';
import {Divider, Button, Modal, Grid, Confirm, Segment} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";

class FileManager extends Component {

    state = {
        active: null,
        langs_files: {},
        product_name: "",
        files: [],
        product_data: {},
        filedata: {},
        language: "heb",
        original_language: "heb",
        metadata: {},
        source: null,
        showConfirm: false,
    };

    sortFiles = () => {
        const {langs, files} = this.props;
        Object.keys(langs).map(l => langs[l]["files"] = files.filter(f => f.language === l));
        this.setState({langs_files: langs});
    };

    getProductFiles = (product_id) => {
        getData(`files/find?key=product_id&value=${this.props.product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({files});
        });
    };

    selectFile = (data) => {
        console.log(":: ProductFiles - selected file: ", data);
        let path = data.properties.url;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({product_data: data, source, active: data.file_id});
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

    render() {
        const {showConfirm} = this.state;
        const {source, file_data} = this.props;

        const message = (
            <div>
                <Segment size='massive' basic textAlign='center'>Delete filename.mp4?</Segment>
                <Segment size='massive' basic textAlign='center'>This action can't be undone!</Segment>
            </div>
        )

        return (
            <Modal closeOnDimmerClick={false}
                   onClose={this.props.toggleFileManager}
                   open={this.props.show_filemanager}
                   size='small'
                   closeIcon="close">
                <Modal.Header style={{display: "flex", justifyContent: "center"}}>{file_data.file_name}</Modal.Header>
                <Modal.Content>
                    <Grid textAlign='center'>
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                <Modal trigger={<Button color='green' basic content='Edit' />} size='tiny'>
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
                                <Button color='yellow' basic content='Mdb'/>
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
