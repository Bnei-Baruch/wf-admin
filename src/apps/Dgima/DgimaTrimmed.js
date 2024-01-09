import React, {Component} from 'react'

import {
    getChildren,
    getData,
    IVAL,
    newTrimMeta,
    newInsertMeta,
    putData,
    WFDB_BACKEND,
    WFSRV_BACKEND, getToken
} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Select, Message, Dropdown, Checkbox, Confirm } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertModal from "../Insert/InsertModal"
import CIT from '../CIT/CIT';

class DgimaTrimmed extends Component {

    state = {
        actived: null,
        fix_mode: false,
        fix_button: false,
        confirm_open: false,
        cit_open: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        dgima: [],
        file_data: {},
        fix_unit: null,
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
        hide_censored: true,
        wfunits: [],
        wf_admin: false,

    };

    componentDidMount() {
        let wf_admin = !!this.props.user.roles.find(role => role === 'wf_admin');
        // let ival = setInterval(() => getData('cassette', (data) => {
        //         if (JSON.stringify(this.state.dgima) !== JSON.stringify(data))
        //             this.setState({dgima: data})
        //     }), 5000 );
        this.setState({wf_admin});
    };

    componentWillUnmount() {
        //clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: DgimaApp - selected file: ", file_data);
        const {fix_mode} = this.state;
        const {renamed,wfsend,secured} = file_data.wfstatus;

        if(!wfsend && fix_mode) {
            // Find files with units
            getChildren(file_data.parent.capture_id,"capture_id", (data) => {
                console.log(":: Got capture children: ", data);
                let wfunits = data.filter(d => d.wfstatus.wfsend && d.original.format.sha1 !== file_data.original.format.sha1 && !d.wfstatus.secured);
                if(wfunits.length === 0) {
                    console.log(":: Did not found children :: ");
                    this.setState({fixReq: false, wfunits: [], fix_unit: null, insert_button: true, rename_button: true, send_button: true});
                } else if(wfunits.length > 0) {
                    let wfunits_options = wfunits.map((wf,i) => {
                        return ({ key: i, text: wf.file_name, value: i })
                    });
                    this.setState({wfunits,wfunits_options,fixReq: true, insert_button: true, rename_button: true, send_button: true});
                    console.log(":: Found children :: ");
                }
            });
        } else {
            this.setState({wfunits: [], fix_unit: null, fixReq: false});
        }

        // Build meta for insert
        this.insertMeta(file_data);

        // Build url for preview
        let path = file_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        if(file_data.parent.source === "cassette") {
            this.setState({
                file_data, source,
                actived: file_data.dgima_id,
                insert_button: !renamed || fix_mode ? false : wfsend,
                rename_button: fix_mode ? false : wfsend,
                send_button: !renamed || fix_mode ? false : wfsend,
                kmedia_option: wfsend,
                special: "cassette",
            });
        } else {
            this.setState({
                file_data, source,
                actived: file_data.dgima_id,
                insert_button: !renamed || wfsend,
                rename_button: fix_mode ? false : wfsend,
                send_button: !renamed,
                kmedia_option: !wfsend || secured,
            });
        }
    };

    insertMeta = (file_data) => {
        let {filedata,metadata} = this.state;
        // If we got line, we can build meta for insert
        if (file_data.line && file_data.line.content_type) {
            metadata = newInsertMeta(file_data);
            // filedata needed for insert app
            filedata.file_name = file_data.file_name;
            this.setState({filedata, metadata});
        }
    };

    getPlayer = (player) => {
        console.log(":: Dgima - got player: ", player);
        //this.setState({player: player});
    };

    checkName = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {file_data,fix_mode} = this.state;
        let newfile_name = newline.final_name;

