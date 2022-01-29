import React, {Component} from 'react'
import {
    Button,
    Label,
    Icon,
    Menu,
    Message,
    Modal,
    Segment,
    Table
} from 'semantic-ui-react'
import {getFiles, WFSRV_BACKEND} from "../../shared/tools";
import MediaPlayer from "../../components/Media/MediaPlayer";

class FilesLc extends Component {

    state = {
        local: window.location.hostname === "wfsrv.bbdomain.org",
        data: [],
        navigation: {}
    };

    componentDidMount() {
        getFiles(data => {
            console.log(data.children)
            this.setState({data: data.children, navigation: {Clip: data.children}})
        });
    };

    selectFile = (file_data) => {
        const {is_dir, name, mod_time, path} = file_data;
        console.log(":: Selected file: ",file_data);
        if(is_dir) {
            this.setState({data: file_data.children, source: null, navigation: {...this.state.navigation, [name]: file_data.children}})
            return
        }
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: name, file_data});
    };

    selectNav = (key) => {
        console.log(":: Selected nav: ",key);
        const {navigation} = this.state;
        this.setState({data: navigation[key]})
    };

    removeNav = (e, key) => {
        e.stopPropagation()
        if(key === "Clip") return
        console.log(":: Remove nav: ", key);
        const {navigation} = this.state;
        delete navigation[key]
        this.setState({navigation})
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
    };


    render() {
        const {data, source, active, archive, navigation} = this.state;

        let d = (<Icon name='folder'/>);
        let f = (<Icon name='file'/>);

        let files_data = data.map((data) => {
            const {is_dir, name, mod_time, path} = data;
            //let href = `${WFSRV_BACKEND}/${path}`;
            //let link = (<a target="_blank" rel="noopener noreferrer" href={href}>link</a>);
            let selected = active === name ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={name} warning={is_dir} className={selected}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{is_dir ? d : f}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{mod_time}</Table.Cell>
                </Table.Row>
            )
        });



        return (
            <Segment basic className="wfdb_app">
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                                {Object.keys(navigation).map((k, i) => {
                                    return (
                                        <Label key={i} as='a' value={k} removeIcon='delete' size='huge' content={k}
                                               onClick={(e, {value}) => this.selectNav(value)}
                                               onRemove={(e ,{value}) => this.removeNav(e, value)} />
                                    )
                                })}
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                       size='tiny'
                                       mountNode={document.getElementById("ltr-modal-mount")}>
                                    <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                                </Modal>
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='teal' icon='download' disabled={!source} href={source} download />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>ID</Table.HeaderCell>
                            <Table.HeaderCell width={4}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Modification Time</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default FilesLc;
