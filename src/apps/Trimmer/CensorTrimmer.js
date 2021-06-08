import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import he from 'date-fns/locale/he';

import {getData, newTrimMeta, getUnits, MDB_FINDSHA, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Modal, Dropdown, Button, Label} from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class CensorTrimmer extends Component {

    state = {
        disabled: true,
        trimmed: [],
        file_data: "",
        open: false,
        trim_src: "trimmed",
        date: new Date().toLocaleString('sv').slice(0,10),
        startDate: new Date(),
        source: "",
        trim_meta: {},
        units: [],
    };

    getCaptured = (date) => {
        getData(`trimmer/find?key=date&value=${date}`, (data) => {
            let trimmed = data.filter(t => !t.wfstatus.locked);
            this.setState({trimmed});
        });
    };

    changeDate = (data) => {
        let date = data.toLocaleString('sv').slice(0,10);
        this.setState({startDate: data, date: date, disabled: true});
    };

    selectFile = (file_data) => {
        console.log(":: Select file: ",file_data);
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${WFSRV_BACKEND}${path}`;
        let trim_meta = newTrimMeta(file_data, "censor", this.state.trim_src);
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

        const trim_src = this.state.trim_src;
        const trim_files = this.state[trim_src];

        let trim_data = trim_files.map((data) => {
            let name = trim_src === "trimmed" ? data.file_name : data.stop_name;
            let id = trim_src === "trimmed" ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Label  attached='top' className="trimmed_label">Trimmed Files</Label>
                <Menu secondary >
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="yyyy-MM-dd"
                            locale={he}
                            maxDate={new Date()}
                            minDate={new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)}
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
