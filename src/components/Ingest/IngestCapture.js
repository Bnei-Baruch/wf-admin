import React, { Component } from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getData } from '../shared/tools';
import { Grid, Segment, Modal, Dropdown } from 'semantic-ui-react'
import MediaTrimmer from "../Trimmer/MediaTrimmer";

class IngestCapture extends Component {

    state = {
        ingest: [],
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

        return (
            <Segment textAlign='left'>
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
        );
    }
}

export default IngestCapture;