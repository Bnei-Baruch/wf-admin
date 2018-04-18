import React, { Component } from 'react';
import { API_STATE } from '../shared/tools';
import DatePicker from 'react-datepicker';
import { Tab, Menu, Segment } from 'semantic-ui-react'
import WFDBCapture from './WFDBCapture';
import WFDBTrimmer from './WFDBTrimmer';
import WFDBCarbon from './WFDBCarbon';
import WFDBKmedia from './WFDBKmedia';
import './WFDB.css';
import moment from "moment/moment";
class WFDB extends Component {

    state = {
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        disabled: true,
    };

    componentDidMount() {
        fetch(`${API_STATE}`).then((response) => {
            return response.json().then(data => console.log(data));
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date});
    };

    render() {

        const panes = [
            { menuItem: { key: 'ingest', content: 'Ingest' },
                render: () => <Tab.Pane attached={true} ><WFDBCapture date={this.state.date} /></Tab.Pane> },
            { menuItem: { key: 'trimmer', content: 'Trimmer' },
                render: () => <Tab.Pane attached={false} ><WFDBTrimmer date={this.state.date} /></Tab.Pane> },
            { menuItem: { key: 'carbon', content: 'Carbon' },
                render: () => <Tab.Pane attached={false} ><WFDBCarbon date={this.state.date} /></Tab.Pane> },
            { menuItem: { key: 'kmedia', content: 'Kmedia' },
                render: () => <Tab.Pane attached={false} ><WFDBKmedia date={this.state.date} /></Tab.Pane> },
        ];

        return (
            <Segment textAlign='center' className="wfdb_app" color='blue' raised>
            <Menu secondary>
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
            </Menu>
                <Tab menu={{ pointing: true }} panes={panes} />
            </Segment>
        );
    }
}

export default WFDB;
