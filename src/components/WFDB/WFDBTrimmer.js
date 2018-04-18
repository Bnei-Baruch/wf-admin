import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getData } from '../shared/tools';
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class Trimmer extends Component {

    state = {
        startDate: moment(),
        trimmer: [],
    };

    componentDidMount() {
        this.getTrimmerData(moment().format('YYYY-MM-DD'));
    };

    getTrimmerData = (date) => {
        getData(`trimmer/find?key=date&value=${date}`, (trimmer) => {
            console.log(trimmer);
            this.setState({trimmer});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.getTrimmerData(date);
        this.setState({startDate: data});
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let trimmer_data = this.state.trimmer.map((data) => {
            let id = data.trim_id;
            const {aricha,backup,buffer,censored,checked,kmedia,metus,removed,renamed,trimmed,wfsend,fixed} = data.wfstatus;
            let name = trimmed ? data.file_name : <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = censored ? <Icon name='copyright'/> : "";
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let rowcolor = censored && !checked;
            return (
                <Table.Row negative={rowcolor} positive={wfsend} warning={!trimmed} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{censor}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{removed ? v : x}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell>{fixed ? v : x}</Table.Cell>
                    <Table.Cell>{buffer ? v : x}</Table.Cell>
                    <Table.Cell>{backup ? v : x}</Table.Cell>
                    <Table.Cell>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container>
                <DatePicker
                    className="datepickercs"
                    dateFormat="YYYY-MM-DD"
                    locale='he'
                    maxDate={moment()}
                    selected={this.state.startDate}
                    onChange={this.changeDate}
                />
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