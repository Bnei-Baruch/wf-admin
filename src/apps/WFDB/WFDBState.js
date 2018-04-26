import React, { Component } from 'react'
import { getConv } from '../../shared/tools';
import { Table, Container, Loader } from 'semantic-ui-react'

class WFDBState extends Component {

    state = {
        carbon: {},
    };

    componentDidMount() {
        this.getCarbonData(this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date];
        let next = [this.props.date];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getCarbonData(this.props.date);
    };

    getCarbonData = (date) => {
        getConv(`state/carbon/${date}`, (data) => {
            if (JSON.stringify(this.state.carbon) !== JSON.stringify(data))
                this.setState({carbon: data})
        });
    };

    render() {
        let carbon_data = Object.keys(this.state.carbon).map((id, i) => {
            let data = this.state.carbon;
            let time = data[id].timestamp;
            let progress = data[id].progress;
            let name = (data[id].progress !== "done") ? <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data[id].name}</div> : data[id].name;
            let ncolor = data[id].progress !== "done";
            let pcolor = data[id].progress === "done";
            return (
                <Table.Row key={id} warning={ncolor} positive={pcolor} className="monitor_tr">
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{progress}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Progress</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {carbon_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default WFDBState;