import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getConv} from '../../shared/tools';
import { Menu, Segment, Dropdown, Button, Label } from 'semantic-ui-react'

class LangCheck extends Component {

    state = {
        disabled: true,
        carbon: {},
        file_data: {},
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        units: [],
    };

    getConvState = (date) => {
        getConv(`state/carbon/${date}`, (data) => {
            if (JSON.stringify(this.state.carbon) !== JSON.stringify(data))
                this.setState({carbon: data});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true});
    };

    selectState = (state) => {
        console.log(state);
        this.props.onConvState(state);
    };

    render() {

        let carbon_option = Object.keys(this.state.carbon).map((id, i) => {
            let state = this.state.carbon[id];
            let name = state.name;
            return ({ key: id, text: name, value: state })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">Lang Check</Label>
                <Menu secondary >
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            maxDate={moment()}
                            minDate={moment().add(-10, "days")}
                            selected={this.state.startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            className="trim_files_dropdown"
                            error={this.state.disabled}
                            scrolling={false}
                            placeholder="Select File To Trim:"
                            selection
                            options={carbon_option}
                            onChange={(e,{value}) => this.selectState(value)}
                            onClick={() => this.getConvState(this.state.date)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={this.state.disabled} onClick={this.sendToTrim}>Open</Button>
                    </Menu.Item>
                </Menu>
            </Segment>
        );
    }
}

export default LangCheck;