import React, {Component} from 'react';
import {getData, WFDB_BACKEND, MDB_UNIT_URL, getToken, WFSRV_BACKEND} from '../../shared/tools';
import {
    Segment,
    Icon,
    Table,
    Loader,
    Popup,
    Checkbox,
    Input,
    Button,
    Label,
    Menu,
    Modal,
    Message
} from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import MediaPlayer from "../../components/Media/MediaPlayer";

class FilesProducts extends Component {

    state = {
        date: new Date().toLocaleDateString('sv'),
        startDate: new Date(),
        files: [],
        filters: {},
        wfstatus: {},
        line: {},
        page: 0,
        source: "",
    };

    componentDidMount() {
        this.getFiles();
    };

    getFiles = (offset) => {
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `files/find?limit=20&offset=${offset}` : `files/find?limit=20&offset=${offset}&` + query.join('&');

        if(filters.pattern) {
            let id = filters.pattern;
            if(id.match(/^([a-zA-Z0-9]{8})$/)) {
                path = `files/find?pattern=${id}`
            } else {
                path = `files/find?product_id=${id}`
            }
        }

        getData(path, files => {
            console.log(files)
            this.setState({page: offset, files})
        });
    };

    selectFile = (file_data) => {
        console.log(":: Sselected file: ",file_data);
        let path = file_data.properties.url;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: file_data.file_id, file_data});
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
    };

    changeDate = (data) => {
        let date = data.toLocaleDateString('sv');
        this.setState({startDate: data, date, disabled: true, file_data: ""});
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/trimmer/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
        this.setState({wfstatus: {...wfstatus}});
    };

    render() {
        const {files, source, page} = this.state;

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

        let week_date = (
            <Input type='text' labelPosition='left' action
                   value={this.state.value} onChange={e => this.setState({value: e.target.value})}>
                <Label basic>Date:</Label><input className='input_line' />
                <Button role='button' onClick={this.setLine} disabled={!this.state.value}>Save</Button></Input>
        );

        let files_data = files.map((data) => {
            const {file_id, file_name, file_type, date, language, extension, properties, uid} = data;
            const {removed, archive, sync} = properties;
            let name = sync ? <div>{l}&nbsp;&nbsp;&nbsp;{file_name}</div> : file_name;
            let time = new Date(file_id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            let href = `${MDB_UNIT_URL}/${uid}`;
            let link = archive ? (<a target="_blank" rel="noopener noreferrer" href={href}>{uid}</a>) : "";
            let rowcolor = false;
            let active = this.state.active === file_id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={file_id} negative={rowcolor} positive={archive} warning={!sync} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Popup
                        trigger={<Table.Cell>{file_id}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getStatus(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? root : admin}
                    </Popup>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{file_type}</Table.Cell>
                    <Table.Cell>{language}</Table.Cell>
                    <Table.Cell>{extension}</Table.Cell>
                    <Table.Cell warning={removed}>{removed ? v : x}</Table.Cell>
                    <Table.Cell negative={!archive}>{archive ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment basic className="wfdb_app">
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <DatePicker
                                className="datepickercs"
                                dateFormat="yyyy-MM-dd"
                                selected={this.state.startDate}
                                onChange={this.changeDate}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item position='right'>
                            <Button color='teal' icon='download' disabled={!source} href={source} download />
                        </Menu.Item>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={4}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Type</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Language</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Extension</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RMV</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='9' textAlign='center'>
                                <Button.Group>
                                    <Button basic disabled={page === 0}
                                            onClick={() => this.getFiles(page - 20)}>
                                        <Icon name='left chevron' />
                                    </Button>
                                    <Button basic>{page}-{page + files.length}</Button>
                                    <Button basic disabled={files.length < 20}
                                            onClick={() => this.getFiles(page + 20)}>
                                        <Icon name='right chevron' />
                                    </Button>
                                </Button.Group>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }
}

export default FilesProducts;
