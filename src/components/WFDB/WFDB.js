import React, { Component } from 'react';
import { API_STATE } from '../shared/tools';
import DatePicker from 'react-datepicker';
import { Tab, Segment, Input, Select, Button, Divider, Menu, Icon } from 'semantic-ui-react'
import WFDBCapture from './WFDBCapture';
import WFDBTrimmer from './WFDBTrimmer';
import WFDBCarbon from './WFDBCarbon';
import WFDBKmedia from './WFDBKmedia';
import './WFDB.css';
import moment from "moment/moment";
class WFDB extends Component {

    state = {
        date: moment().format('YYYY-MM-DD'),
        input_id: "",
        skey: "date",
        svalue: "",
        startDate: moment(),
        wf_root: false,
    };

    componentDidMount() {
        let wf_root = this.props.user.roles.filter(role => role === 'wf_root').length === 0;
        this.setState({ wf_root });
        fetch(`${API_STATE}`).then((response) => {
            return response.json().then(data => console.log(data));
        });
    };

    recoverRemoved = () => {
        let id = this.state.input_id;
        console.log(":: Censor - going rocover id: ", id);
        this.setState({ disabled: true });
        fetch(`http://wfdb.bbdomain.org:8080/trimmer/${id}/wfstatus/removed?value=false`, { method: 'POST',})
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, skey: "date"});
    };

    setStatusKey = (skey) => {
        console.log(":: Selected key options: ", skey);
        this.setState({skey});
    };

    setStatusValue = (value) => {
        console.log(":: Selected value options: ", value);
        this.setState({value});
    };

    setSearchValue = () => {
        console.log(":: Going to search: ", this.state.value);
        this.setState({svalue: this.state.value});
    };

    render() {

        const options = [
            { key: 'date', text: 'Date', value: 'date' },
            { key: 'name', text: 'Name', value: 'file_name' },
            { key: 'id', text: 'ID', value: 'id' },
            { key: 'sha', text: 'Sha1', value: 'sha1' },
        ]

        const panes = [
            { menuItem: { key: 'ingest', content: 'Ingest' },
                render: () => <Tab.Pane attached={true} ><WFDBCapture {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'trimmer', content: 'Trimmer' },
                render: () => <Tab.Pane attached={false} ><WFDBTrimmer {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'carbon', content: 'Carbon' },
                render: () => <Tab.Pane attached={false} ><WFDBCarbon {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'kmedia', content: 'Kmedia' },
                render: () => <Tab.Pane attached={false} ><WFDBKmedia {...this.state} /></Tab.Pane> },
        ];

        return (
            <Segment textAlign='center' className="wfdb_app" color='blue' raised>
                <Menu secondary>
                    <Menu.Item>
                        <Button color='red' disabled>Secure</Button>
                    </Menu.Item>
                    <Menu.Item>
                    <DatePicker
                        className="datepickercs"
                        dateFormat="YYYY-MM-DD"
                        locale='he'
                        maxDate={moment()}
                        selected={this.state.startDate}
                        onChange={this.changeDate}
                    />
                    </Menu.Item>
                    <Menu.Item>
                        <Select compact options={options} defaultValue='date'
                                onChange={(e, {value}) => this.setStatusKey(value)} />
                    </Menu.Item>
                    <Menu.Item>
                    <Input className='input_wfdb' type='text' placeholder='Search...' action
                           onChange={e => this.setStatusValue(e.target.value)}>
                        <input />
                        <Button type='submit' onClick={this.setSearchValue}>Search</Button>
                    </Input>
                    </Menu.Item>
                    <Menu.Item>
                        <Input placeholder='Put ID here...' action
                               onChange={e => this.setState({input_id: e.target.value})}><input />
                            <Button size='mini' icon='history' onClick={this.recoverRemoved} />
                        </Input>
                    </Menu.Item>
                </Menu>
                <Divider inverted />
                <Tab menu={{ pointing: true }} panes={panes} />
            </Segment>
        );
    }
}

export default WFDB;
