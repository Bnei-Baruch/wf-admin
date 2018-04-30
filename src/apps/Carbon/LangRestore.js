import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getConv} from '../../shared/tools';
import { Menu, Dropdown, Button } from 'semantic-ui-react'

class LangRestore extends Component {

    state = {
        disabled: true,
        carbon: {},
        langs: {},
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
    };

    getCarbon = (date) => {
        getConv(`state/carbon/${date}`, (data) => {
            this.setState({trimmed: data});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
    };

    selectLangs = (e, data) => {
        console.log(":: Select Langs: ",data);
    };

    restoreLangs = (data) => {
        console.log(":: Restore Langs: ",data);
    };

    render() {

        let carbon_options = Object.keys(this.state.carbon).map((id, i) => {
            let data = this.state.carbon;
            let name = data[id].name;
            return ({ key: id, text: name, value: data })
        });

        return (

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
                            scrolling={false}
                            placeholder="Select Langs to restore:"
                            selection
                            options={carbon_options}
                            onChange={this.selectLangs}
                            onClick={() => this.getCarbon(this.state.date)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={this.state.disabled} onClick={this.restoreLangs}>Restore</Button>
                    </Menu.Item>
                </Menu>
        );
    }
}

export default LangRestore;