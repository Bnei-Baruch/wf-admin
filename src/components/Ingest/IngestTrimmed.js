import React, {Component, Fragment} from 'react'
import moment from 'moment';
import {getData, getUnits, IVAL} from '../shared/tools';
import { Menu, Segment, Dropdown, Icon, Table, Loader, Button, Header, Message } from 'semantic-ui-react'

class IngestTrimmed extends Component {

    state = {
        active: null,
        trimmed: [],
        trimmer: {},
        ival: null,
        units: [],

    };

    componentDidMount() {
            let ival = setInterval(() => getData('trim', (data) => {
                    if (JSON.stringify(this.state.trimmed) !== JSON.stringify(data))
                        this.setState({trimmed: data})
                }), 1000
            );
        this.setState({ival: ival});
    };

    componentWillUnmount() {
        console.log("-- Ingest unmount");
        clearInterval(this.state.ival);
    };

    handleClick = (data) => {
        console.log(":: Selected trim: ",data);
        let sha1 = data.original.format.sha1;
        getUnits('http://app.mdb.bbdomain.org/operations/descendant_units/'+sha1, (units) => {
            console.log(":: Trimmer - got units: ", units);
            this.setState({active: data.trim_id, trimmer: data, units: units});
        });
    };

    render() {

        const { activeItem } = this.state

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

                <Segment textAlign='center' className="ingest_segment" color='brown'>
                    <Header as='h3' textAlign='left' icon='settings' ><u>Trimmed</u><Icon name='settings' />
                    <Header.Content>
                    <Header.Subheader>{this.state.trimmer.file_name}</Header.Subheader>
                    </Header.Content>
                    </Header>
                    <Menu size='mini'>
                        <Menu.Item name='video play' active={activeItem === 'video play'} onClick={this.handleItemClick}>
                            <Icon name='video play' />
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Button positive>Send</Button>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
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
        );
    }
}

export default IngestTrimmed;