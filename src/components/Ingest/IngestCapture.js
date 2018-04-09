import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, IVAL} from '../shared/tools';
import { Container, Grid, Segment, Modal, Dropdown, Icon, Table, Loader } from 'semantic-ui-react'
import MediaTrimmer from "../Trimmer/MediaTrimmer";

class IngestCapture extends Component {

    state = {
        active: null,
        ingest: [],
        trimmed: [],
        open: false,
        capture_src: "main",
        capture_file: null,
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "http://10.66.1.122/backup/trimmed/2018-04-05/mlt_o_norav_2018-04-05_lesson_achana_n2_p0_t1522922675p.mp4",

    };

    componentDidMount() {
        getData('ingest/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
            if (JSON.stringify(this.state.ingest) !== JSON.stringify(data))
                this.setState({ingest: data});
        });
        setInterval(() =>
            getData('trim', (data) => {
                if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                    this.setState({trimmed: data})
            }), 1000
        );
    };

    handleDateChange = (data) => {
        let date = data.format('YYYY-MM-DD');
        getData('ingest/find?key=date&value='+date, (ingest) => {
                this.setState({ingest: ingest, startDate: data, date: date});
        });
    };

    setCaptureSrc = (e, data) => {
        this.setState({capture_src: data.value});
    };

    selectCaptureFile = (e, data) => {
        console.log(":: Select file: ",e ,data);
        let url = 'http://10.66.1.122';
        let path = this.state.ingest[data.value].proxy.format.filename;
        let source = `${url}${path}`;
        this.setState({capture_file: data.value, source: source, open: true});
    };

    handleOnClose = () => {
        this.setState({open: false});
    };

    handleClick = (data) => {
        console.log(":: Selected trim: ",data);
        //this.props.onUidSelect(unit);
        this.setState({active: data.trim_id});
    };

    render() {

        const options = [
            { key: 1, text: 'Main', value: 'main' },
            { key: 2, text: 'Backup', value: 'backup' },
        ];

        let ingest_data = this.state.ingest.map((data, i) => {
            let name = data.stop_name || "recording...";
            let id = data.capture_id;
            return ({ key: id, text: name, value: i })
        });

        let trimmed = this.state.trimmed.map((data) => {
            let name = (data.wfstatus.trimmed) ? data.file_name : <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = (data.wfstatus.censored) ? <Icon name='copyright'/> : "";
            let time = moment.unix(data.trim_id.substr(1)).format("HH:mm:ss") || "";
            //let removed = data.wfstatus.removed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            if(this.props.removed && data.wfstatus.removed)
                return;
            let renamed = data.wfstatus.renamed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            //let checked = data.wfstatus.checked ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let buffer = data.wfstatus.buffer ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let wfsend = data.wfstatus.wfsend ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let rowcolor = data.wfstatus.censored && !data.wfstatus.checked;
            let active = this.state.active === data.trim_id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor}
                    positive={data.wfstatus.wfsend}
                    warning={!data.wfstatus.trimmed}
                    className={active} key={data.trim_id} onClick={() => this.handleClick(data)}
                >
                    <Table.Cell>{censor}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed}</Table.Cell>
                    <Table.Cell>{buffer}</Table.Cell>
                    <Table.Cell negative={!data.wfstatus.wfsend}>{wfsend}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Fragment>
            <Segment textAlign='left' className="ingest_segment">
                <Grid>
                    <Grid.Column width={2}>
                        <Dropdown
                            compact
                            className="large"
                            selection
                            options={options}
                            defaultValue="main"
                            onChange={this.setCaptureSrc}
                             >
                        </Dropdown>
                    </Grid.Column>
                    <Grid.Column width={3}>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={moment()}
                            //openToDate={moment(this.state.start_date)}
                            selected={this.state.startDate}
                            onChange={this.handleDateChange}
                            //excludeDates={[moment(), moment().add(1, "months")]}
                            //highlightDates={moment().add(-1, "months")}
                        />
                    </Grid.Column>
                    <Grid.Column width={7}>
                        <Dropdown
                            className="ingest_files"
                            placeholder="Select File To Trim:"
                            selection
                            options={ingest_data}
                            onChange={this.selectCaptureFile}
                             >
                        </Dropdown>
                    </Grid.Column>
                </Grid>
                <Modal
                       closeOnDimmerClick={true}
                       closeIcon={true}
                       defaultOpen={false}
                       onClose={this.handleOnClose}
                       open={this.state.open}
                       size="large"
                >
                    <MediaTrimmer source={this.state.source} />
                </Modal>
            </Segment>
                <Segment textAlign='left' className="ingest_segment">
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RNM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BUF</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {trimmed}
                    </Table.Body>
                </Table>
                </Segment>
            </Fragment>
        );
    }
}

export default IngestCapture;