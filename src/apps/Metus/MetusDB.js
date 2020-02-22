import React, {Component} from 'react'
import moment from 'moment';
import {getData, getDCT, getUnits, MDB_FINDSHA, putData, WFSRV_BACKEND} from '../../shared/tools';
import { Menu, Input, Segment, Label, Table, Button, Modal, Message,Select } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertModal from "../Insert/InsertModal"

class MetusDB extends Component {

    state = {
        active: null,
        disabled: false,
        loading: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        file_data: {},
        metus: [],
        search: "",
        send_button: true,
        sending: false,
        special: "buffer",
    };

    componentDidMount() {
        console.log("-- MetusDB Mount --");
    };

    componentWillUnmount() {
        console.log("-- MetusDB Unmount --")
    };

    setStatusValue = (search) => {
        console.log(":: Selected value options: ", search);
        this.setState({search});
    };

    setSearchValue = () => {
        const {search} = this.state;
        this.setState({loading: true, disabled: true});
        console.log(":: Search in MetusDB: ", search);
        // Be sure we ask not many files so we can calculate sha1 on backend
        let key = search.split('.').length === 2 ? "sha1" : "name";
        getData(`metus/find?key=${key}&value=${search}`, (metus) => {
            console.log(":: MetusDB - respond: ",metus);
            this.setState({metus, loading: false, disabled: false});
        });
    };

    selectFile = (file_data) => {
        console.log(":: MetusDB - selected file: ",file_data);
        let path = file_data.unix_path;
        let source = `${WFSRV_BACKEND}${path}`;
        let file_name = file_data.filename.split('.')[0];
        this.setState({file_data, search: file_data.filename, source, active: file_data.metus_id});

        getData(`aricha/find?key=file_name&value=${file_name}`, (aricha) => {
            console.log(":: Aricha DB Data: ",aricha);
            this.setState({aricha});
        });
        getData(`trimmer/find?key=file_name&value=${file_name}`, (trimmer) => {
            console.log(":: Trimmer DB Data: ",trimmer);
            this.setState({trimmer});
        });
        getData(`dgima/find?key=file_name&value=${file_name}`, (dgima) => {
            console.log(":: Dgima DB Data: ",dgima);
            this.setState({dgima});
        });

        if(file_data.sha1 !== "") {
            getData(`trimmer/sha1?value=${file_data.sha1}`, (trimmer) => {
                console.log(":: Found trimmer DB Data by SHA1: ",trimmer);
                //this.setState({trimmer});
            });
            getUnits(`${MDB_FINDSHA}/${file_data.sha1}`, (units) => {
                console.log(":: Meuts - got units: ", units);
                if (units.total > 0) {
                    console.log("The file already got unit!");
                    this.setState({insert_button: true, kmedia_option: true});
                } else {
                    if (file_data.workflow.length === 0) {
                        // Build data for insert app
                        let insert_data = {};
                        insert_data.line = {};
                        insert_data.insert_id = "i"+moment().format('X');
                        insert_data.date = file_data.filename.match(/\d{4}-\d{2}-\d{2}/)[0];
                        [insert_data.file_name,insert_data.extension] = file_data.filename.split('.');
                        insert_data.insert_name = file_data.filename;
                        insert_data.sha1 = file_data.sha1;
                        insert_data.size = file_data.size;
                        insert_data.language = file_data.language;
                        insert_data.send_id = file_data.metus_id;
                        insert_data.insert_type = "1";
                        insert_data.send_uid = "";
                        insert_data.upload_type = "aricha";
                        insert_data.line.upload_filename = insert_data.insert_name;
                        insert_data.line.metus_id = file_data.metus_id;
                        insert_data.line.capture_date = insert_data.date;
                        insert_data.line.url = file_data.unix_path;
                        if(file_data.collection === "clip") insert_data.line.content_type = "CLIP";
                        if(file_data.collection === "program") insert_data.line.content_type = "VIDEO_PROGRAM_CHAPTER";
                        if(file_data.collection === "lecture") insert_data.line.content_type = "LECTURE";
                        if(insert_data.extension === "mp4") insert_data.line.mime_type = "video/mp4";
                        if(insert_data.extension === "mpg") insert_data.line.mime_type = "video/mpeg";
                        insert_data.content_type = getDCT(insert_data.line.content_type);
                        this.setState({filedata: {file_data}, metadata:{...insert_data}, insert_button: false, kmedia_option: false});
                    }
                }
                this.setState({units});
            });
        }
    };

