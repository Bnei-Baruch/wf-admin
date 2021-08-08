import React, {Component} from 'react'
import {getData, getUnits, insertSha, putData, WFSRV_BACKEND, insertFile} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import CIT from '../CIT/CIT';
import MDB from "../../components/MDB";

class IngestTrimmed extends Component {

    state = {
        active: null,
        disabled: true,
        cit_open: false,
        trimmed: [],
        file_data: {},
        ival: null,
        sending: false,
        renaming: false,
        tags: {},
        units: [],
        unit: null,

    };

    componentDidMount() {
        getUnits('titles.json', (tags) => {
            this.setState({tags});
        });
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let path = file_data.proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        let active = file_data.trim_id;
        const {wfsend,censored} = file_data.wfstatus;
        let disabled = wfsend || censored;
        this.setState({source, active, file_data, disabled});
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openCit = () => {
        this.setState({cit_open: true});
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {file_data} = this.state;
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let opath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.trim_id}o.mp4`;
        let ppath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.trim_id}p.mp4`;
        file_data.parent.file_name = oldfile_name;
        file_data.line = newline;
        file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;
        // Build url for preview
        let path = file_data.proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({cit_open: false, disabled: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, file_data, (cb) => {
            console.log(":: Ingest - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({file_data, source, renaming: false, disabled: file_data.wfstatus.wfsend}), 2000);
            } else {
                setTimeout(() => this.setState({renaming: false, disabled: file_data.wfstatus.wfsend}), 2000);
            }
        });
    };

    openMdb = () => {
        this.setState({mdb_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, mdb_open: false});
    };

    onMdbSelect = (data) => {
        console.log(":: Got MDB data: ", data);
        this.setState({mdb_open: false, unit: data});
    };

    sendFile = () => {
        const {file_data, unit} = this.state;
        const {file_name, wfstatus, line, parent} = file_data;


        if(unit && line.collection_type !== "DAILY_LESSON") {
            file_data.parent = {...parent,
                mdb_uid: unit.uid,
                mdb_id: unit.id,
                wf_id: unit.properties?.workflow_id,
            }
            file_data.wfstatus.translation = true;
            insertSha(`${file_data.original.format.sha1}`, (units) => {
                const file_id = units.data[0].id;
                console.log(" Got File ID: ", file_id)
                if(file_id) {
                    insertFile(file_id, unit.id)
                        .then(unit => {
                            console.log("insertFile: ", unit);
                        })
                        .catch(reason => {
                            console.error(reason.message);
                        })
                }
            });
        }

        console.log(":: Going to send File: ", file_data);
        this.setState({ sending: true, disabled: true });

        // In lesson part we expect rename status
        if(line.content_type === "LESSON_PART" && line.collection_type !== "CONGRESS" && !wfstatus.renamed) {
            alert("Lesson part must be renamed");
            this.setState({ sending: false });
            return
        }

        // Check if already got unit with same name
        getData(`trimmer/find?key=file_name&value=${file_name}`, (data) => {
            console.log(":: Unit check name: ",data);
            let chk = data.filter(b => b.file_name === file_name && b.wfstatus.wfsend);
            console.log(":: Unit filter: ",chk);
            if(chk.length > 0) {
                alert("Unit with this name already exist");
                this.setState({ sending: false });
            } else {
                console.log(":: Going to send :", file_data);
                putData(`${WFSRV_BACKEND}/workflow/send_ingest`, file_data, (cb) => {
                    console.log(":: Ingest - send respond: ",cb);
                    setTimeout(() => this.setState({ sending: false, unit: null }), 2000);
                    // While polling done it does not necessary
                    //this.selectFile(file_data);
                    if(cb.status !== "ok") {
                        alert("Something goes wrong!");
                    }
                });
            }
        });
    };

    render() {
        const {metadata, file_data, cit_open, mdb_open, unit, disabled, renaming, sending} = this.state;

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let trimmed = this.props.trimmed.map((data) => {
            const {trimmed,renamed,buffer,removed,wfsend,censored,locked,secured} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            if(removed || buffer || censored)
                return false;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    positive={wfsend} warning={!trimmed} disabled={!trimmed || locked}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>{secured ? s : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised >
                <Label  attached='top' className="trimmed_label">
                    {file_data.file_name ? file_data.file_name : "Trimmed"}
                    {unit ? " - (Trnaslation) -  " + unit.uid : null}
                </Label>
                <Message size='large'>
                <Menu size='large' secondary >
                    <Menu.Item>
                        <Modal trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                               size='tiny'
                               mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                        </Modal>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button disabled={disabled}
                                                    loading={renaming}
                                                    color='blue'
                                                    onClick={this.openCit} >Rename
                                            </Button>}
                                   onClose={this.onCancel}
                                   open={cit_open}
                                   closeIcon="close"
                                   mountNode={document.getElementById("cit-modal-mount")}>
                                <Modal.Content >
                                    <CIT metadata={file_data.line}
                                         onCancel={this.onCancel}
                                         onComplete={(x) => this.renameFile(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button color='teal' disabled={disabled} content='Translation' onClick={this.openMdb}/>}
                                   onClose={this.onCancel}
                                   open={mdb_open}
                                   size='large'
                                   closeIcon="close">
                                <Modal.Content>
                                    <MDB metadata={metadata} user={this.props.user} onCancel={this.onCancel} onComplete={(x) => this.onMdbSelect(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Button positive disabled={disabled}
                                    onClick={this.sendFile} loading={sending}>Send
                            </Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Rename</Table.HeaderCell>
                            {/*<Table.HeaderCell width={1}>BUF</Table.HeaderCell>*/}
                            <Table.HeaderCell width={1}>Send</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {trimmed}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default IngestTrimmed;
