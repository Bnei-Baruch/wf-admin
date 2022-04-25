import React, {Component} from 'react';
import {getData, WFDB_BACKEND, MDB_UNIT_URL, getToken, WFSRV_BACKEND} from '../../shared/tools';
import {Segment,
    Icon,
    Table,
    Loader,
    Popup,
    Checkbox,
    Input,
    Button,
    Menu,
    Modal,
    Message, Dropdown
} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";

class FilesVladek extends Component {

    state = {
        files: [],
        filters: {},
        wfstatus: {},
        line: {},
        page: 0,
        source: "",
        archive: false,
        date: null,
        language: "",
    };

    componentDidMount() {
        this.getFiles();
    };

    getFiles = () => {
        getData(`dgima/find?key=file_name&value=_clip_umena-zazvonil-telefon_`, files => {
            console.log(files)
            this.setState({files})
        });
    };

    selectFile = (file_data) => {
        console.log(":: Sselected file: ", file_data);
        const {dgima_id,capture_id,file_name,stop_name,proxy,wfstatus} = file_data;
        let path = proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}` || "";
        this.setState({source, active: file_data.dgima_id, file_data});
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/trimmer/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
        this.setState({wfstatus: {...wfstatus}});
    };

    render() {
        const {files, source, page, archive, date, language} = this.state;

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let c = (<Icon color='blue' name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let l = (<Loader size='mini' active inline />);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let admin = (
            <Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} />
        );

        let root =(
            <div><Checkbox label='Wfsend' onClick={() => this.toggle("wfsend")} checked={this.state.wfstatus.wfsend} /><br />
                <Checkbox label='Kmedia' onClick={() => this.toggle("kmedia")} checked={this.state.wfstatus.kmedia} /><br />
                <Checkbox label='Checked' onClick={() => this.toggle("checked")} checked={this.state.wfstatus.checked} /><br />
                <Checkbox label='Censored' onClick={() => this.toggle("censored")} checked={this.state.wfstatus.censored} /><br />
                <Checkbox label='Trimmed' onClick={() => this.toggle("trimmed")} checked={this.state.wfstatus.trimmed} /><br />
                <Checkbox label='Metus' onClick={() => this.toggle("metus")} checked={this.state.wfstatus.metus} /><br />
                <Checkbox label='Backup' onClick={() => this.toggle("backup")} checked={this.state.wfstatus.backup} /><br />
                <Checkbox label='Buffer' onClick={() => this.toggle("buffer")} checked={this.state.wfstatus.buffer} /><br />
                <Checkbox label='Fixed' onClick={() => this.toggle("fixed")} checked={this.state.wfstatus.fixed} /><br />
                <Checkbox label='Renamed' onClick={() => this.toggle("renamed")} checked={this.state.wfstatus.renamed} /><br />
                <Checkbox label='Locked' onClick={() => this.toggle("locked")} checked={this.state.wfstatus.locked} /><br />
                <Checkbox label='Secured' onClick={() => this.toggle("secured")} checked={this.state.wfstatus.secured} /><br />
                <Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} /><br /></div>
        );

        let files_data = files.map((data) => {
            let id = data.dgima_id;
            const {aricha,backup,buffer,censored,checked,kmedia,metus,removed,renamed,wfsend,fixed,locked,secured,joined} = data.wfstatus;
            let name = data.file_name;
            let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            let href = data.line && data.line.unit_id ? `${MDB_UNIT_URL}/${data.line.unit_id}` : data.line && data.line.uid ? `${MDB_UNIT_URL}/?query=${data.line.uid}` : "";
            let link = !wfsend ? "" : (<a target="_blank" rel="noopener noreferrer" href={href}>{data.line.uid}</a>);
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!aricha} className={active} onClick={() => this.selectFile(data)}>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell>
                        {secured ? s : ""}
                        {censored ? c : ""}
                        {fixed ? f : ""}
                        {locked ? d : ""}
                        {joined ? j : ""}
                        {name}
                    </Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{removed ? v : x}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell>{fixed ? v : x}</Table.Cell>
                    <Table.Cell>{buffer ? v : x}</Table.Cell>
                    <Table.Cell>{backup ? v : x}</Table.Cell>
                    <Table.Cell>{metus ? v : x}</Table.Cell>
                    <Table.Cell>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment basic className="wfdb_app">
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Menu position='right'>
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        {/*<Menu.Item>*/}
                        {/*    <Button color='teal' icon='download' disabled={!source} href={source} download />*/}
                        {/*</Menu.Item>*/}
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={12}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RMV</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RNM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>FIX</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BUF</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BAK</Table.HeaderCell>
                            <Table.HeaderCell width={1}>MTS</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KMD</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    {/*<Table.Footer fullWidth>*/}
                    {/*    <Table.Row>*/}
                    {/*        <Table.HeaderCell colSpan='9' textAlign='center'>*/}
                    {/*            <Button.Group>*/}
                    {/*                <Button basic disabled={page === 0}*/}
                    {/*                        onClick={() => this.getFiles(page - 20)}>*/}
                    {/*                    <Icon name='left chevron' />*/}
                    {/*                </Button>*/}
                    {/*                <Button basic>{page}-{page + files.length}</Button>*/}
                    {/*                <Button basic disabled={files.length < 20}*/}
                    {/*                        onClick={() => this.getFiles(page + 20)}>*/}
                    {/*                    <Icon name='right chevron' />*/}
                    {/*                </Button>*/}
                    {/*            </Button.Group>*/}
                    {/*        </Table.HeaderCell>*/}
                    {/*    </Table.Row>*/}
                    {/*</Table.Footer>*/}
                </Table>
            </Segment>
        );
    }
}

export default FilesVladek;
