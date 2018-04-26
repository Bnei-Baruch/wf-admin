import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits} from '../../shared/tools';
import { Menu, Segment, Modal, Dropdown, Button } from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class DgimaTrimmer extends Component {

    state = {
        disabled: true,
        cassette: [],
        congress: [],
        dgima: [],
        file_data: {},
        open: false,
        trim_src: "cassette",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        units: [],
    };

    getCaptured = (date) => {
        getData(`capture/find?key=date&value=${date}`, (data) => {
            let cassette = data.filter(m => m.capture_src.match(/^(sdirec1|sdirec2)$/) && m.wfstatus.capwf);
            let congress = data.filter(b => b.capture_src.match(/^(congress)$/) && b.wfstatus.capwf);
            this.setState({cassette, congress});
        });
        getData(`dgima/find?key=date&value=${date}`, (data) => {
            this.setState({dgima: data});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
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
            { key: 1, text: 'Cassete', value: 'cassette' },
            { key: 2, text: 'Congress', value: 'congress' },
            { key: 3, text: 'Dgima', value: 'dgima' },
        ];

        let trim_data = trim_files.map((data) => {
            let name = trim_src === "dgima" ? data.file_name : data.stop_name;
            let id = trim_src === "dgima" ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue' raised>
                <Menu secondary>
                    <Menu.Item>
                        <Dropdown
                            compact
                            className="trim_src_dropdown"
                            selection
                            options={options}
                            defaultValue="cassette"
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
                            selected={this.state.startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            className="trim_files_dropdown"
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
                        mode="wfadmin"
                        closeModal={this.onClose}
                    />
                </Modal>
            </Segment>
        );
    }
}

export default DgimaTrimmer;