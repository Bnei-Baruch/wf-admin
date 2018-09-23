import React, { Component } from 'react'
import { getData } from '../../shared/tools';
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class WFDBIngest extends Component {

    state = {
        ingest: [],
    };

    componentDidMount() {
        this.getIngestData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getIngestData(this.props.skey, this.props.svalue);
    };

    getIngestData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`ingest/find?key=${skey}&value=${search}`, (ingest) => {
            console.log(":: Ingest DB Data: ",ingest);
            this.setState({ingest})
        });
    };

    render() {
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);
        let ingest_data = this.state.ingest.map((data) => {
            const {capwf,trimmed,locked,secured} = data.wfstatus;
            let id = data.capture_id;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            return (
                <Table.Row key={id} positive={data.wfstatus.trimmed} warning={!data.wfstatus.capwf} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{secured ? s : ""}{locked ? d : ""}{stop_name}</Table.Cell>
                    <Table.Cell>{capture_src}</Table.Cell>
                    <Table.Cell>{trimmed ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <Table compact='very' selectable fixed basic size='small'>
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
            </Container>
        );
    }
}

export default WFDBIngest;