import React, {Component, Fragment} from 'react'
import {
    Button,
    Breadcrumb,
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
            this.setState({data: file_data.children, navigation: {...this.state.navigation, [name]: file_data.children}})
            return
        }
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: name, file_data});
    };

    selectNav = (key) => {
        console.log(":: Selected nav: ",key);
        const {navigation} = this.state;
        this.setState({data: navigation[key]})
    }

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
    };


    render() {
        const {data, source, active, archive, navigation, language} = this.state;

        let d = (<Icon name='folder'/>);
        let f = (<Icon name='file'/>);
        // let c = (<Icon color='blue' name='copyright'/>);
        // let f = (<Icon color='blue' name='configure'/>);
        // let l = (<Loader size='mini' active inline />);
        // let d = (<Icon color='blue' name='lock'/>);
        // let s = (<Icon color='red' name='key'/>);

        let files_data = data.map((data) => {
            const {is_dir, name, mod_time, path} = data;
            let href = `${WFSRV_BACKEND}/${path}`;
            let link = archive ? (<a target="_blank" rel="noopener noreferrer" href={href}>link</a>) : "";
            let selected = active === name ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={name} warning={is_dir} className={selected}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{is_dir ? d : f}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{mod_time}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                </Table.Row>
            )
        });



        return (
            <Segment basic className="wfdb_app">
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Breadcrumb>
                                {Object.keys(navigation).map((k, i) => {
                                    return (
                                        <Fragment key={i}>
                                            <Breadcrumb.Section link onClick={(e,{children}) => this.selectNav(children)}>{k}</Breadcrumb.Section>
                                            <Breadcrumb.Divider />
                                        </Fragment>
                                    )
                                })}
                            </Breadcrumb>
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
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Extension</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    {/*<Table.Footer fullWidth>*/}
                    {/*    <Table.Row>*/}
                    {/*        <Table.HeaderCell colSpan='9' textAlign='center'>*/}
                    {/*            <Button.Group>*/}
                    {/*                <Button basic disabled={page === 0}*/}
                    {/*                        onClick={() => this.getFiles(page - 20)}>*/}
                    {/*                    <Icon name='left chevron' />*/}
                    {/*                </Button>*/}
                    {/*                <Button basic>{page}-{page + files.length}</Button>*/}
                    {/*                <Button basic disabled={files.length < 20}*/}
                    {/*                        onClick={() => this.getFiles(page + 20)}>*/}
                    {/*                    <Icon name='right chevron' />*/}
                    {/*                </Button>*/}
                    {/*            </Button.Group>*/}
                    {/*        </Table.HeaderCell>*/}
                    {/*    </Table.Row>*/}
                    {/*</Table.Footer>*/}
                </Table>
            </Segment>
        );
    }
}

export default FilesLc;
