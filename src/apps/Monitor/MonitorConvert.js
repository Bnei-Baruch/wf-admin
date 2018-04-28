import React, { Component } from 'react'
import { getStatus, IVAL } from '../../shared/tools';
import { Table, Container, Loader } from 'semantic-ui-react'

class MonitorConvert extends Component {

    state = {
        convert: [],
        ival: null,
    };

    componentDidMount() {
        let ival = setInterval(() =>
            getStatus("carbon", (data) => {
                let convert = JSON.parse(data.stdout);
                convert.splice(0,1);
                if (JSON.stringify(this.state.convert) !== JSON.stringify(data)) {
                    var wfts = [];
                    convert.forEach(function (item) {
                        var itemts = item.split(/\s+/);
                        if (itemts[1] !== undefined && itemts[1].match(/^(running|queued)$/)) {
                             var jsonts = {
                                "ID": itemts[0],
                                "State": itemts[1],
                                "Log": itemts[2],
                                "ELevel": null,
                                "Times": null,
                                "Script": itemts[3],
                                "Arg1": itemts[4],
                                "Arg2": itemts[5],
                                "Arg3": itemts[6],
                            };
                            wfts.push(jsonts);
                        }
                    });
                    this.setState({convert: wfts})
                }
            }), IVAL
        );
        this.setState({ival: ival});
    };


    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    render() {
        let l = (<Loader size='mini' active inline />);

        let convert_data = this.state.convert.map((data, i) => {
            let state = data.State;
            let task = data.Script.split('[')[1].split(']')[0];
            let name = <div>{l}&nbsp;&nbsp;&nbsp;{data.Arg2}</div>;
            let dest = state === "running" ? data.Arg1 : "convert";
            let ncolor = state === "running";
            return (
                <Table.Row key={i} warning={ncolor} className="monitor_tr">
                    <Table.Cell>{task}</Table.Cell>
                    <Table.Cell>{dest}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{state}</Table.Cell>
                </Table.Row>
            )
        });

        return (

            <Container textAlign='center'>
                <u>Carbon</u>
                <Table compact='very' basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>Dest</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Task</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Progress</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {convert_data}
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default MonitorConvert;