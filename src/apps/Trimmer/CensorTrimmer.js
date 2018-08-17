import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, newTrimMeta, getUnits} from '../../shared/tools';
import { Menu, Segment, Modal, Dropdown, Button } from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class CensorTrimmer extends Component {

    state = {
        disabled: true,
        trimmed: [],
        file_data: "",
        open: false,
        trim_src: "trimmed",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        trim_meta: {},
        units: [],
    };

    getCaptured = (date) => {
        getData(`trimmer/find?key=date&value=${date}`, (data) => {
            this.setState({trimmed: data});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
    };

    selectFile = (file_data) => {
        console.log(":: Select file: ",file_data);
        let url = 'http://wfserver.bbdomain.org';
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${url}${path}`;
        let trim_meta = newTrimMeta(file_data, "censor", this.state.trim_src);
        this.setState({source, file_data, trim_meta, disabled: false});
        getUnits(`http://app.mdb.bbdomain.org/operations/descendant_units/${sha1}`, (units) => {
            console.log(":: Ingest - got units: ", units);
            this.setState({units});
        });
    };

    sendToTrim = () => {
        this.setState({open: true});
    };

    onClose = () => {
        this.setState({open: false, disabled: true, file_data: ""});
    };

    render() {

        const trim_src = this.state.trim_src;
        const trim_files = this.state[trim_src];

        let trim_data = trim_files.map((data) => {
            let name = trim_src === "trimmed" ? data.file_name : data.stop_name;
            let id = trim_src === "trimmed" ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Menu secondary >
                    <Menu.Item>
                        {/*<DatePicker*/}
                            {/*className="datepickercs"*/}
                            {/*dateFormat="YYYY-MM-DD"*/}
                            {/*locale='he'*/}
                            {/*maxDate={moment()}*/}
                            {/*minDate={moment().add(-40, "days")}*/}
                            {/*selected={this.state.startDate}*/}
                            {/*onChange={this.changeDate}*/}
                        {/*/>*/}
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={moment()}
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
                            value={this.state.file_data}
                            options={trim_data}
                            onChange={(e,{value}) => this.selectFile(value)}
                            onClick={() => this.getCaptured(this.state.date)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={this.state.disabled} onClick={this.sendToTrim}>Open</Button>
                    </Menu.Item>
                </Menu>
                <Modal
                    className="trimmer_modal"
                       closeOnDimmerClick={false}
                       closeIcon={true}
                       onClose={this.onClose}
                       open={this.state.open}
                       size="large"
                       mountNode={document.getElementById("ltr-modal-mount")}
                >
                    <TrimmerApp
                        source={this.state.source}
                        trim_meta={this.state.trim_meta}
                        source_meta={this.state.trim_src}
                        mode="censor"
                        closeModal={this.onClose}
                    />
                </Modal>
            </Segment>
        );
    }
}

export default CensorTrimmer;