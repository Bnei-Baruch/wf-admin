import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getConv, putData, WFDB_STATE} from '../../shared/tools';
import { Menu, Dropdown, Button, Modal } from 'semantic-ui-react';
import CIT from '../CIT/CIT';

class IngestNames extends Component {

    state = {
        disabled: true,
        sending: false,
        lines: {},
        line: {},
        open: false,
        presets: {},
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
    };

    componentDidMount() {
        this.getLines()
    }

    getLines = () => {
        getConv(`names/lines`, (lines) => {
            console.log(":: Got Lines: ",lines);
            this.setState({lines});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true});
    };

    selectLine = (line) => {
        console.log(":: Select Line: ",line);
        this.setState({disabled: false, line});
    };

    openCit = () => {
        this.setState({open: true});
    };

    onCancel = (data) => {
        console.log(":: Cit cancel: ", data);
        this.setState({open: false});
    };

    onComplete = (newline) => {
        console.log(":: Cit callback: ", newline);
    };

    newLine = (line) => {
        console.log(":: New Line: ",line);
        //this.setState({disabled: false, lang_data: state});
    };

    removeLine = (line) => {
        console.log(":: Remove Line: ",line);
        //this.setState({disabled: false, lang_data: state});
    };

    render() {

        const {lines} = this.state;

        let lines_options = Object.keys(lines).map((id, i) => {
            let line = lines[id];
            return ({ key: id, text: line.final_name, value: line })
        });

        return (
            <Menu secondary >
                <Menu.Item>
                    <DatePicker
                        className="datepickercs"
                        dateFormat="YYYY-MM-DD"
                        locale='he'
                        maxDate={moment().add(10, "days")}
                        minDate={moment()}
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
                        options={lines_options}
                        onChange={(e,{value}) => this.selectLine(value)}
                        onClick={this.getLines}
                    >
                    </Dropdown>
                </Menu.Item>
                <Menu.Item>
                    <Modal closeOnDimmerClick={false}
                           trigger={<Button positive onClick={this.openCit}>New</Button>}
                           onClose={this.onCancel} open={this.state.open} closeIcon="close"
                           mountNode={document.getElementById("cit-modal-mount")}>
                        <Modal.Content>
                            <CIT metadata={{}}
                                 onCancel={this.onCancel}
                                 onComplete={(x) => this.onComplete(x)}/>
                        </Modal.Content>
                    </Modal>
                </Menu.Item>
                <Menu.Item>
                    <Button negative
                            disabled={this.state.disabled}
                            loading={this.state.sending}
                            onClick={this.removeLine}>Remove
                    </Button>
                </Menu.Item>
            </Menu>
        );
    }
}

export default IngestNames;