import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits} from '../../shared/tools';
import { Menu, Segment, Modal, Dropdown, Button } from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class IngestTrimmer extends Component {

    state = {
        disabled: true,
        main: [],
        backup: [],
        file_data: {},
        open: false,
        trim_src: "main",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        units: [],
    };

    getCaptured = (date) => {
        getData(`ingest/find?key=date&value=${date}`, (data) => {
            let main = data.filter(m => m.capture_src.match(/^(mltcap|maincap)$/) && m.wfstatus.capwf);
            let backup = data.filter(b => b.capture_src.match(/^(mltbackup|backupcup)$/) && b.wfstatus.capwf);
            this.setState({main, backup});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true});
    };

    setTrimSrc = (e, data) => {
        this.setState({trim_src: data.value, disabled: true});
    };

    selectFile = (e, data) => {
        let file_data = data.value;
        console.log(":: Select file: ",file_data);
        let url = 'http://wfserver.bbdomain.org';
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${url}${path}`;
        this.setState({source, file_data, disabled: false});
        getUnits(`http://app.mdb.bbdomain.org/operations/descendant_units/${sha1}`, (units) => {
            console.log(":: Ingest - got units: ", units);
            this.setState({units});
        });
    };

    sendToTrim = () => {
        this.setState({open: true});
    };

    onClose = () => {
        this.setState({open: false});
    };

    render() {

        const trim_src = this.state.trim_src;
        const trim_files = this.state[trim_src];

        const options = [
            { key: 1, text: 'Main', value: 'main' },
            { key: 2, text: 'Backup', value: 'backup' },
        ];

        let trim_data = trim_files.map((data) => {
            let name = trim_src === "trimmed" ? data.file_name : data.stop_name;
            let id = trim_src === "trimmed" ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Menu secondary >
                    <Menu.Item>
                        <Dropdown
                            compact
                            className="trim_src_dropdown"
                            selection
                            options={options}
                            defaultValue="main"
                            onChange={this.setTrimSrc}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            maxDate={moment()}
                            minDate={moment().add(-40, "days")}
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
                            options={trim_data}
                            onChange={this.selectFile}
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
                        file_data={this.state.file_data}
                        source_meta={this.state.trim_src}
                        mode="ingest"
                        closeModal={this.onClose}
                    />
                </Modal>
            </Segment>
        );
    }
}

export default IngestTrimmer;