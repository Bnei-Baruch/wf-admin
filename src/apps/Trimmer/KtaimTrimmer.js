import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, newTrimMeta, getUnits, WFSRV_BACKEND, MDB_FINDSHA} from '../../shared/tools';
import { Menu, Segment, Modal, Dropdown, Button, Label } from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class KtaimTrimmer extends Component {

    state = {
        disabled: true,
        mode: "ktaim",
        main: [],
        backup: [],
        file_data: "",
        open: false,
        trim_src: "backup",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        trim_meta: {},
        units: [],
    };

    getCaptured = (date) => {
        getData(`ingest/find?key=date&value=${date}`, (data) => {
            let backup = data.filter(b => b.capture_src.match(/^(mltbackup)$/) && b.wfstatus.capwf && !b.wfstatus.locked && b.line.content_type === "FULL_LESSON");
            this.setState({backup});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true, file_data: ""});
    };

    selectFile = (file_data) => {
        console.log(":: Select file: ",file_data);
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${WFSRV_BACKEND}${path}`;
        let trim_meta = newTrimMeta(file_data, "ktaim", this.state.trim_src);
        this.setState({source, file_data, trim_meta, disabled: false});
        getUnits(`${MDB_FINDSHA}/${sha1}`, (units) => {
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
        const {mode,trim_src,trim_meta,startDate,disabled,file_data,date,open,source} = this.state;
        const trim_files = this.state[trim_src];

        let trim_data = trim_files.map((data) => {
            let name = trim_src === "trimmed" ? data.file_name : data.stop_name;
            let id = trim_src === "trimmed" ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">Captured</Label>
                <Menu secondary >
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            maxDate={moment()}
                            minDate={moment().add(-40, "days")}
                            selected={startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            className="trim_files_dropdown"
                            error={disabled}
                            scrolling={false}
                            placeholder="Select File To Trim:"
                            selection
                            value={file_data}
                            options={trim_data}
                            onChange={(e,{value}) => this.selectFile(value)}
                            onClick={() => this.getCaptured(date)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={disabled} onClick={this.sendToTrim}>Open</Button>
                    </Menu.Item>
                </Menu>
                <Modal
                    className="trimmer_modal"
                       closeOnDimmerClick={false}
                       closeIcon={true}
                       onClose={this.onClose}
                       open={open}
                       size="large"
                       mountNode={document.getElementById("ltr-modal-mount")}
                >
                    <TrimmerApp
                        source={source}
                        trim_meta={trim_meta}
                        source_meta={trim_src}
                        mode={mode}
                        closeModal={this.onClose}
                    />
                </Modal>
            </Segment>
        );
    }
}

export default KtaimTrimmer;