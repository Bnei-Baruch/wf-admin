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
    WFSRV_BACKEND, newTrimMeta
} from '../../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal, Message } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import TrimmerApp from "../Trimmer/TrimmerApp";

class CensorCheck extends Component {

    state = {
        active: null,
        disabled: true,
        open: false,
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
        }, IVAL );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectFile = (file_data) => {
        console.log(":: Trimmed - selected file: ",file_data);
        let id = file_data.trim_id || file_data.dgima_id;
        const {wfsend,fixed} = file_data.wfstatus;
        let path = file_data.proxy.format.filename;
        let sha1 = file_data.parent.original_sha1;
        let source = `${WFSRV_BACKEND}${path}`;
        let trim_meta = newTrimMeta(file_data, "censor", this.state.trim_src);
        this.setState({source, active: id, file_data, trim_meta, disabled: true});
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
                this.setState({units: units, fixReq: true, disabled: true, units_options });
            } else if(wfsend && fixed) {
                // Maybe we need indicate somehow about fixed unit
                console.log(":: Fix already done - ", units);
                this.setState({units: units, fixReq: false, disabled: false });
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
        fetch(`${WFDB_BACKEND}/${ep}/${active}/wfstatus/removed?value=true`, { method: 'POST',})
    };

    setSecured = () => {
        let {file_data,active} = this.state;
        let status = !file_data.wfstatus.secured || false;
        let ep = getEndpoint(active);
        console.log(":: Censor - set secured: ", file_data);
        this.setState({ disabled: true });
        fetch(`${WFDB_BACKEND}/${ep}/${active}/wfstatus/secured?value=${status}`, { method: 'POST',})
    };

    sendToTrim = () => {
        this.setState({open: true});
    };

    onClose = () => {
        this.setState({open: false, disabled: true, file_data: ""});
    };

    render() {

        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let trimmed = this.state.trimmed.map((data) => {
            const {trimmed,kmedia,buffer,censored,checked,fixed,locked,secured} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = data.proxy ? toHms(data.proxy.format.duration).split('.')[0] : "";
            if(!censored || buffer)
                 return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor} positive={checked} warning={!kmedia} disabled={!trimmed || locked}
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

        let dgima = this.state.dgima.map((data) => {
            const {trimmed,kmedia,buffer,censored,checked,fixed,locked,secured} = data.wfstatus;
            let id = data.dgima_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = data.proxy ? toHms(data.proxy.format.duration).split('.')[0] : "";
            if(!censored || buffer)
                return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor} positive={checked} warning={!kmedia} disabled={!trimmed || locked}
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
                        <Button color='red' icon='close' disabled={this.state.disabled} onClick={this.setRemoved} />
                    </Menu.Item>
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
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell textAlign='center'>Ingest</Table.HeaderCell>
                            <Table.HeaderCell width={2}></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {trimmed}
                    </Table.Body>
                </Table>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell textAlign='center'>Dgima</Table.HeaderCell>
                            <Table.HeaderCell width={2}></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {dgima}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default CensorCheck;