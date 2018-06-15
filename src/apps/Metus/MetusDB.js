import React, {Component} from 'react'
import {getData, getUnits} from '../../shared/tools';
import { Menu, Input, Segment, Label, Table, Button, Modal, Message } from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";

class MetusDB extends Component {

    state = {
        active: null,
        disabled: false,
        loading: false,
        file_data: {},
        metus: [],
        search: "",
    };

    componentDidMount() {
        console.log("-- MetusDB Mount --");
    };

    componentWillUnmount() {
        console.log("-- MetusDB Unmount --")
    };

    setStatusValue = (search) => {
        console.log(":: Selected value options: ", search);
        this.setState({search});
    };

    setSearchValue = () => {
        const {search} = this.state;
        this.setState({loading: true, disabled: true});
        console.log(":: Search in MetusDB: ", search);
        getUnits(`http://10.66.1.117:8081/hooks/metus?name=${search}`, (metus) => {
            console.log(":: MetusDB - respond: ",metus);
            this.setState({metus, loading: false, disabled: false});
        });
    };

    selectFile = (file_data) => {
        console.log(":: MetusDB - selected file: ",file_data);
        let url = 'http://wfserver.bbdomain.org';
        let path = file_data.mlpath;
        let source = `${url}${path}`;
        let file_name = file_data.filename.split('.')[0];
        this.setState({file_data, source, active: file_data.object_id});
        getData(`aricha/find?key=file_name&value=${file_name}`, (aricha) => {
            console.log(":: Aricha DB Data: ",aricha);
            //this.setState({aricha});
        });
    };

    getPlayer = (player) => {
        console.log(":: Admin - got player: ", player);
        //this.setState({player: player});
    };

    onCancel = (data) => {
        console.log(":: Cit cancel: ", data);
        this.setState({open: false});
    };

    render() {

        const {loading,disabled} = this.state;

        // let v = (<Icon name='checkmark'/>);
        // let x = (<Icon name='close'/>);
        // let l = (<Loader size='mini' active inline />);
        // let c = (<Icon color='blue' name='copyright'/>);
        // let f = (<Icon color='blue' name='configure'/>);

        let metus = this.state.metus.map((data) => {
            const {filename,object_id,title} = data;
            let active = this.state.active === object_id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    className={active} key={object_id}
                    onClick={() => this.selectFile(data)} >
                    <Table.Cell>{filename}</Table.Cell>
                    <Table.Cell>{title}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" color='brown' raised>
                <Label attached='top' className="trimmed_label">
                    {this.state.file_data.title ? this.state.file_data.title : "Metus"}
                </Label>
                <Input className='input_wfdb' type='text' placeholder='Search...' action
                       onChange={e => this.setStatusValue(e.target.value)}>
                    <input />
                    <Button type='submit' basic color='green' loading={loading} disabled={disabled} onClick={this.setSearchValue}>Search</Button>
                </Input>
                <Message size='large'>
                    <Menu size='large' secondary>
                        <Menu.Item>
                            <Modal size='tiny'
                                   trigger={<Button color='brown' icon='play' disabled={!this.state.source} />}
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={this.state.source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' icon='close' disabled={true}  onClick={this.setRemoved} />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                            </Menu.Item>
                            <Menu.Item>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="admin_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell>Title</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {metus}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default MetusDB;