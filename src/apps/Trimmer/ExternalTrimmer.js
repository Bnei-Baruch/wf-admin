import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits, MDB_FINDSHA, newTrimMeta, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Modal, Dropdown, Button, Label} from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";
import '../WFDB/WFDB.css';

class ExternalTrimmer extends Component {

    state = {
        disabled: true,
        congress: [],
        insert: [],
        dgima: [],
        search: [],
        trimmed: [],
        cassette_id: null,
        file_data: "",
        open: false,
        dgima_src: "insert",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        trim_meta: {},
        units: [],
        label: {},
        labels: [],
        disable_ids: [],
    };

    getCaptured = (date) => {
        getData(`capture/find?key=date&value=${date.slice(0, -3)}`, (data) => {
            let insert = data.filter(b => b.capture_src.match(/^(insert)$/) && b.wfstatus.capwf && !b.wfstatus.locked);
            let congress = data.filter(b => b.capture_src.match(/^(congress)$/) && b.wfstatus.capwf && !b.wfstatus.locked);
            this.setState({congress, insert});
        });
        getData(`trimmer/find?key=date&value=${date}`, (data) => {
            let trimmed = data.filter(t => !t.wfstatus.locked);
            this.setState({trimmed});
        });
        // If we want trim from dgima trimmed
        // getData(`dgima/find?key=date&value=${date.slice(0, -3)}`, (data) => {
        //     this.setState({dgima: data});
        // });
    };

    changeDate = (data) => {
        let date = data.format(this.state.dgima_src === "search" ? 'YYYY/MM/DD' : 'YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
        if(this.state.dgima_src === "search") {
            this.getLabelsData("date", date);
        }
    };

    setTrimSrc = (dgima_src) => {
        this.setState({dgima_src, disabled: true, file_data: ""});
    };

    setSearchValue = (cassette_id) => {
        console.log(":: Selected value options: ", cassette_id);
        this.setState({cassette_id, disabled: cassette_id.length === 0});
    };

    selectFile = (file_data) => {
        console.log(":: Select file: ",file_data);
        let path = file_data.proxy ? file_data.proxy.format.filename : file_data.original.format.filename;
        let sha1 = file_data.original.format.sha1;
        let source = `${WFSRV_BACKEND}${path}`;
        let src = this.state.dgima_src === "trimmed" ? "custom" : this.state.dgima_src;
        let trim_meta = newTrimMeta(file_data, "dgima", src);
        this.setState({source, file_data, trim_meta, disabled: false});
        getUnits(`${MDB_FINDSHA}/${sha1}`, (units) => {
            if(units.total > 0) {
                console.log(":: Unit already exist: ", units);
                this.setState({units});
            } else {
                console.log(":: Did not found unit :: ");
            }
        });
    };

    sendToTrim = () => {
        let {file_data, label} = this.state;
        if(file_data.line && file_data.line.label_id) {
            // There is no translation on cassettes
            file_data.line.has_translation = false;
            // Try to take date from labels db and put as captured date
            let cassette_date = label.date.split('/').join('-');
            file_data.line.capture_date = (/\d{4}-\d{2}-\d{2}/).test(cassette_date) ? cassette_date : "1970-01-01";
        }
        this.setState({file_data, open: true});
    };

    onClose = () => {
        this.setState({open: false, disabled: true, file_data: ""});
    };

    render() {

        const {dgima_src,disabled,open,source,startDate,file_data,trim_meta} = this.state;

        const options = [
            { key: 1, text: 'Dgima', value: 'insert' },
            { key: 2, text: 'Congress', value: 'congress' },
            { key: 5, text: 'Trimmed', value: 'trimmed' },
        ];

        let trim_data = this.state[dgima_src].map((data) => {
            const {id} = data;
            let name = dgima_src !== "trimmed" ? data.stop_name : data.file_name;
            let icon = data.wfstatus.trimmed ? "cut" : "";
            // let id = dgima_src === "insert" ? data.capture_id : data.trim_id;
            return ({ key: id, text: name, value: data, icon })
        });

        return (
            <Segment textAlign='center' color='blue' raised>
                <Label  attached='top' className="trimmed_label">Captured</Label>
                <Menu secondary>
                    <Menu.Item>
                        <Dropdown
                            compact
                            className="trim_src_dropdown"
                            selection
                            options={options}
                            defaultValue="insert"
                            onChange={(e, {value}) => this.setTrimSrc(value)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat={dgima_src === "search" ? "YYYY/MM/DD" : "YYYY-MM-DD"}
                            locale='he'
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={moment()}
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
                            onBlur={() => console.log()}
                            onChange={(e, {value}) => this.selectFile(value)}
                            onClick={() => this.getCaptured(this.state.date)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button primary disabled={disabled}
                                onClick={this.sendToTrim}>
                            Open
                        </Button>
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
                        source_meta={dgima_src}
                        mode="dgima"
                        closeModal={this.onClose}
                    />
                </Modal>
            </Segment>
        );
    }
}

export default ExternalTrimmer;