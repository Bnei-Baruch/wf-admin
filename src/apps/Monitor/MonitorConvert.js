import React, { Component } from 'react'
import { Table, Container, Loader } from 'semantic-ui-react'

class MonitorConvert extends Component {

    state = {};


    render() {
        let l = (<Loader size='mini' active inline />);

        let convert_data = this.props.convert.map((item, i) => {
            let itemts = item.split(/\s+/);
            if (itemts[1]?.match(/^(running|queued)$/)) {
                //const ID = itemts[0];
                const State = itemts[1];
                //const Log = itemts[2];
                //const Task = JSON.parse(itemts[3].split('[')[1].split(']')[0]);
                const Script = itemts[3];
                const Arg1 = itemts[4];
                const Arg2 = itemts[5];
                //const Arg3 = itemts[6];
                const task = Script.split('[')[1].split(']')[0];
                const name = <div>{State === "running" ? l : ""}&nbsp;&nbsp;&nbsp;{Arg2}</div>
                const dest = State === "running" ? Arg1 : "convert";
                const ncolor = State === "running";
                return (
                    <Table.Row key={i} warning={ncolor} className="monitor_tr">
                        <Table.Cell>{task}</Table.Cell>
                        <Table.Cell>{dest}</Table.Cell>
                        <Table.Cell>{name}</Table.Cell>
                        <Table.Cell>{State}</Table.Cell>
                    </Table.Row>
                )
            }
        });

        return (

            <Container textAlign='center'>
                <u>Convert</u>
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
