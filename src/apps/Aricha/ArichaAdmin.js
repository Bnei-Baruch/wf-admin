import React, {Component} from 'react'

import {
    getData,
    getUnits,
    IVAL,
    putData,
    WFDB_BACKEND,
    WFSRV_BACKEND,
    getDCT,
    insertName,
    arichaName,
    MDB_FINDSHA, getToken
} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Select, Message } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertModal from "../Insert/InsertModal"
import CIT from '../CIT/CIT';
import kc from "../../components/UserManager";

class ArichaAdmin extends Component {

    state = {
        active: null,
        cit_open: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        aricha: [],
        file_data: {},
        filedata: {},
        kmedia_option: false,
        metadata: {},
        input_id: "",
        ival: null,
        renaming: false,
        rename_button: true,
        send_button: true,
        sending: false,
        special: "backup",

    };

    componentDidMount() {
    };

    componentWillUnmount() {
        //clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: ArichaApp - selected file: ", file_data);
        const {wfsend} = file_data.wfstatus;

        // Build url for preview
        let path = file_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        if(!file_data.line?.hasOwnProperty('content_type')) {
            file_data.line = {language: "heb", content_type: "CLIP", has_translation: false};
        }
        this.setState({
            file_data, source,
            active: file_data.aricha_id,
            rename_button: false,
            send_button: !wfsend,
            filedata: {file_name: file_data.file_name},
            insert_button: true
            //kmedia_option: wfsend,
        });

        // Check SHA1 in WFDB
        getData(`trimmer/kv?sha1=${file_data.original.format.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in trimmer DB by SHA1: ",trimmer);
                alert("File did NOT changed from trimmer");
                //this.setState({trimmer});
            } else {

                // Check SHA1 in MDB
                let sha1 = file_data.original.format.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The SHA1 exist in MDB!", units);

                        // Check SHA1 in Workflow
                        insertName(sha1, "sha1", (data) => {
                            if (data.length > 0 && file_data.file_name !== data[0].file_name) {
                                file_data.line.old_name = data[0].file_name;
                                file_data.line.fix_aricha_id = data[0].send_id;
                                console.log("The SHA1 exist in WorkFlow!", data);
                                console.log("-- Rename Insert mode --");
                                alert("-- Rename Insert mode --");
                                this.newInsertData(file_data, data, "3");
                            } else if (data.length > 0 && file_data.file_name === data[0].file_name) {
                                console.log("-- Insert Done --");
                            } else {
                                console.log("The SHA1 exist in MDB but does NOT exist in WorkFlow!");
                                alert("File already in MDB, but did pass WorkFlow!");
                            }
                        });
                    } else {

                        // Check filename in Workflow
                        arichaName(file_data.file_name, (data) => {
                            if(data.length > 1 && data[data.length-2].original.format.sha1 !== file_data.original.format.sha1) {
                                file_data.line.old_sha1 = data[data.length-2].original.format.sha1;
                                file_data.line.fix_aricha_id = data[data.length-2].aricha_id;
                                file_data.line.fix_unit_uid = data[data.length-2].line.uid;
                                console.log("The Filename already exist in WorkFlow but SHA1 does NOT exist in MDB: ",data);
                                console.log("-- Update Insert mode --");
                                alert("-- Update Insert mode --");
                                this.newInsertData(file_data, data, "2");
                            } else if(data.length > 1 && data[data.length-2].original.format.sha1 === file_data.original.format.sha1) {
                                console.log("It's duplicate");
                                alert("It's duplicate");
                            } else {
                                console.log("-- New Insert mode --");
                                this.newInsertData(file_data, data, "1");
                            }

                        });
                    }
                });
            }
        });
    };

    newInsertData = (file_data, insert_old, insert_mode) => {
        if (file_data.line.content_type) {

            // Build data for insert app
            let date = file_data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];

            // Make insert metadata
            let insert_data = {};
            insert_data.insert_id = insert_old.length > 0 ? insert_old[0].insert_id : "i" + Math.floor(Date.now() / 1000);
            insert_data.line = file_data.line;
            insert_data.line.mime_type = "video/mp4";
            insert_data.content_type = getDCT(file_data.line.content_type);
            insert_data.date = date;
            insert_data.file_name = file_data.file_name;
            insert_data.extension = "mp4";
            insert_data.insert_name = `${file_data.file_name}.${insert_data.extension}`;

            // In InsertApp upload_filename use for filename gen in OldWF
            insert_data.line.upload_filename = insert_data.insert_name;
            insert_data.insert_type = insert_mode;
            insert_data.language = file_data.line.language;
            insert_data.send_id = file_data.aricha_id;
            insert_data.send_uid = insert_mode === "3" ? insert_old[0].line.uid : "";
            insert_data.upload_type = "aricha";
            insert_data.sha1 = file_data.original.format.sha1;
            insert_data.size = parseInt(file_data.original.format.size, 10);
            this.setState({metadata:{...insert_data}, insert_button: false});
        } else {
            console.log("Content Type not known, rename must be done");
        }
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openInsert = () => {
        this.setState({insert_open: true});
    };

    onInsert = (data) => {
        console.log(":: Got insert data: ", data);
        this.setState({insert_open: false});
        this.setMeta(data);
    };

    setMeta = (insert_data) => {
        let {file_data} = this.state;
        file_data.parent = {insert_id: insert_data.insert_id, name: insert_data.line.send_name};
        file_data.line.uid = insert_data.line.uid;
        file_data.line.mime_type = "video/mp4";
        file_data.wfstatus.wfsend = true;
        if(insert_data.insert_type !== "1") {
            file_data.wfstatus.fixed = true;
        }
        this.setState({inserting: true, insert_button: true });
        insert_data.send_id = file_data.aricha_id;

        // Now we put metadata to mdb on backend
        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
            console.log(":: ArichaApp - workflow respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({file_data, inserting: false, send_button: false, kmedia_option: true}), 2000);
                putData(`${WFDB_BACKEND}/aricha/${file_data.aricha_id}`, file_data, (cb) => {
                    console.log(":: PUT Respond: ",cb);
                    this.selectFile(file_data);
                });
                alert("Insert successful :)");
            } else {
                alert("Something gone wrong :(");
                this.setState({ inserting: false, insert_button: false});
            }
        });
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {file_data} = this.state;
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let opath = `/backup/aricha/${newfile_name}_${file_data.aricha_id}o.mp4`;
        file_data.line = {...newline};
        file_data.parent = {...{file_name: oldfile_name}};
        //file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;

        // If rename done after send we need to do insert
        if(file_data.wfstatus.wfsend) {
            file_data.wfstatus.wfsend = false;
        }
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({upload_filename: oldfile_name, cit_open: false, insert_button: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
            console.log(":: Ingest - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
                this.selectFile(file_data);
            } else {
                setTimeout(() => this.setState({renaming: false, disabled: file_data.wfstatus.wfsend}), 2000);
            }
        });
    };

    openCit = () => {
        this.setState({cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    setSpecial = (special) => {
        console.log(":: Selected send options: ", special);
        this.setState({special});
    };

    sendFile = () => {
        let {file_data,special} = this.state;
        file_data.special = special;
        console.log(":: Going to send File: ", file_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        putData(`${WFSRV_BACKEND}/workflow/send_aricha`, file_data, (cb) => {
            console.log(":: Aricha - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectFile(file_data);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
            } else {
                alert("Something goes wrong!");
            }
        });

    };

    setRemoved = () => {
        let {file_data} = this.state;
        console.log(":: Censor - set removed: ", file_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/aricha/${file_data.aricha_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    render() {

        const {file_data, source, renaming, rename_button, cit_open, inserting, insert_button, insert_open,
            filedata, metadata, special, send_button, sending} = this.state;

        const send_options = [
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia', disabled: !insert_button },
            { key: 'youtube', text: 'Youtube', value: 'youtube' },
            { key: 'metus', text: 'Metus', value: 'metus' },
            { key: 'Backup', text: 'Backup', value: 'backup' },
            { key: 'censor', text: 'Censor', value: 'censor' },
            { key: 'source', text: 'Source', value: 'source' },
        ];

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);

        let aricha = this.props.aricha.map((data) => {
            if(this.props.user.preferred_username === "zoya.kutsina@gmail.com" && !data.file_name.match("rus")) {
                return false;
            }
            const {backup,kmedia,metus,source,removed,wfsend,censored,checked,fixed,locked} = data.wfstatus;
            let id = data.aricha_id;
            let ready = data.proxy;
            let name = ready ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked || (censored && !checked)}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell negative={!backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell negative={!kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!source}>{source ? v : x}</Table.Cell>
                    <Table.Cell negative={!metus}>{metus ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised>
                <Label  attached='top' className="trimmed_label">
                    {file_data.file_name ? file_data.file_name : "Aricha Status"}
                </Label>
                {kc.hasRealmRole("wf_aricha_admin") ?
                    <Message>
                        <Menu size='large' secondary>
                            <Menu.Item>
                                <Modal trigger={<Button color='brown' icon='play' disabled={!source}/>}
                                       size='tiny'
                                       mountNode={document.getElementById("ltr-modal-mount")}>
                                    <MediaPlayer player={this.getPlayer} source={source} type='video/mp4'/>
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Modal closeOnDimmerClick={false}
                                       trigger={<Button color='blue' icon='tags'
                                                        loading={renaming}
                                                        disabled={rename_button}
                                                        onClick={this.openCit}/>}
                                       onClose={this.onCancel}
                                       open={cit_open}
                                       closeIcon="close"
                                       mountNode={document.getElementById("cit-modal-mount")}>
                                    <Modal.Content>
                                        <CIT metadata={file_data.line}
                                             onCancel={this.onCancel}
                                             onComplete={(x) => this.renameFile(x)}/>
                                    </Modal.Content>
                                </Modal>
                            </Menu.Item>
                            <Menu.Menu position='left'>
                                <Menu.Item>
                                    <Modal {...this.props}
                                           trigger={<Button color='teal' icon='archive'
                                                            loading={inserting}
                                                            disabled={insert_button}
                                                            onClick={this.openInsert}/>}
                                           closeOnDimmerClick={true}
                                           closeIcon={true}
                                           onClose={this.onCancel}
                                           open={insert_open}
                                           size="large"
                                           mountNode={document.getElementById("ltr-modal-mount")}>
                                        <InsertModal filedata={filedata} metadata={metadata} onComplete={this.onInsert}
                                                     user={this.props.user}/>
                                    </Modal>
                                </Menu.Item>
                                <Menu.Item>
                                    <Button color='red' icon='close' onClick={this.setRemoved}/>
                                </Menu.Item>
                            </Menu.Menu>
                            <Menu.Menu position='right'>
                                <Menu.Item>
                                    <Select compact options={send_options}
                                            defaultValue={special}
                                            placeholder='Send options'
                                            onChange={(e, {value}) => this.setSpecial(value)}/>
                                </Menu.Item>
                                <Menu.Item>
                                    <Button positive icon="arrow right"
                                            disabled={send_button}
                                            onClick={this.sendFile} loading={sending}/>
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>
                    </Message> : null
                }
                <Segment attached raised textAlign='center' className='censor_content'>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BA</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SR</Table.HeaderCell>
                            <Table.HeaderCell width={1}>ME</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {aricha}
                    </Table.Body>
                </Table>
                </Segment>
            </Segment>
        );
    }
}

export default ArichaAdmin;
