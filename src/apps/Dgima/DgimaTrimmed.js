import React, {Component} from 'react'
import moment from 'moment';
import {
    getData,
    getDCT,
    getUnits,
    IVAL, MDB_FINDSHA,
    newTrimMeta,
    putData,
    WFDB_BACKEND,
    WFSRV_BACKEND
} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Select, Message, Dropdown } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertApp from "../Insert/InsertApp"
import CIT from '../CIT/CIT';

class DgimaTrimmed extends Component {

    state = {
        actived: null,
        cit_open: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        dgima: [],
        file_data: {},
        filedata: {},
        join_files: [],
        kmedia_option: false,
        metadata: {},
        input_id: "",
        ival: null,
        renaming: false,
        rename_button: true,
        send_button: true,
        sending: false,
        special: "buffer",
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => getData('drim', (data) => {
                if (JSON.stringify(this.state.dgima) !== JSON.stringify(data))
                    this.setState({dgima: data})
            }), IVAL );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: DgimaApp - selected file: ", file_data);
        const {renamed,wfsend} = file_data.wfstatus;
        // If we got line, we can build meta for insert
        if (file_data.line && file_data.line.content_type) {
            // Take sha for mdb fetch
            let sha1 = file_data.original.format.sha1;
            // Build data for insert app
            let filename = file_data.file_name;
            let date = file_data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];
            // Make insert metadata
            let insert_data = {};
            insert_data.insert_id = "i"+moment().format('X');
            insert_data.line = file_data.line;
            insert_data.line.mime_type = "video/mp4";
            insert_data.content_type = getDCT(file_data.line.content_type);
            insert_data.date = date;
            insert_data.file_name = file_data.file_name;
            insert_data.extension = "mp4";
            insert_data.insert_name = `${file_data.file_name}.${insert_data.extension}`;
            // In InsertApp upload_filename use for filename gen in OldWF
            insert_data.line.upload_filename = insert_data.insert_name;
            insert_data.insert_type = "3";
            insert_data.language = file_data.line.language;
            insert_data.send_id = file_data.dgima_id;
            insert_data.send_uid = "";
            insert_data.upload_type = "dgima";
            insert_data.sha1 = file_data.original.format.sha1;
            insert_data.size = parseInt(file_data.original.format.size, 10);
            this.setState({filedata: {filename}, metadata:{...insert_data}});
            getUnits(`${MDB_FINDSHA}/${sha1}`, (units) => {
                console.log(":: Trimmer - got units: ", units);
                if (units.total > 0)
                    console.log("The file already got unit!");
                this.setState({units});
            });
        }
        // Build url for preview
        let path = file_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        // Take date from string if exit
        if((/\d{4}-\d{2}-\d{2}/).test(file_data.file_name)) {
            let string_date = file_data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];
            file_data.line = {...file_data.line, capture_date: string_date};
        }
        if(file_data.parent.source === "cassette") {
            this.setState({
                file_data, source,
                actived: file_data.dgima_id,
                insert_button: !renamed || wfsend,
                rename_button: wfsend,
                send_button: !renamed || wfsend,
                kmedia_option: wfsend,
                special: "cassette",
            });
        } else {
            this.setState({
                file_data, source,
                actived: file_data.dgima_id,
                insert_button: !renamed || wfsend,
                rename_button: wfsend,
                send_button: !renamed,
                kmedia_option: wfsend,
            });
        }
    };

    getPlayer = (player) => {
        console.log(":: Dgima - got player: ", player);
        //this.setState({player: player});
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {file_data} = this.state;
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let src = file_data.parent.source;
        // Set capture date from string becouse CIT put today date
        //TODO: Check if date valid
        let string_date = newfile_name.match(/\d{4}-\d{2}-\d{2}/)[0];
        newline.capture_date = string_date;
        let ext = newline.mime_type === "video/mp4" ? "mp4" : "mp3";
        let opath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}o.${ext}`;
        let ppath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}p.${ext}`;
        file_data.line = {...newline};
        file_data.parent.file_name = oldfile_name;
        //file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;
        // Build url for preview
        let path = file_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({upload_filename: oldfile_name, cit_open: false, insert_button: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
            console.log(":: Dgima - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({ file_data, source, renaming: false, insert_button: false}), 2000);
            } else {
                setTimeout(() => this.setState({renaming: false}), 2000);
            }
        });
    };

    setSpecial = (special) => {
        console.log(":: Selected send options: ", special);
        this.setState({special});
    };

    openCit = () => {
        this.setState({cit_open: true});
    };

    openInsert = () => {
        let {file_data} = this.state;
        // Dgima from insert we make unit in send
        if(file_data.parent.source === "dgima") {
            file_data.special = "new";
            console.log(":: Going to send: ",file_data);
            this.setState({inserting: true, insert_button: true });
            putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
                console.log(":: Dgima - send respond: ",cb);
                // While polling done it does not necessary
                //this.selectFile(file_data);
                if(cb.status === "ok") {
                    setTimeout(() => this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true}), 2000);
                } else {
                    alert("Something goes wrong!");
                    this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true});
                }
            });
        } else if(file_data.parent.source === "congress" && file_data.line.content_type === "FULL_LESSON") {
            file_data.special = "congress";
            console.log(":: Going to send: ",file_data);
            this.setState({inserting: true, insert_button: true });
            putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
                console.log(":: Dgima - send respond: ",cb);
                // While polling done it does not necessary
                //this.selectFile(file_data);
                if(cb.status === "ok") {
                    setTimeout(() => this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true}), 2000);
                } else {
                    alert("Something goes wrong!");
                    this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true});
                }
            });
        } else if(file_data.parent.source === "cassette") {
            this.setState({insert_open: true});
        } else {
            alert("Dgima source unknown")
        }
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    onInsert = (data) => {
        console.log(":: Got insert data: ", data);
        this.setState({insert_open: false});
        this.setMeta(data);
    };

    setMeta = (insert_data) => {
        let {file_data} = this.state;
        file_data.parent.insert_id = insert_data.insert_id;
        file_data.parent.name = insert_data.line.send_name;
        file_data.line.uid = insert_data.line.uid;
        file_data.line.mime_type = "video/mp4";
        this.setState({inserting: true, insert_button: true });
        insert_data.send_id = file_data.dgima_id;
        insert_data.line.source = file_data.parent.source;
        // Now we put metadata to mdb on backend
        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
            console.log(":: DgimaApp - workflow respond: ",cb);
            if(cb.status === "ok") {
                // After that correct only throw fix workflow
                file_data.wfstatus.wfsend = true;
                setTimeout(() => this.setState({...file_data, inserting: false, insert_button: false, send_button: false, kmedia_option: true}), 2000);
                putData(`${WFDB_BACKEND}/dgima/${file_data.dgima_id}`, file_data, (cb) => {
                    console.log(":: PUT Respond: ",cb);
                    // Here we send without creation unit
                    if(file_data.parent.source === "cassette") {
                        file_data.special = "cassette";
                        putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
                            console.log(":: Dgima - send respond: ",cb);
                        });
                    }
                });
            } else {
                alert("Something goes wrong!");
                this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true});
            }
        });
    };

    sendFile = () => {
        let {file_data,special} = this.state;
        file_data.special = special;
        console.log(":: Going to send File: ", file_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
            console.log(":: Dgima - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectFile(file_data);
            if(cb.status === "ok") {
                setTimeout(() => {this.setState({ sending: false, send_button: false });}, 1000);
            } else {
                alert("Something goes wrong!");
                this.setState({ sending: false, send_button: false });
            }
        });

    };

    setRemoved = () => {
        const {file_data} = this.state;
        console.log(":: Dgima - set removed: ", file_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/dgima/${file_data.dgima_id}/wfstatus/removed?value=true`, { method: 'POST',})
    };

    fileToJoin = (join_files) => {
        console.log(join_files);
        this.setState({ join_files });
    };

    sendToJoin = () => {
        const {join_files} = this.state;
        this.setState({ join_files: [] });
        let join_meta = newTrimMeta(join_files[0], "join", "joined");
        join_meta.original_join = join_files.map(obj => obj.original.format.filename);
        join_meta.proxy_join = join_files.map(obj => obj.proxy.format.filename);
        join_meta.parent.original_shas = join_files.map(obj => obj.original.format.sha1);
        join_meta.parent.proxy_shas = join_files.map(obj => obj.proxy.format.sha1);
        join_meta.parent.dgima_ids = join_files.map(obj => obj.dgima_id);
        if(join_files[0].line) join_meta.parent.label_ids = join_files.map(obj => obj.line.label_id);
        //join_meta.file_name = join_files[0].file_name + "_join";
        delete join_meta.parent.id;
        //delete join_meta.parent.file_name;
        delete join_meta.parent.capture_id;
        delete join_meta.parent.original_sha1;
        delete join_meta.parent.proxy_sha1;
        delete join_meta.inpoints;
        delete join_meta.outpoints;
        console.log("Sending to join: ", join_meta);
        putData(`${WFSRV_BACKEND}/workflow/join`, join_meta, (cb) => {
            console.log(":: Join - respond: ",cb);
            if(cb.status !== "ok") {
                alert("Something goes wrong!");
                this.setState({ join_files });
            }
        });
    };

    render() {
        const {actived,dgima,kmedia_option,file_data,source,renaming,rename_button,cit_open,filedata,metadata,join_files} = this.state;

        const send_options = [
            { key: 'buffer', text: 'Buffer', value: 'buffer' },
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia', disabled: !kmedia_option },
            // { key: 'youtube', text: 'Youtube', value: 'youtube' },
            { key: 'metus', text: 'Metus', value: 'metus' },
            { key: 'Backup', text: 'Backup', value: 'backup' },
        ];

        const join_data = dgima
            .filter(data => data.parent.source === "cassette")
            .map(data => {
            const {id, file_name} = data;
            return ({key: id, text: file_name, value: data})
        });

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let j = (<Icon color='blue' name='linkify'/>);
        let s = (<Icon color='red' name='key'/>);

        let dgima_data = dgima.map((data) => {
            const {locked,trimmed,backup,kmedia,metus,removed,wfsend,censored,youtube,checked,buffer,joined,secured} = data.wfstatus;
            let id = data.dgima_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = actived === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} disabled={!trimmed || locked || (censored && !checked)}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>
                        {secured ? s : ""}
                        {censored ? c : ""}
                        {locked ? d : ""}
                        {joined ? j : ""}
                        {name}
                    </Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell negative={!backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell negative={!kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!youtube}>{youtube ? v : x}</Table.Cell>
                    <Table.Cell negative={!metus}>{metus ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' color='brown' raised>
                <Label  attached='top' className="trimmed_label">
                    {file_data.file_name ? file_data.file_name : "Trimmed"}
                </Label>
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
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button color='blue' icon='tags'
                                                    loading={renaming}
                                                    disabled={rename_button}
                                                    onClick={this.openCit} />}
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
                                    <InsertApp filedata={filedata} metadata={metadata} onComplete={this.onInsert} />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' icon='close' onClick={this.setRemoved} />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            {file_data.parent && file_data.parent.source === "cassette" ? "" :
                            <Menu.Item>
                                <Select compact options={send_options} defaultValue='buffer'
                                        onChange={(e,{value}) => this.setSpecial(value)} />
                            </Menu.Item>}
                            <Menu.Item>
                                <Button positive icon="arrow right" disabled={this.state.send_button}
                                        onClick={this.sendFile} loading={this.state.sending} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BA</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>YT</Table.HeaderCell>
                            <Table.HeaderCell width={1}>ME</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {dgima_data}
                    </Table.Body>
                </Table>
                <Menu secondary>
                    <Menu.Item>
                        <Dropdown
                            className="join_files_dropdown"
                            placeholder="Select Files To Join:"
                            selection
                            multiple
                            upward
                            options={join_data}
                            value={join_files}
                            onChange={(e, {value}) => this.fileToJoin(value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={join_files.length < 2}
                                onClick={this.sendToJoin}>
                            Join
                        </Button>
                    </Menu.Item>
                </Menu>
            </Segment>
        );
    }
}

export default DgimaTrimmed;