        // Check WFDB if name already exist
        getData(`dgima/find?key=file_name&value=${newfile_name}`, (data) => {
            let chk = data.find(n => n.file_name === newfile_name);
            console.log(":: CheckName result: ",data);
            if(data.length > 0 && chk) {
                alert("Name already exist!");
            } else {
                this.renameFile(file_data,newline,fix_mode);
            }
        });
    };

    renameFile = (file_data,newline,fix) => {
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let src = file_data.parent.source;

        // Set capture date from string because CIT put today date
        if((/\d{4}-\d{2}-\d{2}/).test(newfile_name)) {
            let string_date = newfile_name.match(/\d{4}-\d{2}-\d{2}/)[0];
            newline.capture_date = string_date;
        }

        let ext = "mp4";
        if(file_data.original.format.format_name === "mp3") {
            ext = "mp3";
            newline.mime_type = "audio/mp3";
        }
        let opath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}o.${ext}`;
        let ppath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}p.${ext}`;
        file_data.line = {...newline};
        file_data.parent.file_name = oldfile_name;
        //file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;
        if(fix) {
            // This status mean file must be fixed
            file_data.wfstatus.wfsend = false;
            file_data.wfstatus.fixed = null;
        }
        // Build url for preview
        let path = file_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({upload_filename: oldfile_name, cit_open: false, insert_button: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
            console.log(":: Dgima - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => {
                    this.setState({source, renaming: false, insert_button: false});
                    this.selectFile(file_data);
                }, 2000);
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
        const {fix_mode,file_data} = this.state;
        // Check if unit was created by workflow send or manually
        if(!fix_mode) {
            // Not FIX mode
            this.setState({cit_open: true});
        } else if(fix_mode && file_data.parent.insert_id) {
            // FIX mode and unit was created manually
            this.setState({cit_open: true});
        } else {
            // FIX mode and unit was created by workflow send
            alert("Not impelemnted yet :(");
        }
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
                    setTimeout(() => this.setState({ inserting: false, send_button: false, kmedia_option: true}), 2000);
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
                    setTimeout(() => this.setState({ inserting: false, send_button: false, kmedia_option: true}), 2000);
                } else {
                    alert("Something goes wrong!");
                    this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true});
                }
            });
        } else if(file_data.parent.source === "congress" && file_data.line.content_type !== "FULL_LESSON") {
            this.setState({insert_open: true});
        } else if(file_data.parent.source.match(/^(cassette|insert)$/)) {
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
        this.completeInsert(data);
    };

    completeInsert = (insert_data) => {
        let {file_data,fix_mode} = this.state;
        file_data.parent.insert_id = insert_data.insert_id;
        file_data.parent.name = insert_data.line.send_name;
        file_data.line.uid = insert_data.line.uid;
        file_data.line.mime_type = insert_data.line.mime_type;
        this.setState({inserting: true, insert_button: true });
        insert_data.send_id = file_data.dgima_id;
        insert_data.line.source = file_data.parent.source;
        // Now we put metadata to mdb on backend
        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
            console.log(":: DgimaApp - workflow respond: ",cb);
            if(cb.status === "ok") {
                // After that correct only throw fix workflow
                file_data.wfstatus.wfsend = true;
                setTimeout(() => this.setState({file_data, inserting: false, insert_button: false, send_button: false, kmedia_option: true}), 2000);
                putData(`${WFDB_BACKEND}/dgima/${file_data.dgima_id}`, file_data, (cb) => {
                    console.log(":: PUT Respond: ",cb);
                    // Here we send without creation unit
                    if(file_data.parent.source === "cassette") {
                        file_data.special = "cassette";
                        putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
                            console.log(":: Dgima - send respond: ",cb);
                            fix_mode ? this.toggleMode() : this.selectFile(file_data);
                        });
                    }
                });
                alert("Insert successful :)");
            } else {
                alert("Something goes wrong!");
                this.setState({ inserting: false, insert_button: false, send_button: false, kmedia_option: true});
            }
        });
    };

    sendFile = () => {
        let {file_data,special,fix_mode} = this.state;
        file_data.special = special;
        console.log(":: Going to send File: ", file_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
            console.log(":: Dgima - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectFile(file_data);
            if(cb.status === "ok") {
                setTimeout(() => {this.setState({ sending: false, send_button: false });}, 1000);
                if(fix_mode) this.toggleMode();
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
        fetch(`${WFDB_BACKEND}/dgima/${file_data.dgima_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
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

    toggleCensored = () => {
        const {hide_censored} = this.state;
        this.setState({hide_censored: !hide_censored});
    };

    toggleMode = () => {
        const {fix_mode} = this.state;
        this.setState({fix_mode: !fix_mode, file_data: {}, actived: null, fix_unit: null, wfunits: [], fixReq: false});
    };

    selectFixData = (i) => {
        let fix_unit = this.state.wfunits[i];
        console.log(":: Selected fix_uid option: ", fix_unit);
        this.setState({fix_unit});
    };

    setFixData = (confirmed) => {
        let {fix_unit} = this.state;
        if(confirmed) {
            // Check if unit was created by workflow send or manually
            if(fix_unit.parent.insert_id) {
                // Unit was created manually
                this.execUpdateFix();
            } else {
                // Unit was created by workflow send
                alert("Not impelemnted yet :(");
                this.setState({confirm_open: false});
            }

        } else {
            console.log("Aur you sure?");
            this.setState({confirm_open: true});
        }
    };

    execUpdateFix = () => {
        let {fix_unit,file_data} = this.state;
        this.setState({ sending: true, fix_button: true });

        // Put to dgima fix info
        file_data.line = fix_unit.line;
        file_data.line.fix_unit_uid = fix_unit.line.uid;
        file_data.line.fix_trim_id = fix_unit.dgima_id;
        file_data.parent.fix_id = fix_unit.dgima_id;
        file_data.parent.insert_id = fix_unit.parent.insert_id;

        // Get insert fix metadata
        getData(`insert/${fix_unit.parent.insert_id}`, (data) => {
            console.log(":: get fix insert metadata: ",data);
            if(!data) {
                alert("Name already exist!");
                this.setState({sending: false, fix_button: false})
                return false;
            }

            let insert_data = data;

            // Prepare meta for rename
            let newfile_name = fix_unit.file_name;
            let oldfile_name = file_data.file_name;
            let src = file_data.parent.source;
            let ext = insert_data.extension;
            let opath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}o.${ext}`;
            let ppath = `/backup/trimmed/${src}/${newfile_name}_${file_data.dgima_id}p.${ext}`;
            file_data.parent.file_name = oldfile_name;
            file_data.original.format.filename = opath;
            file_data.proxy.format.filename = ppath;
            file_data.file_name = newfile_name;


            console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
            putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
                console.log(":: Fix - rename respond: ",cb);
                if(cb.status === "ok") {

                    // Prepare meta for insert
                    insert_data.insert_type = "2";
                    insert_data.file_name = fix_unit.file_name;
                    insert_data.insert_name = `${fix_unit.file_name}.${ext}`;
                    insert_data.sha1 = file_data.original.format.sha1;
                    insert_data.line.old_sha1 = fix_unit.original.format.sha1;
                    insert_data.send_id = file_data.dgima_id;
                    insert_data.size = parseInt(file_data.original.format.size, 10);

                    putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
                        console.log(":: Insert respond: ",cb);
                        if(cb.status === "ok") {
                            // After that correct only throw fix workflow
                            fetch(`${WFDB_BACKEND}/dgima/${file_data.dgima_id}/wfstatus/wfsend?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
                            setTimeout(() => this.setState({sending: false, fix_button: false}), 2000);
                            alert("Fix successful :)");

                            if(file_data.parent.source === "cassette") {
                                file_data.special = "cassette";
                                putData(`${WFSRV_BACKEND}/workflow/send_dgima`, file_data, (cb) => {
                                    console.log(":: Dgima - send respond: ",cb);
                                    this.selectFile(file_data);
                                });
                            }
                        } else {
                            this.setState({sending: false, fix_button: false})
                            alert("Something goes wrong!");
                        }
                    });
                } else {
                    this.setState({sending: false, fix_button: false});
                    alert("Rename failed!");
                }
            });

        });
    };

    render() {
        const {actived,dgima,kmedia_option,file_data,source,renaming,rename_button,cit_open,filedata,metadata,join_files,hide_censored,fix_mode,wf_admin} = this.state;

        const send_options = [
            { key: 'buffer', text: 'Buffer', value: 'buffer' },
            { key: 'censor', text: 'Censor', value: 'censor' },
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia', disabled: kmedia_option },
            // { key: 'youtube', text: 'Youtube', value: 'youtube' },
            { key: 'metus', text: 'Metus', value: 'metus' },
            { key: 'Backup', text: 'Backup', value: 'backup' },
            { key: 'akladot', text: 'Akladot', value: 'akladot' },
        ];

        const join_data = dgima
            .filter(data => data.parent.source === "cassette" && !data.wfstatus.renamed)
            .map(data => {
            const {id, file_name} = data;
            return ({key: id, text: file_name, value: data})
        });

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon color='blue' name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let j = (<Icon color='blue' name='linkify'/>);
        let s = (<Icon color='red' name='key'/>);

        let cassette_data = this.props.dgima.map((data) => {
            const {locked,trimmed,backup,kmedia,removed,wfsend,censored,checked,joined,secured,fixed} = data.wfstatus;
            if(data.parent.source === "cassette") {
                let id = data.dgima_id;
                let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
                let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
                let hide = hide_censored && censored && !checked;
                if(hide || removed) return false;
                let rowcolor = censored && !checked;
                let active = actived === id ? 'active' : 'admin_raw';
                return (
                    <Table.Row
                        negative={rowcolor} positive={wfsend} disabled={!trimmed || locked || (censored && !checked)}
                        className={active} key={id} onClick={() => this.selectFile(data)}>
                        <Table.Cell>
                            {secured ? s : ""}
                            {censored ? c : ""}
                            {fixed ? f : ""}
                            {locked ? d : ""}
                            {joined ? j : ""}
                            {name}
                        </Table.Cell>
                        <Table.Cell>{time}</Table.Cell>
                        <Table.Cell negative={!backup}>{backup ? v : x}</Table.Cell>
                        <Table.Cell negative={!kmedia}>{kmedia ? v : x}</Table.Cell>
                        {/*<Table.Cell negative={!youtube}>{youtube ? v : x}</Table.Cell>*/}
                        {/*<Table.Cell negative={!metus}>{metus ? v : x}</Table.Cell>*/}
                    </Table.Row>
                )
            } return true
        });

        return (
            <Segment textAlign='center' color='brown' raised>
                <Label  attached='top' className="trimmed_label" color={fix_mode ? 'orange' : ''}>
                    {fix_mode ? f : ""}{file_data.file_name ? file_data.file_name : "Trimmed"}
                </Label>
                <Segment.Group horizontal>
                    <Segment textAlign='left' className='toggle'>
                        <Checkbox toggle label='Hide Censored'
                                  checked={hide_censored}
                                  onChange={this.toggleCensored}/>
                    </Segment>
                    <Segment>{this.state.fixReq ?
                        <Select comact placeholder='Options To Fix:' options={this.state.wfunits_options}
                                onChange={(e, {value}) => this.selectFixData(value)} /> : ""}
                        {this.state.fix_unit ? <Button color='orange'
                                                       loading={this.state.sending}
                                                       disabled={this.state.fix_button}
                                                       icon="configure"
                                                       onClick={() => this.setFixData(false)} /> : ""}
                        <Confirm mountNode={document.getElementById("ltr-modal-mount")}
                                 open={this.state.confirm_open}
                                 onCancel={() => this.setState({confirm_open: false})}
                                 onConfirm={() => this.setFixData(true)} /></Segment>
                    <Segment textAlign='right' className='toggle'>
                        <Checkbox toggle label='Fix Mode' disabled={!wf_admin}
                                  checked={fix_mode}
                                  onChange={this.toggleMode}/>
                    </Segment>
                </Segment.Group>
                <Message>
                    <Menu size='large' secondary >
                        <Menu.Item>

                        </Menu.Item>
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
                                         onComplete={(x) => this.checkName(x)}/>
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
                                    <InsertModal filedata={filedata} metadata={metadata} onComplete={this.onInsert} user={this.props.user} />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' icon='close' onClick={this.setRemoved} />
                            </Menu.Item>
                            <Menu.Item>

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
                <Segment attached raised textAlign='center' className='censor_content'>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header' warning>
                            <Table.HeaderCell  textAlign='center'><Icon name='file video outline' />Cassette</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BA</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KM</Table.HeaderCell>
                            {/*<Table.HeaderCell width={1}>YT</Table.HeaderCell>*/}
                            {/*<Table.HeaderCell width={1}>ME</Table.HeaderCell>*/}
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {cassette_data}
                    </Table.Body>
                </Table>
                </Segment>
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
