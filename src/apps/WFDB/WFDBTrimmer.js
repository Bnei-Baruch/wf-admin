import React, { Component } from 'react';
import moment from 'moment';
import {getData, postData, WFDB_BACKEND} from '../../shared/tools';
import { Icon, Table, Container, Loader, Popup, Checkbox, Input, Button, Label } from 'semantic-ui-react'

class Trimmer extends Component {

    state = {
        trimmer: [],
        wfstatus: {},
        line: {},
    };

    componentDidMount() {
        this.getTrimmerData("wfdb", "date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getTrimmerData(this.props.sjson, this.props.skey, this.props.svalue);
    };

    getTrimmerData = (sjson, skey, svalue) => {
        let search = this.props.skey === "date" && !svalue ? this.props.date : svalue;
        let endpoint = sjson === "wfdb" ? "find" : sjson;
        if(!search) return;
        getData(`trimmer/${endpoint}?key=${skey}&value=${search}`, (trimmer) => {
            console.log(":: Trimmer DB Data: ",trimmer);
            this.setState({trimmer});
        });
    };

    getStatus = (data) => {
        console.log(":: Got status: ",data);
        this.setState({wfstatus: {...data.wfstatus}, id: data.trim_id})
    };

    getLine = (data) => {
        console.log(":: Got status: ",data);
        this.setState({line: {...data.line}, id: data.trim_id, value: data.line.week_date})
    };

    setLine = () => {
        let {line, id, value} = this.state;
        line.week_date = value;
        console.log(":: Save Line: ",line);
        postData(`${WFDB_BACKEND}/trimmer/${id}/line`, line, (cb) => {
            console.log(":: POST Line in WFDB: ",cb);
        });
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/trimmer/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',});
        this.setState({wfstatus: {...wfstatus}});
    };

    render() {
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

        let trimmer_data = this.state.trimmer.map((data) => {
            let id = data.trim_id;
            const {backup,buffer,censored,checked,kmedia,metus,removed,renamed,trimmed,wfsend,fixed,locked,secured} = data.wfstatus;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!trimmed} className="monitor_tr">
                    <Popup
                        trigger={<Table.Cell>{id}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getStatus(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? root : admin}
                    </Popup>
                    <Popup
                        trigger={<Table.Cell>{secured ? s : ""}{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getLine(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? week_date : ""}
                    </Popup>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell warning={removed}>{removed ? v : x}</Table.Cell>
                    <Table.Cell warning={renamed}>{renamed ? v : x}</Table.Cell>
                    <Table.Cell warning={fixed}>{fixed ? v : x}</Table.Cell>
                    <Table.Cell warning={buffer}>{buffer ? v : x}</Table.Cell>
                    <Table.Cell warning={backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell warning={metus}>{metus ? v : x}</Table.Cell>
                    <Table.Cell warning={kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container>
                <Table selectable compact='very' fixed basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>ID</Table.HeaderCell>
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
                        {trimmer_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default Trimmer;