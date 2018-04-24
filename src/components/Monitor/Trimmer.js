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
        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon color='blue' name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);

        let trimmer_data = this.state.trimmer.map((data) => {
            const {trimmed,renamed,removed,buffer,wfsend,censored,checked,fixed} = data.wfstatus;
            let id = data.trim_id;
            let name = trimmed ? data.file_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.file_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(this.props.removed && removed)
                return false;
            let rowcolor = censored && !checked;
            return (
                <Table.Row key={id} negative={rowcolor} positive={wfsend} warning={!trimmed} disabled={removed} className="monitor_tr">
                    <Table.Cell>{censored && trimmed ? c : ""}{fixed ? f : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{renamed ? v : x}</Table.Cell>
                    <Table.Cell>{buffer ? v : x}</Table.Cell>
                    <Table.Cell negative={!wfsend}>{wfsend ? v : x}</Table.Cell>
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