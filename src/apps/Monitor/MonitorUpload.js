import React, { Component } from 'react'
import { Table, Container, Loader } from 'semantic-ui-react'

class MonitorUpload extends Component {

    state = {};

    render() {
        let l = (<Loader size='mini' active inline />);

        let upload_data = this.props.upload.map((item, i) => {
            let itemts = item.split(/\s+/);
            if (itemts[1]?.match(/^(running|queued)$/)) {
                //const ID = itemts[0];
                const State = itemts[1];
                //const Log = itemts[2];
                const Task = JSON.parse(itemts[3].split('[')[1].split(']')[0]);
                //const Script = itemts[3];
                const {archive_type,file_name} = Task;
                const name = State === "running" ? <div>{l}&nbsp;&nbsp;&nbsp;{file_name}</div> : file_name;
                const ncolor = State === "running";
                return (
                    <Table.Row key={i} warning={ncolor} className="monitor_tr">
                        <Table.Cell>{archive_type}</Table.Cell>
                        <Table.Cell>upload</Table.Cell>
                        <Table.Cell>{name}</Table.Cell>
                        <Table.Cell>{State}</Table.Cell>
                    </Table.Row>
                )
            }
        });

        return (

            <Container textAlign='center'>
                <u>Upload</u>
                <Table compact='very' basic size='small'>
                    <div className='upload_content'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>Dest</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Task</Table.HeaderCell>
                            <Table.HeaderCell>Name</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Progress</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {upload_data}
                    </Table.Body>
                    </div>
                </Table>
            </Container>
        );
    }
}

export default MonitorUpload;
