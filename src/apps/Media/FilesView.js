import React, {Component} from 'react';
import {getData, WFSRV_BACKEND} from '../../shared/tools';
import {
    Segment,
    Icon,
    Table,
    Loader,
    Input,
    Button,
    Menu,
    Modal,
    Message
} from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import MediaPlayer from "../../components/Media/MediaPlayer";

// NOTE: media-адаптация Products/FilesView.
// Таблица media НЕ имеет колонки properties, поэтому фильтры archive/mdb (мапятся
// backend'ом в properties['...']) убраны. Оставлены фильтры по реальным колонкам media:
// date и uid. Продукт-специфичный FileManager заменён на превью через MediaPlayer.
class FilesView extends Component {

    state = {
        file_data: {},
        files: [],
        filters: {},
        page: 0,
        source: "",
        date: null,
        uid: "",
        active: null,
    };

    componentDidMount() {
        this.getFiles();
    };

    getFiles = (offset) => {
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `media/kv?limit=20&offset=${offset}` : `media/kv?limit=20&offset=${offset}&` + query.join('&');

        getData(path, files => {
            console.log(files)
            this.setState({page: offset, files: files || []})
        });
    };

    selectFile = (file_data) => {
        console.log(":: Selected file: ",file_data);
        let path = file_data.file_path;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: file_data.media_id, file_data});
    };

    setDateFilter = (date) => {
        if(!date) {
            this.removeFilter("date");
            return
        }
        const {filters} = this.state;
        filters.date = date.toLocaleDateString('sv');
        this.setState({filters, date, page: 0}, () => {
            this.getFiles();
        });
    };

    setUnitFilter = (uid) => {
        if(!uid) {
            this.removeFilter("uid");
            return
        }
        const {filters} = this.state;
        filters.uid = uid;
        this.setState({filters, uid, page: 0}, () => {
            this.getFiles();
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "date" ? null : "";
        this.setState({filters, [f]: value, page: 0}, () => {
            this.getFiles();
        });
    };

    getPlayer = (player) => {
        console.log(":: Media - got player: ", player);
    };

    render() {
        const {files, source, page, date, uid} = this.state;

        let l = (<Loader size='mini' active inline />);

        let files_data = files.map((data) => {
            const {media_id, file_name, date, size, sha1, uid, wfstatus} = data;
            let name = wfstatus?.removed ? <div>{l}&nbsp;&nbsp;&nbsp;{file_name}</div> : file_name;
            let time = data.date || "";
            let active = this.state.active === media_id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={media_id} positive={wfstatus?.kmedia} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{media_id}</Table.Cell>
                    <Table.Cell>{uid}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell>{size}</Table.Cell>
                    <Table.Cell>{sha1}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment basic className="wfdb_app">
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source}/>}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4'/>
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <DatePicker
                                customInput={<Input icon={
                                    <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />
                                }/>}
                                dateFormat="yyyy-MM-dd"
                                showYearDropdown
                                showMonthDropdown
                                scrollableYearDropdown
                                maxDate={new Date()}
                                openToDate={new Date()}
                                selected={date ? date : null}
                                placeholderText="Date:"
                                onChange={this.setDateFilter}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Input
                                placeholder="UID:"
                                value={uid}
                                icon={<Icon name={uid ? 'close' : 'search'} link onClick={() => uid && this.removeFilter("uid")} />}
                                onChange={(e, {value}) => this.setUnitFilter(value)} />
                        </Menu.Item>
                        <Menu.Menu position='right'>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic size='small' structured>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={2}>Media ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={5}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Size</Table.HeaderCell>
                            <Table.HeaderCell width={3}>SHA1</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='6' textAlign='center'>
                                <Button.Group>
                                    <Button basic disabled={page === 0}
                                            onClick={() => this.getFiles(page - 20)}>
                                        <Icon name='left chevron' />
                                    </Button>
                                    <Button basic>{page}-{page + files.length}</Button>
                                    <Button basic disabled={files.length < 20}
                                            onClick={() => this.getFiles(page + 20)}>
                                        <Icon name='right chevron' />
                                    </Button>
                                </Button.Group>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
            </Segment>
        );
    }
}

export default FilesView;