    getPlayer = (player) => {
        console.log(":: Admin - got player: ", player);
        //this.setState({player: player});
    };

    openInsert = () => {
        const {metadata} = this.state;
        console.log(":: Going to insert metadata: ", metadata);
        this.setState({insert_open: true});
    };

    onInsert = (data) => {
        console.log(":: Got insert data: ", data);
        this.setState({insert_open: false});
        this.setMeta(data);
    };

    setMeta = (insert_data) => {
        this.setState({inserting: true, insert_button: true });
        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
            console.log(":: MetusApp - workflow respond: ",cb);
            if(cb.status === "ok") {
                alert("Insert successful :)");
                setTimeout(() => this.setState({ inserting: false, insert_button: true, send_button: false, kmedia_option: true}), 2000);
            } else {
                alert("Something gone wrong :(");
                this.setState({ inserting: false, insert_button: false});
            }
        });
    };

    onCancel = () => {
        this.setState({insert_open: false, insert_button: true});
    };

    setSpecial = (e, data) => {
        console.log(":: Selected send options: ", data.value);
        let special = data.value;
        this.setState({special});
    };

    sendFile = () => {
        let {file_data,special} = this.state;
        file_data.special = special;
        console.log(":: Going to send File: ", file_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        putData(`${WFSRV_BACKEND}/workflow/send_metus`, file_data, (cb) => {
            console.log(":: Metus - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectFile(file_data);
            if(cb.status === "ok") {
                setTimeout(() => {this.setState({ sending: false, send_button: false });}, 1000);
            } else {
                alert("Something goes wrong!");
            }
        });

    };

    getFromMetus = () => {
        let {file_data} = this.state;
        console.log(":: ArichaApp workflow from Metus: ", file_data);
        putData(`${WFSRV_BACKEND}/workflow/aricha`, file_data, (cb) => {
            console.log(":: ArichaApp workflow from Metus respond: ",cb);
        });
    };

    render() {

        const {loading,disabled,search} = this.state;

        const send_options = [
            { key: 'Buffer', text: 'Buffer', value: 'buffer' },
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia', disabled: !this.state.kmedia_option },
            { key: 'youtube', text: 'Youtube', value: 'youtube' },
        ];

        // let v = (<Icon name='checkmark'/>);
        // let x = (<Icon name='close'/>);
        // let l = (<Loader size='mini' active inline />);
        // let c = (<Icon color='blue' name='copyright'/>);
        // let f = (<Icon color='blue' name='configure'/>);

        let metus = this.state.metus.map((data) => {
            const {filename,metus_id,title} = data;
            let active = this.state.active === metus_id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    className={active} key={metus_id}
                    onClick={() => this.selectFile(data)} >
                    <Table.Cell>{filename}</Table.Cell>
                    <Table.Cell>{title}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised>
                <Label attached='top' className="trimmed_label">
                    {this.state.file_data.title ? this.state.file_data.title : "Metus"}
                </Label>
                <Input className='input_wfdb' type='text' placeholder='Search...' action
                       onChange={e => this.setStatusValue(e.target.value)} value={search}>
                    <input />
                    <Button type='submit' basic color='green' loading={loading} disabled={disabled} onClick={this.setSearchValue}>Search</Button>
                </Input>
                <Message size='large'>
                    <Menu size='large' secondary>
                        <Menu.Item>
                            <Modal size='tiny'
                                   trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                                <Modal { ...this.props }
                                       trigger={<Button color='teal' icon='archive'
                                                        loading={this.state.inserting}
                                                        disabled={this.state.insert_button}
                                                        onClick={this.openInsert} />}
                                       closeOnDimmerClick={true}
                                       closeIcon={true}
                                       onClose={this.onCancel}
                                       open={this.state.insert_open}
                                       size="large"
                                       mountNode={document.getElementById("ltr-modal-mount")}>
                                    <InsertModal filedata={this.state.filedata} metadata={this.state.metadata} onComplete={this.onInsert} />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='teal' icon='download' disabled={!this.state.source} href={this.state.source} download />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Select compact options={send_options} defaultValue='buffer'
                                        onChange={(e,data) => this.setSpecial(e,data)} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button positive icon="arrow right" disabled={this.state.send_button}
                                        onClick={this.sendFile} loading={this.state.sending} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="admin_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {metus}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default MetusDB;