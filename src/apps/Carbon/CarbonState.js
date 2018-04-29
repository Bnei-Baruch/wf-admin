import React, { Component } from 'react'
import moment from 'moment';
import { getConv, IVAL } from '../../shared/tools';
import { Table, Loader, Segment, Label } from 'semantic-ui-react'
import './CarbonState.css';

class CarbonState extends Component {

    state = {
        carbon: {},
        ival: null,
    };

    componentDidMount() {
        let ival = setInterval(() =>
            getConv('state/carbon/'+moment().format('YYYY-MM-DD'), (data) => {
                if (JSON.stringify(this.state.carbon) !== JSON.stringify(data))
                    this.setState({carbon: data})
            }), IVAL
        );
        this.setState({ival: ival});
    };


    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    render() {
        let l = (<Loader size='mini' active inline />);

        let carbon_data = Object.keys(this.state.carbon).map((id, i) => {
            let data = this.state.carbon;
            let time = data[id].timestamp;
            let progress = data[id].progress;
            let name = (data[id].progress !== "done") ? <div>{l}&nbsp;&nbsp;&nbsp;{data[id].name}</div> : data[id].name;
            let ncolor = data[id].progress !== "done";
            let pcolor = data[id].progress === "done";
            return (
                <Table.Row key={i} warning={ncolor} positive={pcolor}>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{progress}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Segment textAlign='center' className="carbon_state" color='brown' raised>
                <Label  attached='top' className="trimmed_label">Carbon</Label>
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
            </Segment>
        );
    }
}

export default CarbonState;