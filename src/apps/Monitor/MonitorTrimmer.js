import React, { Component } from 'react'
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class MonitorTrimmer extends Component {

    state = {
        trimmer: [],
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon color='blue' name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);

        let trimmer_data = this.props.trimmer.map((data) => {
            const {trimmed,renamed,removed,buffer,wfsend,censored,checked,fixed} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            if(this.props.removed && removed)
                return false;
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!trimmed} disabled={removed} className="monitor_tr">
                    <Table.Cell>{censored && trimmed ? c : ""}{fixed ? f : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell>{buffer ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <u>Trimmer</u>
                <Table compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RNM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BUF</Table.HeaderCell>
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

export default MonitorTrimmer;
