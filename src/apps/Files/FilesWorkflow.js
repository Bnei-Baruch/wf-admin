import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import {getData, MDB_UNIT_URL, toHms, WFSRV_BACKEND} from '../../shared/tools';
import {Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import moment from "moment";

class FilesWorkflow extends Component {

    state = {
        active: null,
        activeIndex: 0,
        disabled: true,
        date: moment().format('YYYY-MM-DD'),
        startDate: moment(),
        ingest: [],
        trimmer: [],
        file_data: {},
        ival: null,
        source: "",
    };

    componentDidMount() {
        this.getIngestData();
        this.getTrimmerData();
        let ival = setInterval(() => {
            this.getIngestData();
            this.getTrimmerData();
        }, 10000 );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        this.setState({startDate: data, date, disabled: true, file_data: ""});
    };

    getIngestData = () => {
        getData(`ingest/find?key=date&value=${this.state.date}`, (ingest) => {
            //let ingest = data.filter(m => m.capture_src.match(/^(mltcap|maincap)$/) && m.wfstatus.capwf && !m.wfstatus.locked);
            console.log(":: Ingest DB Data: ",ingest);
            this.setState({ingest})
        });
    };

    getTrimmerData = () => {
        getData(`trimmer/find?key=date&value=${this.state.date}`, (trimmer) => {
            console.log(":: Trimmer DB Data: ",trimmer);
            this.setState({trimmer});
        });
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let id = file_data.trim_id;
        let path = file_data.proxy.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: id, file_data});
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
        //this.setState({player: player});
    };

    handleClick = (e, titleProps) => {
        const { index } = titleProps;
        const { activeIndex } = this.state;
        const newIndex = activeIndex === index ? -1 : index;

        this.setState({ activeIndex: newIndex });
    };

    render() {

        const { activeIndex } = this.state;

        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let ingest_data = this.state.ingest.map((data) => {
            const {capwf,trimmed,locked,secured} = data.wfstatus;
            let id = data.capture_id;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            return (
                <Table.Row key={id} positive={data.wfstatus.trimmed} warning={!data.wfstatus.capwf} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{secured ? s : ""}{locked ? d : ""}{stop_name}</Table.Cell>
                    <Table.Cell>{capture_src}</Table.Cell>
                    <Table.Cell>{trimmed ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        let trimmer_data = this.state.trimmer.map((data) => {
            let id = data.trim_id;
            const {backup,buffer,censored,checked,kmedia,metus,removed,renamed,trimmed,wfsend,fixed,locked,secured} = data.wfstatus;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let href = `${MDB_UNIT_URL}/${data.line.unit_id}`;
            let link = wfsend ? (<a target="_blank" rel="noopener noreferrer" href={href}>{data.line.uid}</a>) : "";
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!trimmed} className="monitor_tr">
                    <Table.Cell>{id}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell>{secured ? s : ""}{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell warning={removed}>{removed ? v : x}</Table.Cell>
                    <Table.Cell warning={renamed}>{renamed ? v : x}</Table.Cell>
                    <Table.Cell warning={fixed}>{fixed ? v : x}</Table.Cell>
                    <Table.Cell warning={buffer}>{buffer ? v : x}</Table.Cell>
                    <Table.Cell warning={backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell warning={metus}>{metus ? v : x}</Table.Cell>
                    <Table.Cell warning={kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="wfdb_app" color='blue' raised>
                <Label attached='top' className="trimmed_label">
                    {this.state.file_data.file_name ? this.state.file_data.file_name : "WorkFlow Files"}
                </Label>
                <Message size='large'>
                <Menu size='large' secondary >
                    <Menu.Item>
                        <DatePicker
                            className="datepickercs"
                            dateFormat="YYYY-MM-DD"
                            locale='he'
                            maxDate={moment()}
                            minDate={moment().add(-40, "days")}
                            selected={this.state.startDate}
                            onChange={this.changeDate}
                        />
                    </Menu.Item>
                    <Menu.Item>
                        <Modal trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                               size='tiny'
                               mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                        </Modal>
                    </Menu.Item>
                </Menu>
                </Message>
                <Segment attached raised textAlign='center'>
                    <Table compact='very' selectable basic size='small'>
                        <Table.Header>
                            <Table.Row className='table_header'>
                                <Table.HeaderCell width={2}>ID</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                                <Table.HeaderCell>File Name</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Capsrc</Table.HeaderCell>
                                <Table.HeaderCell width={1}>Trim</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {ingest_data}
                        </Table.Body>
                    </Table>
                </Segment>
                <Segment attached raised textAlign='center'>
                    <Table selectable compact='very' basic size='small' structured>
                        <Table.Header>
                            <Table.Row className='table_header'>
                                <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                                <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                                <Table.HeaderCell width={12}>File Name</Table.HeaderCell>
                                <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                                <Table.HeaderCell width={1}>RMV</Table.HeaderCell>
                                <Table.HeaderCell width={1}>RNM</Table.HeaderCell>
                                <Table.HeaderCell width={1}>FIX</Table.HeaderCell>
                                <Table.HeaderCell width={1}>BUF</Table.HeaderCell>
                                <Table.HeaderCell width={1}>BAK</Table.HeaderCell>
                                <Table.HeaderCell width={1}>MTS</Table.HeaderCell>
                                <Table.HeaderCell width={1}>KMD</Table.HeaderCell>
                                <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {trimmer_data}
                        </Table.Body>
                    </Table>
                </Segment>
            </Segment>
        );
    }
}

export default FilesWorkflow;