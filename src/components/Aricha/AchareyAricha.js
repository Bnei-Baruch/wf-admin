import React, {Component} from 'react'
import moment from 'moment';
import {getData, getUnits, IVAL, putData} from '../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Input, Select, Message } from 'semantic-ui-react'
import MediaPlayer from "../Media/MediaPlayer";
import InsertApp from "../Insert/InsertApp"
import CIT from '../../CIT';

class AchareyAricha extends Component {

    state = {
        active: null,
        disabled: true,
        cit_open: false,
        insert_open: false,
        aricha: [],
        file_data: {},
        filedata: {},
        metadata: {},
        input_id: "",
        ival: null,
        renaming: false,
        sending: false,
        special: "backup",
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => getData('bdika', (data) => {
                if (JSON.stringify(this.state.aricha) !== JSON.stringify(data))
                    this.setState({aricha: data})
            }), IVAL );
        this.setState({ival});
    };

    componentWillUnmount() {
        console.log("-- Trimmed unmount");
        clearInterval(this.state.ival);
    };

    selectFile = (data) => {
        console.log(":: Trimmed - selected file: ",data);
        // Build url for preview
        let url = 'http://wfserver.bbdomain.org';
        let path = data.proxy.format.filename;
        let source = `${url}${path}`;
        // Take sha for mdb fetch
        let sha1 = data.original.format.sha1;
        // Build data for insert app
        let filename = data.file_name;
        let content_type = "CLIP";
        let start_date = data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];
        let upload_type = "aricha";
        let language = data.line.language;
        this.setState({source, active: data.aricha_id, file_data: data, disabled: !data.wfstatus.aricha, filedata: {filename,content_type,start_date,upload_type,language }});
        getUnits('http://app.mdb.bbdomain.org/operations/descendant_units/'+sha1, (units) => {
            console.log(":: Trimmer - got units: ", units);
            if(units.total > 0)
                console.log("The file already got unit!");
            this.setState({ units});
        });
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
        data.send_id ? this.setMeta(data) : this.newMeta(data);
    };

    setMeta = (data) => {
        getData(`trimmer/${data.send_id}`, (trimmeta) => {
            console.log(":: Got trim meta: ", trimmeta);
        });
    };

    newMeta = (data) => {
        console.log(":: Going to set new meta: ", data);
    };

    onComplete = (newline) => {
        console.log(":: Cit callback: ", newline);
        let file_data = this.state.file_data;
        let newfile_name = newline.final_name;
        let oldfile_name = file_data.file_name;
        let opath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.aricha_id}o.mp4`;
        let ppath = `/backup/trimmed/${file_data.date}/${newfile_name}_${file_data.aricha_id}p.mp4`;
        file_data.line = newline;
        file_data.line.title = this.state.tags[newline.pattern] || "";
        file_data.original.format.filename = opath;
        file_data.proxy.format.filename = ppath;
        file_data.file_name = newfile_name;
        file_data.wfstatus.renamed = true;
        console.log(":: Old Meta: ", this.state.file_data+" :: New Meta: ",file_data);
        this.setState({...file_data, open: false, disabled: true, renaming: true});
        setTimeout(() => this.setState({ renaming: false, disabled: file_data.wfstatus.wfsend}), 2000);
        putData(`http://wfdb.bbdomain.org:8080/aricha/${file_data.aricha_id}`, file_data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            // FIXME: When API change this must be error recovering
            fetch(`http://wfserver.bbdomain.org:8080/hooks/rename?oldname=${oldfile_name}&newname=${newfile_name}&id=${file_data.aricha_id}`);
        });
    };

    openCit = () => {
        this.setState({cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    setSpecial = (e, data) => {
        console.log(":: Selected send options: ", data.value);
        let special = data.value;
        this.setState({special});
    };

    sendFile = () => {
        let file_data = this.state.file_data;
        let special = this.state.special;
        console.log(":: Going to send File: ", file_data + " : to: ", special);
        fetch(`http://wfdb.bbdomain.org:8080/aricha/${file_data.aricha_id}/wfstatus/${special}?value=true`, { method: 'POST',})
        this.setState({ sending: true, disabled: true });
        setTimeout(() => {
            //fetch(`http://wfdb.bbdomain.org:8080/hooks/send?id=${file_data.aricha_id}&special=${special}`);
            this.setState({ sending: false });
        }, 1000);
    };

    setRemoved = () => {
        let file_data = this.state.file_data;
        console.log(":: Censor - set removed: ", file_data);
        this.setState({ disabled: true });
        fetch(`http://wfdb.bbdomain.org:8080/aricha/${file_data.aricha_id}/wfstatus/removed?value=true`, { method: 'POST',})
    };

    recoverRemoved = () => {
        let id = this.state.input_id;
        console.log(":: Censor - going rocover id: ", id);
        this.setState({ disabled: true });
        fetch(`http://wfdb.bbdomain.org:8080/aricha/${id}/wfstatus/removed?value=false`, { method: 'POST',})
    };

    render() {

        const send_options = [
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia' },
            { key: 'youtube', text: 'Youtube', value: 'youtube' },
            { key: 'metus', text: 'Metus', value: 'metus' },
            { key: 'Backup', text: 'Backup', value: 'backup' },
        ];

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);

        let aricha = this.state.aricha.map((data) => {
            const {backup,kmedia,metus,youtube,removed,wfsend,censored,checked} = data.wfstatus;
            let id = data.aricha_id;
            let ready = data.proxy;
            let name = ready ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>{censored ? c : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell negative={!backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell negative={!kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!youtube}>{youtube ? v : x}</Table.Cell>
                    <Table.Cell negative={!metus}>{metus ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised>
                <Label color='grey' attached='top' size='large'>
                    {this.state.file_data.file_name ? this.state.file_data.file_name : "Acharey Aricha Files:"}
                </Label>
                <Message>
                    <Menu size='mini' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button disabled={this.state.disabled} color='brown'><Icon name='play' /></Button>}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={this.state.source} />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button color='blue'
                                                    disabled={this.state.disabled}
                                                    loading={this.state.renaming}
                                                    onClick={this.openCit} >Rename
                                            </Button>}
                                   onClose={this.onCancel}
                                   open={this.state.cit_open}
                                   closeIcon="close"
                                   mountNode={document.getElementById("cit-modal-mount")}>
                                <Modal.Content>
                                    <CIT metadata={this.state.file_data.line}
                                         onCancel={this.onCancel}
                                         onComplete={(x) => this.onComplete(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                                <Modal { ...this.props }
                                       trigger={<Button color='teal'
                                                        disabled={this.state.disabled}
                                                        onClick={this.openInsert} >Insert
                                                </Button>}
                                       closeOnDimmerClick={true}
                                       closeIcon={true}
                                       onClose={this.onCancel}
                                       open={this.state.insert_open}
                                       size="large"
                                       mountNode={document.getElementById("ltr-modal-mount")}
                                >
                                    <InsertApp filedata={this.state.filedata} onInsert={this.onInsert} />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' onClick={this.setRemoved} >Remove</Button>
                            </Menu.Item>
                            <Menu.Item>
                                {/*<Input className='input_idrecover' placeholder='Put ID here...'*/}
                                       {/*onChange={e => this.setState({input_id: e.target.value})} />*/}
                                {/*<Button icon size='mini' onClick={this.recoverRemoved} ><Icon name='history' /></Button>*/}
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Select options={send_options} defaultValue='backup'
                                        onChange={(e,data) => this.setSpecial(e,data)} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button positive disabled={this.state.disabled}
                                        onClick={this.sendFile} loading={this.state.sending}>Send</Button>
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
                        {aricha}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default AchareyAricha;