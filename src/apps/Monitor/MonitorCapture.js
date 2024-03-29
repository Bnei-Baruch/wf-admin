import React, { Component } from 'react'
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class MonitorCapture extends Component {

    state = {
        ingest: [],
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);

        let capture_data = this.props.ingest.map((data) => {
            const {trimmed,capwf} = data.wfstatus;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div>{l}&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            return (
                <Table.Row key={data.capture_id} positive={trimmed} warning={!capwf} className="monitor_tr">
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

export default MonitorCapture;
