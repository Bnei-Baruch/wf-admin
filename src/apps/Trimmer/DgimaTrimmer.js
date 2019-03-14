import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits, MDB_FINDSHA, newTrimMeta, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Modal, Dropdown, Button, Input} from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";

class DgimaTrimmer extends Component {

    state = {
        disabled: true,
        cassette: [],
        congress: [],
        insert: [],
        dgima: [],
        search: [],
        trimmed: [],
        cassette_id: null,
        file_data: "",
        open: false,
        dgima_src: "cassette",
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "",
        trim_meta: {},
        units: [],
    };

    getCaptured = (date) => {
        getData(`capture/find?key=date&value=${date.slice(0, -3)}`, (data) => {
            let cassette = data.filter(m => m.capture_src.match(/^(sdirec1|sdirec2)$/) && m.wfstatus.capwf && !m.wfstatus.locked);
            let congress = data.filter(b => b.capture_src.match(/^(congress)$/) && b.wfstatus.capwf && !b.wfstatus.locked);
            let insert = data.filter(b => b.capture_src.match(/^(insert)$/) && b.wfstatus.capwf && !b.wfstatus.locked);
            this.setState({cassette, congress, insert});
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
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date: date, disabled: true});
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
            console.log(":: Ingest - got units: ", units);
            this.setState({units});
        });
    };

    sendToTrim = () => {
        let {cassette_id} = this.state;
        if(cassette_id) {
            getData(`capture/find?key=stop_name&value=${cassette_id}`, (data) => {
                if(data.length > 0) {
                    this.changeDate(moment(data[0].date ,'YYYY-MM-DD'));
                    this.selectFile(data[0]);
                    this.setState({open: true});
                }
            });
        } else {
            this.setState({open: true});
        }
    };

    onClose = () => {
        this.setState({open: false, disabled: true, file_data: ""});
    };

    render() {

        const {dgima_src,date,disabled,open,source,startDate,file_data,trim_meta} = this.state;

        const options = [
            { key: 1, text: 'Cassete', value: 'cassette' },
            { key: 2, text: 'Congress', value: 'congress' },
            { key: 3, text: 'Dgima', value: 'insert' },
            { key: 4, text: 'Search', value: 'search' },
            { key: 5, text: 'Trimmed', value: 'trimmed' },
        ];

        let trim_data = this.state[dgima_src].map((data) => {
            const {id} = data;
            let name = dgima_src !== "trimmed" ? data.stop_name : data.file_name;
            // let id = dgima_src === "insert" ? data.capture_id : data.trim_id;
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
                            onChange={(e, {value}) => this.setTrimSrc(value)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            maxDate={moment()}
                            selected={startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        {dgima_src === "search" ?
                            <Input type='text' placeholder='Search...'
                                   onChange={e => this.setSearchValue(e.target.value)} />
                            :
                            <Dropdown
                                className="trim_files_dropdown"
                                error={disabled}
                                scrolling={false}
                                placeholder="Select File To Trim:"
                                selection
                                value={file_data}
                                options={trim_data}
                                onChange={(e, {value}) => this.selectFile(value)}
                                onClick={() => this.getCaptured(date)} />
                        }
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

export default DgimaTrimmer;