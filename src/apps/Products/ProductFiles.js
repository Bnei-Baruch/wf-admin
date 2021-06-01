import React, {Component} from 'react'
import {getData, WFDB_BACKEND, WFSRV_BACKEND, getToken} from '../../shared/tools';
import {Menu, Button, Modal, Message, List, Segment, Grid, Dropdown} from 'semantic-ui-react'
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
        upload: false,

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

        const {source, language, langs_files} = this.state;

        const files_list = Object.keys(langs_files).map(l => {
                const {name, description, files} = langs_files[l];
                return (
                    <List.Item>
                        <Grid columns='equal' inverted padded relaxed='very' >
                            <Grid.Row>
                                <Grid.Column>{name}</Grid.Column>
                                <Grid.Column>{description}</Grid.Column>
                            </Grid.Row>
                        </Grid>
                        {files.map(f => {
                            const {date, language, file_id, file_name} = f;
                            return(
                                <List selection>
                                    <List.Item active={this.state.active === file_id} key={file_id} onClick={() => this.selectFile(f)}>
                                        <List.Icon name='file' />
                                        <List.Content>
                                    <List.Header>
                                    <Grid>
                                        <Grid.Row>
                                            <Grid.Column>{language}</Grid.Column>
                                            <Grid.Column>{date}</Grid.Column>
                                            <Grid.Column width={3}>{file_name}</Grid.Column>
                                        </Grid.Row>
                                    </Grid>
                                    </List.Header>
                                        </List.Content>
                                    </List.Item>
                                </List>
                            )
                        })}
                    </List.Item>)
            }
        );

        return (
            <List>
                {this.state.upload ? <FilesUpload product_id={this.props.product_id} language={language} /> : ''}
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
                {files_list}
            </List>
        );
    }
}

export default ProductFiles;
