import React, {Component} from 'react'
import DatePicker from 'react-datepicker';
import {getData, toHms, WFSRV_BACKEND} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message } from 'semantic-ui-react'
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
        getData(`ingest/find?key=date&value=${this.state.date}`, (data) => {
            let ingest = data.filter(m => m.capture_src.match(/^(mltcap|maincap)$/) && m.wfstatus.capwf && !m.wfstatus.locked);
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
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let trimmed = this.state.trimmer.map((data) => {
            const {trimmed,buffer,censored,checked,fixed,locked,secured,wfsend} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = data.proxy ? toHms(data.proxy.format.duration).split('.')[0] : "";
            if(!censored || buffer)
                 return false;
            let rowcolor = secured && !checked;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor} positive={checked} warning={!wfsend} disabled={!trimmed || locked}
                    className={active} key={id} onClick={() => this.selectFile(data)}>
                    <Table.Cell>
                        {secured ? s : ""}
                        {censored && trimmed ? c : ""}
                        {fixed ? f : ""}
                        {locked ? d : ""}
                        {name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label">
                    {this.state.file_data.file_name ? this.state.file_data.file_name : "Files To Check"}
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
                    {/*<Menu.Item>*/}
                    {/*    <Button color='red' icon='close' disabled={this.state.disabled} onClick={this.setRemoved} />*/}
                    {/*</Menu.Item>*/}
                    {/*<Menu.Menu position='right'>*/}
                    {/*    <Menu.Item>*/}
                    {/*        <Button positive disabled={this.state.disabled}*/}
                    {/*                onClick={this.sendFile}*/}
                    {/*                loading={this.state.sending}>Send*/}
                    {/*        </Button>*/}
                    {/*    </Menu.Item>*/}
                    {/*</Menu.Menu>*/}
                </Menu>
                </Message>
                <Segment attached raised textAlign='center' className='censor_content'>


                </Segment>
            </Segment>
        );
    }
}

export default FilesWorkflow;