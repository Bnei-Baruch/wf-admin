import React, {Component} from 'react'
import {getData, WFDB_BACKEND, WFSRV_BACKEND, getToken} from '../../shared/tools';
import {Menu, Button, Modal, Message, Table, Input} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import FilesUpload from "../Upload/FilesUpload";

class ProductFiles extends Component {

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
        show_upload: false,

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

    onFileUploaded = () => {
        this.setState({upload: false});
        this.props.getProductFiles();
        this.toggleUpload();
    };

    toggleUpload = () => {
        this.setState({show_upload: !this.state.show_upload});
    };

    render() {

        const {source, language, show_upload} = this.state;

        const files_list = this.props.files.map(f => {
            const {date, language, file_id, file_name} = f;
            if(language === this.props.lang) {
                return(
                    <Table.Row key={file_id} >
                        <Table.Cell selectable>{file_name}</Table.Cell>
                        <Table.Cell selectable>{date}</Table.Cell>
                    </Table.Row>
                )
            }
            }
        );

        return (
            <Table basic='very' striped>
                { this.state.active ?
                <Message>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Button color='teal' icon='download' disabled={!source} href={this.state.source} download />
                        </Menu.Item>
                    </Menu>
                </Message> : null}
                <Table.Header>
                    <Table.Row>
                        <Table.Cell singleLine><Input label='Title' /></Table.Cell>
                        <Table.Cell><Input label='Description'/></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell>Files &nbsp;&nbsp;&nbsp;
                            <Button basic compact positive
                                    onClick={this.toggleUpload}>ADD FILE</Button></Table.Cell>
                        <Table.Cell />
                        <FilesUpload product_id={this.props.product_id} language={this.props.lang} show_upload={show_upload}
                                     onFileUploaded={this.onFileUploaded}
                                     toggleUpload={this.toggleUpload} />
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell />
                        <Table.Cell />
                    </Table.Row>
                </Table.Header>
                    {files_list}
            </Table>
        );
    }
}

export default ProductFiles;
