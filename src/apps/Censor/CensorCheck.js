import React, {Component} from 'react'
import {
    getData,
    getUnits,
    getEndpoint,
    IVAL,
    MDB_FINDSHA,
    putData,
    toHms,
    WFDB_BACKEND,
    WFSRV_BACKEND, newTrimMeta, getToken
} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message, Accordion } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import TrimmerApp from "../Trimmer/TrimmerApp";

class CensorCheck extends Component {

    state = {
        active: null,
        activeIndex: 0,
        disabled: true,
        open: false,
        cassette: [],
        trimmed: [],
        dgima: [],
        file_data: {},
        fixReq: false,
        ival: null,
        sending: false,
        source: "",
        trim_src: "trimmed",
        trim_meta: {},
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => {
            getData('trim', (data) => {
                if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                    this.setState({trimmed: data})
            });
            getData('drim', (data) => {
                if (JSON.stringify(this.state.dgima) !== JSON.stringify(data))
                    this.setState({dgima: data})
            });
            // getData('cassette', (data) => {
            //     if (JSON.stringify(this.state.cassette) !== JSON.stringify(data))
            //         this.setState({cassette: data})
            // });
        }, 1000 );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let id = file_data.trim_id || file_data.dgima_id;
        const {wfsend,fixed,kmedia} = file_data.wfstatus;
        let path = file_data.proxy.format.format_name === "mp3" ? file_data.original.format.filename : file_data.proxy.format.filename;
        let sha1 = file_data.parent.original_sha1;
        let parent_src = file_data.parent.source;
        let source = `${WFSRV_BACKEND}${path}`;
        let trim_src = parent_src.match(/^(main|backup|trimmed)$/) ? "trimmed" : parent_src;
        let trim_meta = newTrimMeta(file_data, "censor", trim_src);
        this.setState({source, active: id, file_data, trim_src, trim_meta, disabled: true});
        getUnits(`${MDB_FINDSHA}/${sha1}`, (units) => {
            if(!wfsend && !fixed && units.total === 1) {
                console.log(":: Fix needed - unit: ", units);
                file_data.line.fix_unit_uid = units.data[0].uid;
                this.setState({ ...file_data, units: units, fixReq: true });
                this.selectFixUID(units.data[0].uid);
            } else if(!wfsend && !fixed && units.total > 1) {
                console.log(":: Fix needed - user must choose from units: ", units);
                let units_options = units.data.map((unit) => {
                    return ({ key: unit.uid, text: unit.i18n.he.name, value: unit.uid })
                });
                this.setState({units: units, fixReq: true, disabled: kmedia, units_options });
            } else if(wfsend && fixed) {
                // Maybe we need indicate somehow about fixed unit
                console.log(":: Fix already done - ", units);
                this.setState({units: units, fixReq: false, disabled: kmedia });
            } else if(wfsend && !fixed) {
                console.log(":: File was normally sent - ", units);
                this.setState({ units: units, fixReq: false, disabled: !wfsend});
            } else {
                console.log(":: What just happend? - ", units);
            }
        });
    };

    selectFixUID = (fix_uid) => {
        console.log(":: Selected fix_uid option: ", fix_uid);
        let {file_data} = this.state;
        let id = file_data.trim_id || file_data.dgima_id;
        let ep = getEndpoint(id);
        file_data.line.fix_unit_uid = fix_uid;
        this.setState({file_data, fix_uid, disabled: false});
        putData(`${WFDB_BACKEND}/${ep}/${id}`, file_data, (cb) => {
            console.log(":: PUT Fix UID in WFDB: ",cb);
        });
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
        //this.setState({player: player});
    };

    sendFile = () => {
        let {file_data} = this.state;
        file_data.special = this.state.fixReq ? "fix" : "kmedia";
        this.setState({ sending: true, disabled: true });
        putData(`${WFSRV_BACKEND}/workflow/send_censor`, file_data, (cb) => {
            console.log(":: Censor - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectFile(file_data);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({sending: false, disabled: false, fixReq: false}), 2000);
            } else {
                setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
                alert("Something goes wrong!");
            }
        });

    };

    setRemoved = () => {
        let {file_data,active} = this.state;
        let ep = getEndpoint(active);
        console.log(":: Censor - set removed: ", file_data);
        this.setState({ disabled: true });
        fetch(`${WFDB_BACKEND}/${ep}/${active}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    setSecured = () => {
        let {file_data,active} = this.state;
        let status = !file_data.wfstatus.secured || false;
        let ep = getEndpoint(active);
        console.log(":: Censor - set secured: ", file_data);
        this.setState({ disabled: true });
        fetch(`${WFDB_BACKEND}/${ep}/${active}/wfstatus/secured?value=${status}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    sendToTrim = () => {
        this.setState({open: true});
    };

    onClose = () => {
        let {active} = this.state;
        let ep = getEndpoint(active);
        fetch(`${WFDB_BACKEND}/${ep}/${active}/wfstatus/secured?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        this.setState({open: false, disabled: true, file_data: ""});
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

        let trimmed = this.state.trimmed.map((data) => {
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

        let dgima_data = this.state.dgima.map((data) => {
            const {trimmed,buffer,censored,checked,fixed,locked,secured,wfsend} = data.wfstatus;
            let id = data.dgima_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = data.proxy ? toHms(data.proxy.format.duration).split('.')[0] : "";
            if (!censored || buffer)
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

        let cassette_data = this.state.cassette.map((data) => {
            const {trimmed,buffer,censored,checked,fixed,locked,secured,wfsend} = data.wfstatus;
            let id = data.dgima_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = data.proxy ? toHms(data.proxy.format.duration).split('.')[0] : "";
            if (!censored || buffer)
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

        const lt = trimmed.filter(n => n).length;
        const lc = cassette_data.filter(n => n).length;
        const ld = dgima_data.filter(n => n).length;

        let ct = (<Label key='Carbon' circular size='mini' color='red'>{lt}</Label>);
        let cc = (<Label key='Carbon' circular size='mini' color='red'>{lc}</Label>);
        let cd = (<Label key='Carbon' circular size='mini' color='red'>{ld}</Label>);

        return (
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label">
                    {this.state.file_data.file_name ? this.state.file_data.file_name : "Files To Check"}
                </Label>
                <Message size='large'>
                    <Modal
                        className="trimmer_modal"
                        closeOnDimmerClick={false}
                        closeIcon={true}
                        onClose={this.onClose}
                        open={this.state.open}
                        size="large"
                        mountNode={document.getElementById("ltr-modal-mount")}
                    >
                        <TrimmerApp
                            source={this.state.source}
                            trim_meta={this.state.trim_meta}
                            source_meta={this.state.trim_src}
                            mode="censor"
                            closeModal={this.onClose}
                        />
                    </Modal>
                <Menu size='large' secondary >
                    <Menu.Item>
                        <Modal trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                               size='tiny'
                               mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                        </Modal>
                    </Menu.Item>
                    <Menu.Item>
                        <Button color='blue' icon='cut' disabled={this.state.disabled} onClick={this.sendToTrim} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button color='orange' icon='key' disabled={this.state.disabled} onClick={this.setSecured} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button color='teal' icon='download' disabled={this.state.disabled} href={this.state.source} download />
                    </Menu.Item>
                    {/*<Menu.Item>*/}
                    {/*    <Button color='red' icon='close' disabled={this.state.disabled} onClick={this.setRemoved} />*/}
                    {/*</Menu.Item>*/}
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button positive disabled={this.state.disabled}
                                    onClick={this.sendFile}
                                    loading={this.state.sending}>Send
                            </Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                </Message>
                <Segment attached raised textAlign='center' className='censor_content'>
                    <Accordion styled fluid>
                        <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                            <Icon name='dropdown' />
                            Ingest {lt > 0 ? ct : ""}
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex === 0}>
                            <Table selectable compact='very' basic structured className="ingest_table">
                                <Table.Body>
                                    {trimmed}
                                </Table.Body>
                            </Table>
                        </Accordion.Content>

                        <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                            <Icon name='dropdown' />
                            Cassette {lc > 0 ? cc : ""}
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex === 1}>
                            <Table selectable compact='very' basic structured className="ingest_table">
                                <Table.Body>
                                    {cassette_data}
                                </Table.Body>
                            </Table>
                        </Accordion.Content>

                        <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
                            <Icon name='dropdown' />
                            External {ld > 0 ? cd : ""}
                        </Accordion.Title>
                        <Accordion.Content active={activeIndex === 2}>
                            <Table selectable compact='very' basic structured className="ingest_table">
                                <Table.Body>
                                    {dgima_data}
                                </Table.Body>
                            </Table>
                        </Accordion.Content>
                    </Accordion>



                </Segment>
            </Segment>
        );
    }
}

export default CensorCheck;