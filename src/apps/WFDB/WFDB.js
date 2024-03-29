import React, { Component } from 'react';
import {putData, WFSRV_BACKEND, getData} from '../../shared/tools';
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
import he from 'date-fns/locale/he';
import WFDBInsert from "./WFDBInsert";
import WFDBConvert from "./WFDBConvert";
import WFDBSources from "./WFDBSources";
import WFDBProducts from "./WFDBProducts";
import WFDBFiles from "./WFDBFiles";
class WFDB extends Component {

    state = {
        date: new Date().toLocaleDateString('sv'),
        input_id: "",
        sjson: "wfdb",
        skey: "date",
        svalue: "",
        value: "",
        startDate: new Date(),
        wf_root: false,
        lock: false,
        tab: "ingest",
    };

    componentDidMount() {
        let wf_root = this.props.user.roles.filter(role => role === 'wf_root').length > 0;
        this.setState({ wf_root });
        getData(`states`, (states) => {
            console.log("State data: ", states);
        });
        putData(`${WFSRV_BACKEND}/workflow/lock`, {req: "get"}, (cb) => {
            console.log(":: WFDB - workflow lock respond: ",cb);
            this.setState({ lock: cb.jsonst.val });
        });
    };

    setLock = () => {
        putData(`${WFSRV_BACKEND}/workflow/lock`, {req: "set",val: !this.state.lock}, (cb) => {
            console.log(":: WFDB - workflow set lock: ",cb);
            this.setState({ lock: cb.jsonst.val });
        });
    };

    changeDate = (data) => {
        let date = this.state.tab === "labels" ? data.toLocaleDateString('sv').split('-').join('/') : data.toLocaleDateString('sv');
        this.setState({startDate: data, date, skey: "date", value: "", svalue: ""},() => {
            this.tab.searchData(this.state.tab);
        });
    };

    setJsonKey = (sjson) => {
        console.log(":: Selected json options: ", sjson);
        this.setState({sjson});
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
        this.setState({svalue: this.state.value},() => {
            this.tab.searchData(this.state.tab);
        });
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    render() {

        const wfdb_options = [
            { key: 'date', text: 'Date', value: 'date' },
            { key: 'name', text: 'Name', value: 'file_name' },
            { key: 'uid', text: 'UID', value: 'uid' },
            { key: 'sha', text: 'Sha1', value: 'sha1' },
        ];

        const labels_options = [
            { key: 'date', text: 'Date', value: 'date' },
            { key: 'id', text: 'ID', value: 'id' },
            { key: 'archive_place', text: 'AP', value: 'archive_place' },
            { key: 'comments', text: 'Name', value: 'comments' },
            { key: 'content_type', text: 'Type', value: 'content_type' },
            { key: 'subject', text: 'No', value: 'subject' },
            { key: 'language', text: 'Lang', value: 'language' },
            { key: 'lecturer', text: 'Lect', value: 'lecturer' },
            { key: 'location', text: 'Place', value: 'location' },
        ];

        const panes = [
            { menuItem: { key: 'ingest', content: 'Ingest' },
                render: () => <Tab.Pane attached={true} ><WFDBIngest {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'trimmer', content: 'Trimmer' },
                render: () => <Tab.Pane attached={false} ><WFDBTrimmer {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'source', content: 'Sources' },
                render: () => <Tab.Pane attached={false} ><WFDBSources {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'carbon', content: 'Carbon' },
                render: () => <Tab.Pane attached={false} ><WFDBCarbon {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'convert', content: 'Convert' },
                render: () => <Tab.Pane attached={false} ><WFDBConvert {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'kmedia', content: 'Kmedia' },
                render: () => <Tab.Pane attached={false} ><WFDBKmedia {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'archive', content: 'Archive' },
                render: () => <Tab.Pane attached={false} ><WFDBArchive {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'products', content: 'Products' },
                render: () => <Tab.Pane attached={false} ><WFDBProducts {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files' },
                render: () => <Tab.Pane attached={false} ><WFDBFiles {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'aricha', content: 'Aricha' },
                render: () => <Tab.Pane attached={false} ><WFDBAricha {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'capture', content: 'Capture' },
                render: () => <Tab.Pane attached={true} ><WFDBCapture {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'dgima', content: 'Dgima' },
                render: () => <Tab.Pane attached={true} ><WFDBDgima {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'insert', content: 'Insert' },
                render: () => <Tab.Pane attached={false} ><WFDBInsert {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },
            { menuItem: { key: 'labels', content: 'Lables' },
                render: () => <Tab.Pane attached={true} ><WFDBLabels {...this.state} ref={tab => {this.tab = tab;}} /></Tab.Pane> },

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
                        dateFormat={this.state.tab === "labels" ? "yyyy/MM/dd" : "yyyy-MM-dd"}
                        locale={he}
                        showYearDropdown
                        showMonthDropdown
                        scrollableYearDropdown
                        maxDate={new Date()}
                        selected={this.state.startDate}
                        onChange={this.changeDate}
                    />
                    </Menu.Item>
                    {/*<Menu.Item>*/}
                    {/*    <Select compact defaultValue='wfdb'*/}
                    {/*            options={this.state.tab === "labels" ? "" : json_options}*/}
                    {/*            onChange={(e, {value}) => this.setJsonKey(value)} />*/}
                    {/*</Menu.Item>*/}
                    <Menu.Item>
                        <Select compact value={this.state.skey}
                                options={this.state.tab === "labels" ? labels_options : wfdb_options}
                                onChange={(e, {value}) => this.setStatusKey(value)} />
                    </Menu.Item>
                    <Menu.Item>
                    <Input className='input_wfdb' type='text' placeholder='Search...' action
                           value={this.state.value} onChange={e => this.setStatusValue(e.target.value)}>
                        <input />
                        <Button type='submit' onClick={this.setSearchValue}>Search</Button>
                    </Input>
                    </Menu.Item>
                </Menu>
                <Divider inverted />
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Segment>
        );
    }
}

export default WFDB;
