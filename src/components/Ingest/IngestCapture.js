import React, { Component } from 'react'
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { getData } from '../shared/tools';
import { Grid, Segment, Container, Dropdown } from 'semantic-ui-react'

class IngestCapture extends Component {

    state = {
        ingest: [],
        capture_src: "main",
        capture_file: null,
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),

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
        this.setState({capture_file: data.value});
    };

    render() {

        const options = [
            { key: 1, text: 'Main', value: 'main' },
            { key: 2, text: 'Backup', value: 'backup' },
        ];

        let ingest_data = this.state.ingest.map((data, i) => {
            let name = data.stop_name || "recording...";
            return ({ key: i, text: name, value: name })
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
            </Segment>
        );
    }
}

export default IngestCapture;