import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import he from 'date-fns/locale/he';
import {getData, getUnits, MDB_FINDSHA, newTrimMeta, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Modal, Dropdown, Button, Input, Table, Label} from 'semantic-ui-react'
import TrimmerApp from "./TrimmerApp";
import '../WFDB/WFDB.css';

class DgimaTrimmer extends Component {

    state = {
        disabled: true,
        cassette: [],
        dgima: [],
        search: [],
        cassette_id: null,
        file_data: "",
        open: false,
        dgima_src: "cassette",
        date: new Date().toLocaleDateString('sv'),
        startDate: new Date(),
        source: "",
        trim_meta: {},
        units: [],
        label: {},
        labels: [],
        disable_ids: [],
    };

    getCaptured = (date) => {
        getData(`capture/find?key=date&value=${date.slice(0, -3)}`, (data) => {
            let cassette = data.filter(m => m.capture_src.match(/^(sdirec1|sdirec2)$/) && m.wfstatus.capwf && (!m.wfstatus.locked || !m.wfstatus.buffer || !m.wfstatus.removed));
            this.setState({cassette});
        });
    };

    getLabelsData = (skey, svalue) => {
        if(skey === "id") {
            getData(`label/${svalue}`, (label) => {
                console.log(" Got label: ", label);
                this.setState({label, cassette_id: svalue});
                if(this.state.dgima_src !== "search")
                    this.getLabelsData("date", label.date);
            });
        } else {
            getData(`label/find?key=${skey}&value=${svalue}`, (labels) => {
                console.log(" Labels with same date: ", labels);
                this.setState({labels});
            });
        }
    };

    changeDate = (data) => {
        //let date = data.format(this.state.dgima_src === "search" ? 'YYYY/MM/DD' : 'YYYY-MM-DD');
        let date = data.toLocaleDateString('sv')
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
        if(file_data.line && file_data.line.label_id) {
            this.getLabelsData("id", file_data.line.label_id);
        }
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

    selectLabel = (active_label) => {
        this.setState({active_label});
        if(active_label && this.state.dgima_src === "search") {
            getData(`capture/${active_label}`, (data) => {
                if(data) {
                    this.selectFile(data);
                    this.setState({cassette_id: active_label});
                } else {
                    let {disable_ids} = this.state;
                    disable_ids.push(active_label);
                    this.setState({disable_ids});
                }
            });
        }
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

        const {dgima_src,disabled,open,source,startDate,file_data,trim_meta,active_label,cassette_id,disable_ids} = this.state;
        const {comments,content_type,date,duration,language,id,lecturer,location} = this.state.label;

        const options = [
            { key: 1, text: 'Cassete', value: 'cassette' },
            { key: 4, text: 'Search', value: 'search' },
        ];

        let trim_data = this.state[dgima_src].map((data) => {
            const {id} = data;
            let name = dgima_src !== "trimmed" ? data.stop_name : data.file_name;
            let icon = data.wfstatus.trimmed ? "cut" : "";
            return ({ key: id, text: name, value: data, icon })
        });

        let capture_data = this.state.labels.map((data) => {
            const {comments,content_type,date,duration,language,id,lecturer,location} = data;
            let dd = disable_ids.filter(d => d === id).length > 0;
            return (
                <Table.Row key={id}
                           active={id === active_label}
                           disabled={dd}
                           className="monitor_tr"
                           onClick={() => this.selectLabel(id)}>
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{comments}</Table.Cell>
                    <Table.Cell>{content_type}</Table.Cell>
                    <Table.Cell>{language}</Table.Cell>
                    <Table.Cell>{lecturer}</Table.Cell>
                    <Table.Cell>{duration}</Table.Cell>
                    <Table.Cell>{location}</Table.Cell>
                </Table.Row>
            )
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
                            defaultValue="cassette"
                            onChange={(e, {value}) => this.setTrimSrc(value)}
                             >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat={dgima_src === "search" ? "yyyy/MM/dd" : "yyyy-MM-dd"}
                            locale={he}
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            selected={startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        {dgima_src === "search" ?
                            <Input type='text' placeholder='Search...' value={cassette_id}
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
                                onBlur={() => console.log()}
                                onChange={(e, {value}) => this.selectFile(value)}
                                onClick={() => this.getCaptured(this.state.date)} />
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
                <Table compact='very' selectable fixed basic size='small' className='wfdb_app'>
                    <Table.Header>
                        <Table.Row className='table_header' compact>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={6}>Comments</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Content</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Lang</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Lecturer</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Duration</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Location</Table.HeaderCell>
                        </Table.Row>
                        {dgima_src === "search" ? "" :
                        <Table.Row key={id} compact active>
                            <Table.HeaderCell>{id}</Table.HeaderCell>
                            <Table.HeaderCell>{date}</Table.HeaderCell>
                            <Table.HeaderCell>{comments}</Table.HeaderCell>
                            <Table.HeaderCell>{content_type}</Table.HeaderCell>
                            <Table.HeaderCell>{language}</Table.HeaderCell>
                            <Table.HeaderCell>{lecturer}</Table.HeaderCell>
                            <Table.HeaderCell>{duration}</Table.HeaderCell>
                            <Table.HeaderCell>{location}</Table.HeaderCell>
                        </Table.Row>}
                    </Table.Header>

                    <Table.Body>
                        {capture_data}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default DgimaTrimmer;
