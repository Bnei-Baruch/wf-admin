import React, {Component, Fragment} from 'react'
//import moment from 'moment';
import { getConv } from '../../shared/tools';
import { Table, Segment, Label } from 'semantic-ui-react'
import '../Carbon/CarbonState.css';
import IngestNames from "./IngestNames";

class IngestPresets extends Component {

    state = {
        presets: {},
    };

    componentDidMount() {
        this.getPresets()
    }

    getPresets = () => {
        getConv(`names/presets`, (presets) => {
            console.log(":: Got Presets: ",presets);
            this.setState({presets});
        });
    };

    render() {

        const {presets} = this.state;

        let presets_data = Object.keys(presets).map((date, i) => {
            if(date !== "recent") {
                let data = presets[date];
                let ar = data.map(preset => {
                    const {id,name} = preset;
                    return (
                        <Table.Row key={id} positive>
                            <Table.Cell>{name}</Table.Cell>
                            <Table.Cell>x</Table.Cell>
                        </Table.Row>
                    )
                });
                return (
                    <Fragment>
                    <Table.Row key={i} warning>
                        <Table.Cell textAlign='center'>{date}</Table.Cell>
                        <Table.Cell>x</Table.Cell>
                    </Table.Row>
                {ar}
                    </Fragment>
                )
            }
        });

        return (

            <Segment textAlign='center' className="carbon_state" color='teal' raised>
                <Label  attached='top' className="trimmed_label" >Presets</Label>
                <IngestNames {...this.state} />
                <Table selectable compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell width={1}>R</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {presets_data}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default IngestPresets;