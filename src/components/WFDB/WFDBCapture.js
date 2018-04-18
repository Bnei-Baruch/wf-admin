import React, { Component } from 'react'
import moment from 'moment';
import { getData } from '../shared/tools';
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class WFDBCapture extends Component {

    state = {
        capture: [],
    };

    componentDidMount() {
            getData('ingest/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
                if (JSON.stringify(this.state.capture) !== JSON.stringify(data))
                    this.setState({capture: data})
            });
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let capture_data = this.state.capture.map((data) => {
            const {capwf,sirtutim,trimmed} = data.wfstatus;
            let id = data.capture_id;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            return (
                <Table.Row positive={data.wfstatus.trimmed} warning={!data.wfstatus.capwf} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{stop_name}</Table.Cell>
                    <Table.Cell>{capture_src}</Table.Cell>
                    <Table.Cell>{trimmed ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <u>Capture</u>
                <Table compact='very' basic size='small'>
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
                        {capture_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default WFDBCapture;