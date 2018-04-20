import React, { Component } from 'react'
import moment from 'moment';
import { getData, IVAL } from '../shared/tools';
import { Icon, Table, Container, Loader } from 'semantic-ui-react'

class Trimmer extends Component {

    state = {
        trimmer: [],
        ival: null,
    };

    componentDidMount() {
        let ival = setInterval(() =>
            getData('trimmer/find?key=date&value='+moment().format('YYYY-MM-DD'), (data) => {
                if (JSON.stringify(this.state.trimmer) !== JSON.stringify(data))
                    this.setState({trimmer: data})
            }), IVAL
        );
        this.setState({ival: ival});
    };


    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    render() {
        let trimmer_data = this.state.trimmer.map((data) => {
            let name = (data.wfstatus.trimmed) ? data.file_name : <div><Loader size='mini' active inline></Loader>&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let censor = (data.wfstatus.censored) ? <Icon name='copyright'/> : "";
            let time = moment.unix(data.trim_id.substr(1)).format("HH:mm:ss") || "";
            //let removed = data.wfstatus.removed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            if(this.props.removed && data.wfstatus.removed)
                return false;
            let renamed = data.wfstatus.renamed ? <Icon name='checkmark'/> : <Icon name='close'/>;
            //let checked = data.wfstatus.checked ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let buffer = data.wfstatus.buffer ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let wfsend = data.wfstatus.wfsend ? <Icon name='checkmark'/> : <Icon name='close'/>;
            let rowcolor = data.wfstatus.censored && !data.wfstatus.checked;
            return (
                <Table.Row negative={rowcolor} positive={data.wfstatus.wfsend} warning={!data.wfstatus.trimmed} disabled={data.wfstatus.removed} className="monitor_tr">
                    <Table.Cell>{censor}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed}</Table.Cell>
                    <Table.Cell>{buffer}</Table.Cell>
                    <Table.Cell negative={!data.wfstatus.wfsend}>{wfsend}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <u>Trimmer</u>
                <Table compact='very' basic size='small' structured>
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
                        {trimmer_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default Trimmer;