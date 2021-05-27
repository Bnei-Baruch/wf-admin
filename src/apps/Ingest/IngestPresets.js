import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import he from 'date-fns/locale/he';

import {getData, putData, WFDB_BACKEND} from '../../shared/tools';
import { Icon, Button, Table, Segment, Label } from 'semantic-ui-react'
import IngestNames from "./IngestNames";

class IngestPresets extends Component {

    state = {
        preset: {id:"",name:""},
        presets: {},
        disabled: true,
        date: new Date().toISOString().slice(0,10),
        startDate: new Date(),
    };

    componentDidMount() {
        this.getPresets();
    };

    getPresets = () => {
        getData(`names/presets`, (presets) => {
            console.log(":: Got Presets: ",presets);
            this.setState({presets});
        });
    };

    addPreset = () => {
        const {date,presets,preset} = this.state;
        if(!presets[date]) presets[date] = [];
        presets[date].push(preset);
        console.log(":: Add preset: ",presets);
        putData(`${WFDB_BACKEND}/names/presets`, presets, (cb) => {
            console.log(":: Add preset: ",cb);
            this.setState({presets});
        });
    };

    changeDate = (data) => {
        let date = data.toISOString().slice(0,10);
        this.setState({startDate: data, date});
    };

    setLine = (preset) => {
        console.log(":: Preset Callback: ",preset);
        this.setState({preset, disabled: false});
    };

    removeDate = (date) => {
        let {presets} = this.state;
        delete presets[date];
        console.log(":: Remove Date: ",date);
        putData(`${WFDB_BACKEND}/names/presets`, presets, (cb) => {
            console.log(":: Add preset: ",cb);
            this.setState({presets});
        });
    };

    removeName = (date,name,i) => {
        let {presets} = this.state;
        console.log(":: Remove Name: ",date,name,i);
        let preset = presets[date];
        preset.splice(i, 1);
        presets[date] = preset;
        console.log(":: After Remove: ",presets);
        putData(`${WFDB_BACKEND}/names/presets`, presets, (cb) => {
            console.log(":: Names remove preset: ",cb);
            this.setState({preset: {id:"", name:""}, presets});
        });
    };

    render() {

        const {presets} = this.state;

        let presets_data = Object.keys(presets).map((date) => {
            if(date !== "recent") {
                let data = presets[date];
                let ar = data.map((preset,i) => {
                    const {name} = preset;
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
                );
            } return true;
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
                                dateFormat="yyyy-MM-dd"
                                locale={he}
                                maxDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)}
                                minDate={new Date()}
                                selected={this.state.startDate}
                                onChange={this.changeDate}
                            /></Table.HeaderCell>
                            <Table.HeaderCell width={4}>
                                <Button primary
                                        disabled={this.state.preset.name === ""}
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
