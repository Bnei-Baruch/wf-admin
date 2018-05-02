import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getConv } from '../../shared/tools';
import { Icon, Button, Table, Segment, Label } from 'semantic-ui-react'
import '../Carbon/CarbonState.css';
import IngestNames from "./IngestNames";

class IngestPresets extends Component {

    state = {
        preset: {},
        presets: {},
        disabled: true,
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

    addPreset = () => {
        const {date,presets,preset} = this.state;
        if(!presets[date]) presets[date] = [];
        let new_preset = presets[date];
        new_preset.push(preset);
        console.log(":: Add preset: ",new_preset,presets);
        // TODO: Put presets to db
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date});
    };

    setLine = (preset) => {
        console.log(":: Preset Callback: ",preset);
        this.setState({preset, disabled: false});
    };

    removeDate = (date) => {
        console.log(":: Remove Date: ",date);
        //this.setState({disabled: false, lang_data: state});
    };

    removeName = (date,name,i) => {
        console.log(":: Remove Name: ",date,name,i);
        let presets = this.state.presets[date];
        presets.splice(i, 1);
        console.log(":: After Remove: ",presets);
        //this.setState({disabled: false, lang_data: state});
    };

    render() {

        const {presets} = this.state;
        let x = (<Icon color='brown' name='close' onClick={this.removeItem}/>);

        let presets_data = Object.keys(presets).map((date) => {
            if(date !== "recent") {
                let data = presets[date];
                let ar = data.map((preset,i) => {
                    const {id,name} = preset;
                    return (
                        <Table.Row key={i} positive>
                            <Table.Cell>{name}</Table.Cell>
                            <Table.Cell textAlign='right'>
                                <Icon color='brown' name='close' className='close_icon'
                                      onClick={() => this.removeName(date,name,i)} />
                            </Table.Cell>
                        </Table.Row>
                    )
                });
                return (
                    <Fragment key={date}>
                    <Table.Row key={date} warning>
                        <Table.Cell>{date}</Table.Cell>
                        <Table.Cell textAlign='right'>
                            <Icon color='brown' name='close' className='close_icon'
                                  onClick={() => this.removeDate(date)} />
                        </Table.Cell>
                    </Table.Row>
                {ar}
                    </Fragment>
                )
            }
        });

        return (

            <Segment textAlign='center' className="carbon_state" color='teal' raised>
                <Label  attached='top' className="trimmed_label" >Presets</Label>
                <IngestNames {...this.state} onLine={this.setLine}/>
                <Table selectable compact='very' basic size='small' fixed>
                    <Table.Header>
                        <Table.Row width={5}>
                            <Table.HeaderCell textAlign='center'><DatePicker
                                className="datepickercs"
                                dateFormat="YYYY-MM-DD"
                                locale='he'
                                maxDate={moment().add(10, "days")}
                                minDate={moment()}
                                selected={this.state.startDate}
                                onChange={this.changeDate}
                            /></Table.HeaderCell>
                            <Table.HeaderCell width={4}>
                                <Button primary
                                        disabled={this.state.disabled}
                                        onClick={this.addPreset}>Add
                                </Button>
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