import React, { Component } from 'react';
import {API_STATE, putData} from '../shared/tools';
import DatePicker from 'react-datepicker';
import { Tab, Segment, Input, Select, Button, Divider, Menu } from 'semantic-ui-react'
import WFDBIngest from './WFDBIngest';
import WFDBTrimmer from './WFDBTrimmer';
import WFDBCarbon from './WFDBCarbon';
import WFDBKmedia from './WFDBKmedia';
import WFDBArchive from './WFDBArchive';
import WFDBAricha from './WFDBAricha';
import WFDBCapture from './WFDBCapture';
import WFDBDgima from './WFDBDgima';
import WFDBLabels from './WFDBLabels';
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
        lock: false,
    };

    componentDidMount() {
        let wf_root = this.props.user.roles.filter(role => role === 'wf_root').length > 0;
        this.setState({ wf_root });
        fetch(`${API_STATE}`).then((response) => {
            return response.json().then(data => console.log(data));
        });
        putData(`http://wfserver.bbdomain.org:8010/workflow/lock`, {req: "get"}, (cb) => {
            console.log(":: WFDB - workflow lock respond: ",cb);
            this.setState({ lock: cb.jsonst.val });
        });
    };

    setLock = () => {
        putData(`http://wfserver.bbdomain.org:8010/workflow/lock`, {req: "set",val: !this.state.lock}, (cb) => {
            console.log(":: WFDB - workflow set lock: ",cb);
            this.setState({ lock: cb.jsonst.val });
        });
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
        ];

        const panes = [
            { menuItem: { key: 'ingest', content: 'Ingest' },
                render: () => <Tab.Pane attached={true} ><WFDBIngest {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'trimmer', content: 'Trimmer' },
                render: () => <Tab.Pane attached={false} ><WFDBTrimmer {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'carbon', content: 'Carbon' },
                render: () => <Tab.Pane attached={false} ><WFDBCarbon {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'kmedia', content: 'Kmedia' },
                render: () => <Tab.Pane attached={false} ><WFDBKmedia {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'archive', content: 'Archive' },
                render: () => <Tab.Pane attached={false} ><WFDBArchive {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'aricha', content: 'Aricha' },
                render: () => <Tab.Pane attached={false} ><WFDBAricha {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'capture', content: 'Capture' },
                render: () => <Tab.Pane attached={true} ><WFDBCapture {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'dgima', content: 'Dgima' },
                render: () => <Tab.Pane attached={true} ><WFDBDgima {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'labels', content: 'Lables' },
                render: () => <Tab.Pane attached={true} ><WFDBLabels {...this.state} /></Tab.Pane> },

        ];

        let on = (<Button negative onClick={this.setLock}>Lock is ON</Button>);
        let off = (<Button positive onClick={this.setLock}>Lock is OFF</Button>);

        return (
            <Segment textAlign='center' className="wfdb_app" color='blue' raised>
                <Menu secondary>
                    <Menu.Item>
                        {this.state.wf_root && this.state.lock ? on : ""}
                        {this.state.wf_root && !this.state.lock ? off : ""}
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
                </Menu>
                <Divider inverted />
                <Tab menu={{ pointing: true }} panes={panes} />
            </Segment>
        );
    }
}

export default WFDB;
