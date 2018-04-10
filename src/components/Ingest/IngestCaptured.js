import React, {Component, Fragment} from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {getData, getUnits, IVAL} from '../shared/tools';
import { Menu, Grid, Segment, Modal, Dropdown, Icon, Table, Loader, Button, Header } from 'semantic-ui-react'
import MediaTrimmer from "../Trimmer/MediaTrimmer";

class IngestCaptured extends Component {

    state = {
        captured: [],
        ingest: [],
        ingest_meta: {},
        open: false,
        capture_src: "main",
        capture_file: null,
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        source: "http://10.66.1.122/backup/trimmed/2018-04-05/mlt_o_norav_2018-04-05_lesson_achana_n2_p0_t1522922675p.mp4",
        units: [],
    };

    componentDidMount() {
        getData('ingest/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
            if (JSON.stringify(this.state.captured) !== JSON.stringify(data)) {
                let ingest = data.filter(data => data.capture_src.match(/^(mltcap|main)$/));
                console.log(":: INgest: ",ingest);
                this.setState({captured: data, ingest: ingest});
            }
        });
    };

    componentWillUnmount() {
        console.log("-- Ingest unmount");
    }

    handleDateChange = (data) => {
        let date = data.format('YYYY-MM-DD');
        getData('ingest/find?key=date&value='+date, (ingest) => {
                this.setState({ingest: ingest, startDate: data, date: date});
        });
    };

    setCaptureSrc = (e, data) => {
        if(data.value === "main")
            var ingest = this.state.captured.filter(data => data.capture_src.match(/^(mltcap|main)$/));
        if(data.value === "backup")
            var ingest = this.state.captured.filter(data => data.capture_src.match(/^(mltbackup|backup)$/));
        this.setState({capture_src: data.value, ingest: ingest});
    };

    selectCaptureFile = (e, data) => {
        console.log(":: Select file: ",e ,data);
        let ingest_meta = this.state.ingest[data.value];
        let url = 'http://10.66.1.122';
        let path = ingest_meta.proxy.format.filename;
        let sha1 = ingest_meta.original.format.sha1;
        let source = `${url}${path}`;
        getUnits('http://app.mdb.bbdomain.org/operations/descendant_units/'+sha1, (units) => {
            console.log(":: Ingest - got units: ", units);
            this.setState({capture_file: data.value, source: source, ingest_meta: ingest_meta, units: units});
        });
    };

    sendToTrim = () => {
        this.setState({open: true});
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
            <Segment textAlign='left' className="ingest_segment" color='orange'>
                <Header as='h3' textAlign='left'>Captured</Header>
                <Grid >
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
                    <Grid.Column width={8}>
                        <Dropdown
                            className="ingest_files"
                            placeholder="Select File To Trim:"
                            selection
                            options={ingest_data}
                            onChange={this.selectCaptureFile}
                             >
                        </Dropdown>
                    </Grid.Column>
                    <Grid.Column width={2}>
                        <Button primary onClick={this.sendToTrim}>Trimmer</Button>
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
                    <MediaTrimmer
                        source={this.state.source}
                        ingest_meta={this.state.ingest_meta}
                        source_meta={this.state.capture_src}
                        mode="ingest"
                    />
                </Modal>
            </Segment>
        );
    }
}

export default IngestCaptured;