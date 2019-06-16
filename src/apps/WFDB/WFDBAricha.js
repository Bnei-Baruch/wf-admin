import React, { Component } from 'react';
import moment from 'moment';
import { getData, WFDB_BACKEND} from '../../shared/tools';
import { Icon, Table, Container, Loader, Popup, Checkbox } from 'semantic-ui-react'

class WFDBAricha extends Component {

    state = {
        aricha: [],
        wfstatus: {},
    };

    componentDidMount() {
        this.getTrimmerData("date", this.props.date);
    };

    getTrimmerData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`aricha/find?key=${skey}&value=${search}`, (aricha) => {
            console.log(":: Aricha DB Data: ",aricha);
            this.setState({aricha});
        });
    };

    searchData = (tab) => {
        const {sjson,skey,svalue} = this.props;
        console.log(tab);
        let search = skey === "date" && !svalue ? this.props.date : svalue;
        let endpoint = skey === "sha1" ? "sha1" : sjson === "wfdb" ? "find" : sjson;
        if(!search) return;
        getData(`${tab}/${endpoint}?key=${skey}&value=${search}`, (aricha) => {
            console.log(":: Aricha DB Data: ",aricha);
            this.setState({aricha});
        });
    };

    getStatus = (data) => {
        console.log(":: Got status: ",data);
        this.setState({wfstatus: {...data.wfstatus}, id: data.aricha_id})
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/aricha/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',});
        this.setState({wfstatus: {...wfstatus}});
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let admin = (<Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} />);
        let root =(<div><Checkbox label='Wfsend' onClick={() => this.toggle("wfsend")} checked={this.state.wfstatus.wfsend} /><br />
            <Checkbox label='Kmedia' onClick={() => this.toggle("kmedia")} checked={this.state.wfstatus.kmedia} /><br />
            <Checkbox label='Checked' onClick={() => this.toggle("checked")} checked={this.state.wfstatus.checked} /><br />
            <Checkbox label='Censored' onClick={() => this.toggle("censored")} checked={this.state.wfstatus.censored} /><br />
            <Checkbox label='Metus' onClick={() => this.toggle("metus")} checked={this.state.wfstatus.metus} /><br />
            <Checkbox label='Backup' onClick={() => this.toggle("backup")} checked={this.state.wfstatus.backup} /><br />
            <Checkbox label='Youtube' onClick={() => this.toggle("youtube")} checked={this.state.wfstatus.youtube} /><br />
            <Checkbox label='Fixed' onClick={() => this.toggle("fixed")} checked={this.state.wfstatus.fixed} /><br />
            <Checkbox label='Renamed' onClick={() => this.toggle("renamed")} checked={this.state.wfstatus.renamed} /><br />
            <Checkbox label='Locked' onClick={() => this.toggle("locked")} checked={this.state.wfstatus.locked} /><br />
            <Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} /><br /></div>);

        let aricha_data = this.state.aricha.map((data) => {
            let id = data.aricha_id;
            const {aricha,backup,youtube,censored,checked,kmedia,metus,removed,renamed,wfsend,fixed,locked} = data.wfstatus;
            let name = aricha ? data.file_name : <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = censored ? <Icon name='copyright'/> : "";
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!aricha} className="monitor_tr">
                    <Popup
                        trigger={<Table.Cell>{id}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getStatus(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? root : admin}
                    </Popup>
                    <Table.Cell>{censor}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{removed ? v : x}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell>{fixed ? v : x}</Table.Cell>
                    <Table.Cell>{youtube ? v : x}</Table.Cell>
                    <Table.Cell>{backup ? v : x}</Table.Cell>
                    <Table.Cell>{metus ? v : x}</Table.Cell>
                    <Table.Cell>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container>
                <Table compact='very' selectable fixed basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={12}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RMV</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RNM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>FIX</Table.HeaderCell>
                            <Table.HeaderCell width={1}>YTB</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BAK</Table.HeaderCell>
                            <Table.HeaderCell width={1}>MTS</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KMD</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {aricha_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default WFDBAricha;