import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, putData, WFDB_BACKEND} from '../../shared/tools';
import { Menu, Dropdown, Button } from 'semantic-ui-react'

class LangRestore extends Component {

    state = {
        disabled: true,
        sending: false,
        carbon: {},
        lang_data: "",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
    };

    getCarbon = (date) => {
        getData(`convert/find?key=date&value=${date}`, (data) => {
            let json = {};
            for (let k in data) {
                let c = data[k];
                if(!c.name.match(/(mlt_)/)) continue;
                json[k] = c;
            }
            this.setState({carbon: json});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
    };

    selectLangs = (state) => {
        console.log(":: Select Langs: ",state);
        this.setState({disabled: false, lang_data: state});
    };

    restoreLangs = () => {
        const {langcheck} = this.state.lang_data;
        let id = langcheck.id;
        console.log(":: Restore Langs: ",langcheck);
        this.setState({ sending: true, disabled: true });
        putData(`${WFDB_BACKEND}/state/langcheck/${id}`, langcheck, (cb) => {
            console.log(":: LangCheck resore respond: ",cb);
            setTimeout(() => this.setState({sending: false, lang_data: ""} ), 3000);
        });
    };

    render() {

        let carbon_options = Object.keys(this.state.carbon).map((id, i) => {
            let data = this.state.carbon;
            let name = data[id].name;
            return ({ key: id, text: name, value: data[id] })
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
                        value={this.state.lang_data}
                        options={carbon_options}
                        onChange={(e,{value}) => this.selectLangs(value)}
                        onClick={() => this.getCarbon(this.state.date)}
                    >
                    </Dropdown>
                </Menu.Item>
                <Menu.Item>
                    <Button primary
                            disabled={this.state.disabled}
                            loading={this.state.sending}
                            onClick={this.restoreLangs}>Restore
                    </Button>
                </Menu.Item>
            </Menu>
        );
    }
}

export default LangRestore;