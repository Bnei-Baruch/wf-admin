import React, {Component} from 'react'
import {getData, getUnits, IVAL, putData, toHms} from '../shared/tools';
import { Menu, Segment, Label, Icon, Table, Loader, Button, Modal } from 'semantic-ui-react'
import MediaPlayer from "../Media/MediaPlayer";

class CensorTrimmed extends Component {

    state = {
        active: null,
        disabled: true,
        open: false,
        trimmed: [],
        file_data: {},
        ival: null,
        sending: false,
        tags: {},
        units: [],

    };

    componentDidMount() {
        let ival = setInterval(() => getData('trim', (data) => {
                if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                    this.setState({trimmed: data})
            }), IVAL );
        this.setState({ival});
        getUnits('http://wfserver.bbdomain.org/trim/titles.json', (tags) => {
            this.setState({tags});
        });
    };

    componentWillUnmount() {
        console.log("-- Trimmed unmount");
        clearInterval(this.state.ival);
    };

    selectFile = (data) => {
        console.log(":: Trimmed - selected file: ",data);
        let url = 'http://wfserver.bbdomain.org';
        let path = data.proxy.format.filename;
        let source = `${url}${path}`;
        this.setState({source, active: data.trim_id, file_data: data, disabled: true});
        let sha1 = data.original.format.sha1;
        getUnits('http://app.mdb.bbdomain.org/operations/descendant_units/'+sha1, (units) => {
            console.log(":: Trimmer - got units: ", units);
            if(units.total > 0)
                console.log("The file already got unit!");
            //this.setState({ units: units, disabled: false});
            this.setState({ units: units, disabled: data.wfstatus.kmedia});
        });
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    sendFile = () => {
        let file_data = this.state.file_data;
        console.log(":: Going to send File: ", file_data);
        this.setState({ sending: true, disabled: true });
        setTimeout(() => this.setState({ sending: false }), 5000);
        file_data.wfstatus.checked = true;
        file_data.wfstatus.kmedia = true;
        file_data.wfstatus.buffer = true;
        putData(`http://wfdb.bbdomain.org:8080/trimmer/${file_data.trim_id}`, file_data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            // FIXME: When API change this must be error recovering
            if(!file_data.wfstatus.secured)
                fetch(`http://ffconv1.bbdomain.org:8081/convert?id=${file_data.trim_id}&key=kmedia`);
        });
    };

    render() {

        let trimmed = this.state.trimmed.map((data) => {
            let name = (data.wfstatus.trimmed) ? data.file_name : <div><Loader size='mini' active inline />&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = (data.wfstatus.censored) ? <Icon name='copyright'/> : "";
            let time = toHms(data.proxy.format.duration).split('.')[0] || "";
            if(!data.wfstatus.censored || data.wfstatus.buffer)
                 return;
            let rowcolor = data.wfstatus.censored && !data.wfstatus.checked;
            let active = this.state.active === data.trim_id ? 'active' : '';
            return (
                <Table.Row
                    negative={rowcolor}
                    positive={data.wfstatus.checked}
                    warning={!data.wfstatus.kmedia}
                    className={active} key={data.trim_id} onClick={() => this.selectFile(data)}
                >
                    <Table.Cell>{censor}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised>
                <Label color='grey' attached='top' size='large'> {this.state.file_data.file_name ? this.state.file_data.file_name : "Trimmed Files:"} </Label>
                <Menu size='mini' secondary >
                    <Menu.Item>
                        <Modal trigger={<Button disabled={this.state.disabled} ><Icon name='play' /></Button>} size='tiny' mountNode={document.getElementById("ltr-modal-mount")}>
                            <MediaPlayer player={this.getPlayer} source={this.state.source} />
                        </Modal>
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Button positive disabled={this.state.disabled} onClick={this.sendFile} loading={this.state.sending}>Send</Button>
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Duration</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {trimmed}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default CensorTrimmed;