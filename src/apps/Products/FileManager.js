import React, {Component} from 'react'
import {getData, WFDB_BACKEND, WFSRV_BACKEND, getToken} from '../../shared/tools';
import {Menu, Button, Modal, Message, Table} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import {LANG_MAP} from "../../shared/consts";

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
        let {product_data} = this.state;
        console.log(":: Censor - set removed: ", product_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/products/${product_data.product_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    render() {

        const {source} = this.props;

        return (
            <Modal closeOnDimmerClick={false}
                   onClose={this.props.toggleFileManager}
                   open={this.props.show_filemanager}
                   size='large'
                   closeIcon="close">
                <Modal.Header>{this.props.file_data.file_name}</Modal.Header>
                <Modal.Content>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='blue' basic content='Play' />} size='tiny'>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='violet' basic content='Download' href={source} download />
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='orange' basic content='Youtube' />
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='yellow' basic content='Mdb'/>
                        </Menu.Item>
                    </Menu>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleFileManager} >Cancel</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileManager;