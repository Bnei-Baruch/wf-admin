import React, { Component } from 'react';
import moment from 'moment';
import { getData } from '../shared/tools';
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class Trimmer extends Component {

    state = {
        trimmer: [],
    };

    componentDidMount() {
        this.getTrimmerData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getTrimmerData(this.props.skey, this.props.svalue);
    };

    getTrimmerData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`trimmer/find?key=${skey}&value=${search}`, (trimmer) => {
            console.log(trimmer);
            this.setState({trimmer});
        });
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let trimmer_data = this.state.trimmer.map((data) => {
            let id = data.trim_id;
            const {backup,buffer,censored,checked,kmedia,metus,removed,renamed,trimmed,wfsend,fixed} = data.wfstatus;
            let name = trimmed ? data.file_name : <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = censored ? <Icon name='copyright'/> : "";
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!trimmed} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{censor}{name}</Table.Cell>
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

            <Container>
                <Table selectable compact='very' basic size='small' structured>
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