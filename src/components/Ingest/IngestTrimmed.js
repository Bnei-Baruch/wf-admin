import React, {Component} from 'react'
import moment from 'moment';
import {getData, getUnits, IVAL, putData} from '../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal } from 'semantic-ui-react'
import MediaPlayer from "../Media/MediaPlayer";
import CIT from '../../CIT';

class IngestTrimmed extends Component {

    state = {
        active: null,
        disabled: true,
        open: false,
        trimmed: [],
        file_data: {},
        ival: null,
        sending: false,
        tags: {},
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => getData('trim', (data) => {
                if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                    this.setState({trimmed: data})
            }), IVAL );
        this.setState({ival});
        getUnits('http://wfserver.bbdomain.org/trim/titles.json', (tags) => {
            this.setState({tags});
        });
    };

    componentWillUnmount() {
        console.log("-- Trimmed unmount");
        clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let url = 'http://wfserver.bbdomain.org';
        let path = file_data.proxy.format.filename;
        let source = `${url}${path}`;
        let active = file_data.trim_id;
        let disabled = file_data.wfstatus.wfsend;
        this.setState({source, active, file_data, disabled});
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openCit = () => {
        this.setState({open: true});
    };

    onComplete = (newline) => {
        console.log(":: Cit callback: ", newline);
        let file_data = this.state.file_data;
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let opath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.trim_id}o.mp4`;
        let ppath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.trim_id}p.mp4`;
        file_data.line = newline;
        file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({...file_data, open: false, disabled: true});
        putData(`http://wfdb.bbdomain.org:8080/trimmer/${file_data.trim_id}`, file_data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            // FIXME: When API change this must be error recovering
            fetch(`http://wfserver.bbdomain.org:8080/hooks/rename?oldname=${oldfile_name}&newname=${newfile_name}&id=${file_data.trim_id}`);
        });
    };

    onCancel = (data) => {
        console.log(":: Cit cancel: ", data);
        this.setState({open: false});
    };

    sendFile = () => {
        let file_data = this.state.file_data;
        console.log(":: Going to send File: ", file_data);
        this.setState({ sending: true, disabled: true });
        setTimeout(() => this.setState({ sending: false }), 5000);
        let cont = file_data.line.content_type;
        let colt = file_data.line.collection_type;
        let artt = file_data.line.artifact_type;
        let hag = file_data.line.holiday;
        let lect = file_data.line.lecturer;
        if (cont.match(/^(CONGRESS|VIRTUAL_LESSON)$/)) {
            file_data.line.require_test = true;
        }
        file_data.wfstatus.buffer = file_data.line.require_test;

        file_data.wfstatus.wfsend = true;
        if(cont.match(/^(LESSON_PART|FRIENDS_GATHERING)$/) && colt !== "CONGRESS" && artt !== "KITEI_MAKOR") {
            file_data.wfstatus.censored = hag;
        }
        if(cont === "MEAL" && colt !== "CONGRESS" && lect === "rav") {
            file_data.wfstatus.censored = true;
            file_data.wfstatus.buffer = false;
        }
        if(colt !== "CONGRESS" && cont === "FULL_LESSON") {
            file_data.wfstatus.backup = true;
        }
        if(colt === "CONGRESS") {
            file_data.wfstatus.buffer = true;
        }
        if(!file_data.wfstatus.censored && !file_data.wfstatus.buffer) {
            if (cont.match(/^(LESSON_PART|FRIENDS_GATHERING)$/)) {
                file_data.wfstatus.kmedia = true;
            }
        }
        putData(`http://wfdb.bbdomain.org:8080/trimmer/${file_data.trim_id}`, file_data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            // FIXME: When API change this must be error recovering
            fetch(`http://wfserver.bbdomain.org:8080/hooks/send?id=${file_data.trim_id}`);
        });
    };

    render() {

        let trimmed = this.state.trimmed.map((data) => {
            let name = (data.wfstatus.trimmed) ? data.file_name : <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = (data.wfstatus.censored) ? <Icon name='copyright'/> : "";
            let time = moment.unix(data.trim_id.substr(1)).format("HH:mm:ss") || "";
            //let removed = data.wfstatus.removed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            if(data.wfstatus.removed || data.wfstatus.buffer)
                return;
            let renamed = data.wfstatus.renamed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            //let checked = data.wfstatus.checked ? <Icon name='checkmark'/> : <Icon name='close'/>;
            //let buffer = data.wfstatus.buffer ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let wfsend = data.wfstatus.wfsend ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let rowcolor = data.wfstatus.censored && !data.wfstatus.checked;
            let active = this.state.active === data.trim_id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor}
                    positive={data.wfstatus.wfsend}
                    warning={!data.wfstatus.trimmed}
                    disabled={!data.wfstatus.trimmed}
                    className={active} key={data.trim_id} onClick={() => this.selectFile(data)}
                >
                    <Table.Cell>{censor}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed}</Table.Cell>
                    {/*<Table.Cell>{buffer}</Table.Cell>*/}
                    <Table.Cell negative={!data.wfstatus.wfsend}>{wfsend}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised >
                <Label color='grey' attached='top' size='large'> {this.state.file_data.file_name ? this.state.file_data.file_name : "Trimmed Files:"} </Label>
                <Menu size='mini' secondary >
                    <Menu.Item>
                        <Modal trigger={<Button disabled={this.state.disabled} ><Icon name='play' /></Button>} size='tiny' mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} />
                        </Modal>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false} trigger={<Button disabled={this.state.disabled} color='blue' onClick={this.openCit} >Rename</Button>}
                                   onClose={this.onCancel} open={this.state.open} closeIcon="close" mountNode={document.getElementById("cit-modal-mount")}>
                                <Modal.Content >
                                    <CIT metadata={this.state.file_data.line} onCancel={this.onCancel} onComplete={(x) => this.onComplete(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                    </Menu.Menu>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button positive disabled={this.state.disabled} onClick={this.sendFile} loading={this.state.sending}>Send</Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
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