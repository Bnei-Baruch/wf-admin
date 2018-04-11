import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits, IVAL} from '../shared/tools';
import { Menu, Grid, Segment, Modal, Dropdown, Icon, Table, Loader, Button, Header } from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class AdminTrimmer extends Component {

    state = {
        disabled: true,
        main: [],
        backup: [],
        trimmed: [],
        file_data: {},
        open: false,
        trim_src: "main",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        units: [],
    };

    componentDidMount() {
        this.getCaptured(moment().format('YYYY-MM-DD'));
    };

    componentWillUnmount() {
        console.log("-- Ingest unmount");
    }

    getCaptured = (date) => {
        getData('ingest/find?key=date&value='+date, (data) => {
            let main = data.filter(m => m.capture_src.match(/^(mltcap|maincap)$/));
            let backup = data.filter(b => b.capture_src.match(/^(mltbackup|backupcup)$/));
            this.setState({main, backup});
        });
        getData('trimmer/find?key=date&value='+date, (data) => {
            this.setState({trimmed: data});
        });
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.getCaptured(date);
        this.setState({startDate: data, date: date, disabled: true});
    };

    setTrimSrc = (e, data) => {
        this.setState({trim_src: data.value, disabled: true});
    };

    selectFile = (e, data) => {
        let file_data = data.value;
        console.log(":: Select file: ",file_data);
        let url = 'http://10.66.1.122';
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${url}${path}`;
        this.setState({source, file_data, disabled: false});
        getUnits('http://app.mdb.bbdomain.org/operations/descendant_units/'+sha1, (units) => {
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

        const options = [
            { key: 1, text: 'Main', value: 'main' },
            { key: 2, text: 'Backup', value: 'backup' },
            { key: 3, text: 'Trimmed', value: 'trimmed' },
        ];

        let trim_data = this.state[this.state.trim_src].map((data, i) => {
            let name = (this.state.trim_src === "trimmed") ? data.file_name : data.stop_name;
            let id = (this.state.trim_src === "trimmed") ? data.trim_id : data.capture_id;
            return ({ key: id, text: name, value: data })
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='blue'>
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
                            //showYearDropdown
                            //showMonthDropdown
                            //scrollableYearDropdown
                            maxDate={moment()}
                            minDate={moment().add(-40, "days")}
                            //openToDate={moment(this.state.start_date)}
                            selected={this.state.startDate}
                            onChange={this.changeDate}
                            //excludeDates={[moment(), moment().add(40, "days")]}
                            //highlightDates={moment().add(-1, "months")}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            className="trim_files_dropdown"
                            placeholder="Select File To Trim:"
                            selection
                            options={trim_data}
                            onChange={this.selectFile}
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
                    />
                </Modal>
            </Segment>
        );
    }
}

export default AdminTrimmer;