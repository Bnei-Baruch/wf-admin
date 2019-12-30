import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import {getData, MDB_ADMIN_URL, KMEDIA_URL, WFSRV_BACKEND} from '../../shared/tools';
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
        file_data: null,
        ival: null,
        name: "",
        source: "",
    };

    componentDidMount() {
        this.getIngestData(moment().format('YYYY-MM-DD'));
        this.getTrimmerData(moment().format('YYYY-MM-DD'));
        this.runPolling();
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    runPolling = () => {
        let ival = setInterval(() => {
            this.getIngestData(this.state.date);
            this.getTrimmerData(this.state.date);
        }, 10000 );
        this.setState({ival});
    };

    changeDate = (data) => {
        let date = data.format('YYYY-MM-DD');
        if(moment().format('YYYY-MM-DD') !== date) {
            clearInterval(this.state.ival);
            this.setState({ival: null});
        } else if(this.state.ival === null) {
            this.runPolling();
        }
        this.setState({startDate: data, date, disabled: true, file_data: ""});
        this.getIngestData(date);
        this.getTrimmerData(date);
    };

    getIngestData = (date) => {
        getData(`ingest/find?key=date&value=${date}`, (ingest) => {
            //let ingest = data.filter(m => m.capture_src.match(/^(mltcap|maincap)$/) && m.wfstatus.capwf && !m.wfstatus.locked);
            console.log(":: Ingest DB Data: ",ingest);
            this.setState({ingest})
        });
    };

    getTrimmerData = (date) => {
        getData(`trimmer/find?key=date&value=${date}`, (trimmer) => {
            console.log(":: Trimmer DB Data: ",trimmer);
            this.setState({trimmer});
        });
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        const {trim_id,capture_id,file_name,stop_name,proxy,wfstatus} = file_data;
        let id = trim_id ? trim_id : capture_id;
        let name = trim_id ? file_name : stop_name;
        if(capture_id && !proxy)
            return;
        let path = proxy.format.filename;
        let source = capture_id || trim_id && wfstatus.kmedia ? `${WFSRV_BACKEND}${path}` : "";
        this.setState({source, active: id, file_data, name});
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

        const { ingest,trimmer,source,name } = this.state;

        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let v = (<Icon name='checkmark'/>);
        let a = (<Icon name='arrow alternate circle right'/>);
        let x = (<Icon name='close'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let ingest_data = ingest.map((data) => {
            const {capwf,trimmed,locked,secured} = data.wfstatus;
            let id = data.capture_id;
            let time = data.start_name.split("_")[1];
            let name = data.stop_name || "recording...";
            let stop_name = (!capwf && name !== "recording...") ? <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{name}</div> : name;
            let capture_src = data.capture_src;
            let active = this.state.active === id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={id} positive={data.wfstatus.trimmed} warning={!data.wfstatus.capwf} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{secured ? s : ""}{locked ? d : ""}{stop_name}</Table.Cell>
                    <Table.Cell>{capture_src}</Table.Cell>
                    <Table.Cell>{trimmed ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        let trimmer_data = trimmer.map((data) => {
            let id = data.trim_id;
            const {censored,checked,kmedia,trimmed,wfsend,fixed,locked,secured} = data.wfstatus;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            let mhref = `${MDB_ADMIN_URL}/content_units/${data.line.unit_id}`;
            let mdb_link = wfsend ? (<a target="_blank" rel="noopener noreferrer" href={mhref}>{data.line.uid}</a>) : "";
            let ctype = data.line.collection_type === "DAILY_LESSON" ? "lessons" : "programs";
            let khref = `${KMEDIA_URL}/${ctype}/cu/${data.line.uid}`;
            let km_link = kmedia ? (<a target="_blank" rel="noopener noreferrer" href={khref}>Kmedia {a}</a>) : x;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={id} negative={rowcolor} positive={kmedia} warning={!trimmed} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{secured ? s : ""}{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{mdb_link}</Table.Cell>
                    <Table.Cell warning={kmedia}>{km_link}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="wfdb_app" color='blue' raised>
                <Label attached='top' className="filesapp_label">WorkFlow Files</Label>
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
                        <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                               size='tiny'
                               mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                        </Modal>
                    </Menu.Item>
                    <Menu.Item position='right'>
                        <Button color='teal' disabled={!source} >
                            <Icon name='download'/>
                            <a href={source} download={name}>{name}</a>
                        </Button>
                    </Menu.Item>
                </Menu>
                </Message>
                <Segment attached raised textAlign='center'>
                    <Label attached='top' className="files_label">Captured</Label>
                    <Table compact='very' selectable basic size='small'>
                        <Table.Header>
                            <Table.Row className='table_header'>
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
                    <Label attached='top' className="files_label">Trimmed</Label>
                    <Table selectable compact='very' basic size='small' structured>
                        <Table.Header>
                            <Table.Row className='table_header'>
                                <Table.HeaderCell width={1}>Time</Table.HeaderCell>
                                <Table.HeaderCell width={12}>File Name</Table.HeaderCell>
                                <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                                <Table.HeaderCell width={1}>Ready</Table.HeaderCell>
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