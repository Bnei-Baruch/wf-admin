import React, {Component, Fragment} from 'react'
import {getData, getToken, postData, WFDB_BACKEND} from '../../shared/tools';
import { Icon, Table, Loader, Popup, Checkbox, Input, Button, Label } from 'semantic-ui-react'

class WFDBIngest extends Component {

    state = {
        ingest: [],
        wfstatus: {},
        line: {},
    };

    componentDidMount() {
        this.getIngestData("date", this.props.date);
    };

    getIngestData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`ingest/find?key=${skey}&value=${search}`, (ingest) => {
            console.log(":: Ingest DB Data: ",ingest);
            this.setState({ingest})
        });
    };

    searchData = (tab) => {
        const {sjson,skey,svalue} = this.props;
        console.log(tab);
        let search = skey === "date" && !svalue ? this.props.date : svalue;
        let key = skey === "file_name" ? "stop_name" : skey;
        let endpoint = sjson === "wfdb" ? "find" : sjson;
        if(!search) return;
        getData(`${tab}/${endpoint}?key=${key}&value=${search}`, (ingest) => {
            console.log(":: Ingest DB Data: ",ingest);
            this.setState({ingest});
        });
    };

    getStatus = (data) => {
        console.log(":: Got status: ",data);
        this.setState({wfstatus: {...data.wfstatus}, id: data.capture_id})
    };

    getLine = (data) => {
        console.log(":: Got status: ",data);
        this.setState({line: {...data.line}, id: data.capture_id, value: data.line.week_date})
    };

    setLine = () => {
        let {line, id, value} = this.state;
        line.week_date = value;
        console.log(":: Save Line: ",line);
        postData(`${WFDB_BACKEND}/ingest/${id}/line`, line, (cb) => {
            console.log(":: POST Line in WFDB: ",cb);
        });
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/ingest/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
        this.setState({wfstatus: {...wfstatus}});
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let root =(
            <div><Checkbox label='Capwf' onClick={() => this.toggle("capwf")} checked={this.state.wfstatus.capwf} /><br />
                <Checkbox label='Trimmed' onClick={() => this.toggle("trimmed")} checked={this.state.wfstatus.trimmed} /><br />
                <Checkbox label='Locked' onClick={() => this.toggle("locked")} checked={this.state.wfstatus.locked} /><br />
                <Checkbox label='Secured' onClick={() => this.toggle("secured")} checked={this.state.wfstatus.secured} /><br /></div>
        );

        let week_date = (
            <Input type='text' labelPosition='left' action
                   value={this.state.value} onChange={e => this.setState({value: e.target.value})}>
                <Label basic>Date:</Label><input className='input_line' />
                <Button role='button' onClick={this.setLine} disabled={!this.state.value}>Save</Button></Input>
        );

        let ingest_data = this.state.ingest.map((data) => {
            const {capwf,trimmed,locked,secured} = data.wfstatus;
            let id = data.capture_id;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            return (
                <Table.Row key={id} positive={data.wfstatus.trimmed} warning={!data.wfstatus.capwf} className="monitor_tr">
                    <Popup
                        trigger={<Table.Cell>{id}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getStatus(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? root : ""}
                    </Popup>
                    <Table.Cell>{time}</Table.Cell>
                    <Popup
                        trigger={<Table.Cell>{secured ? s : ""}{locked ? d : ""}{stop_name}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getLine(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? week_date : ""}
                    </Popup>
                    <Table.Cell>{capture_src}</Table.Cell>
                    <Table.Cell>{trimmed ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Fragment>
                <Table compact='very' selectable basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Capsrc</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Trim</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {ingest_data}
                    </Table.Body>
                </Table>
            </Fragment>
        );
    }
}

export default WFDBIngest;