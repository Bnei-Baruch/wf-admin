import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getConv } from '../../shared/tools';
import { Button, Table, Segment, Label } from 'semantic-ui-react'
import '../Carbon/CarbonState.css';
import IngestNames from "./IngestNames";

class IngestPresets extends Component {

    state = {
        presets: {},
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
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

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true});
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
                    <Fragment key={i}>
                    <Table.Row key={i} warning>
                        <Table.Cell>{date}</Table.Cell>
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
                            <Table.HeaderCell textAlign='center'><DatePicker
                                className="datepickercs"
                                dateFormat="YYYY-MM-DD"
                                locale='he'
                                maxDate={moment().add(10, "days")}
                                minDate={moment()}
                                selected={this.state.startDate}
                                onChange={this.changeDate}
                            /></Table.HeaderCell>
                            <Table.HeaderCell width={1}>
                                <Button primary disabled={this.state.disabled} >Add</Button>
                            </Table.HeaderCell>
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