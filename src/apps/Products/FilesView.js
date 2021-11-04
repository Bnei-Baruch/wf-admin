import React, {Component} from 'react';
import {getData, WFDB_BACKEND, MDB_UNIT_URL, getToken, WFSRV_BACKEND} from '../../shared/tools';
import {
    Segment,
    Icon,
    Table,
    Loader,
    Popup,
    Checkbox,
    Input,
    Button,
    Menu,
    Modal,
    Message, Dropdown
} from 'semantic-ui-react'
import DatePicker from "react-datepicker";
import MediaPlayer from "../../components/Media/MediaPlayer";
import {dep_options, WF_LANGUAGES} from "../../shared/consts";
import FileManager from "./FileManager";

class FilesView extends Component {

    state = {
        file_data: {},
        files: [],
        filters: {},
        wfstatus: {},
        line: {},
        page: 0,
        source: "",
        archive: false,
        date: null,
        language: "",
        meta_data: {},
        i18n_data: {name: ""},
        lang: ""
    };

    componentDidMount() {
        this.getFiles();
    };

    getFiles = (offset) => {
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `files/find?limit=20&offset=${offset}` : `files/find?limit=20&offset=${offset}&` + query.join('&');

        if(filters.archive) {
            path = path + `&archive=true&uid=`
        }

        if(filters.pattern) {
            let id = filters.pattern;
            if(id.match(/^([a-zA-Z0-9]{8})$/)) {
                path = `files/find?pattern=${id}`
            } else {
                path = `files/find?product_id=${id}`
            }
        }

        getData(path, files => {
            console.log(files)
            this.setState({page: offset, files})
        });
    };

    getProduct = (file_data) => {
        const {product_id, language} = file_data;
        let path =  `products/${product_id}`;
        getData(path, product => {
            console.log(product);
            const {i18n} = product;
            this.setState({metadata: product, product_id, i18n_data: i18n[WF_LANGUAGES[language]]});
        });
    };

    selectFile = (file_data) => {
        console.log(":: Sselected file: ",file_data);
        let path = file_data.properties.url;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({source, active: file_data.file_id, file_data, show_filemanager: true, lang: file_data.language});
        this.getProduct(file_data)
    };

    setLangFilter = (language) => {
        if(!language) {
            this.removeFilter("language");
            return
        }
        const {filters} = this.state;
        filters.language = language
        this.setState({filters, language, page: 0}, () => {
            this.getFiles();
        });
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
        console.log("selectUnit: ", uid);
        filters.uid = uid;
        this.setState({filters, uid, page: 0}, () => {
            this.getFiles();
        });
    };

    setArchiveFilter = (archive) => {
        if(!archive) {
            this.removeFilter("archive");
            return
        }
        const {filters} = this.state;
        filters.archive = archive
        this.setState({filters, archive, page: 0}, () => {
            this.getFiles();
        });
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "film_date" ? null : "";
        this.setState({filters, [f]: value, page: 0}, () => {
            this.getFiles();
        });
    };

    getPlayer = (player) => {
        console.log(":: Censor - got player: ", player);
    };

    toggle = (data) => {
        console.log(":: Got state: ",data + " : ",this.state.wfstatus[data]);
        let wfstatus = this.state.wfstatus;
        wfstatus[data] = !this.state.wfstatus[data];
        fetch(`${WFDB_BACKEND}/trimmer/${this.state.id}/wfstatus/${data}?value=${wfstatus[data]}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}});
        this.setState({wfstatus: {...wfstatus}});
    };

    toggleFileManager = () => {
        this.setState({show_filemanager: !this.state.show_filemanager});
    };

    render() {
        const {files, source, page, archive, date, language, show_filemanager, file_data, product_id, i18n_data, lang, meta_data} = this.state;

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let c = (<Icon color='blue' name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let l = (<Loader size='mini' active inline />);
        let d = (<Icon color='blue' name='lock'/>);
        let s = (<Icon color='red' name='key'/>);

        let admin = (
            <Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} />
        );

        let root =(
            <div><Checkbox label='Wfsend' onClick={() => this.toggle("wfsend")} checked={this.state.wfstatus.wfsend} /><br />
                <Checkbox label='Kmedia' onClick={() => this.toggle("kmedia")} checked={this.state.wfstatus.kmedia} /><br />
                <Checkbox label='Checked' onClick={() => this.toggle("checked")} checked={this.state.wfstatus.checked} /><br />
                <Checkbox label='Censored' onClick={() => this.toggle("censored")} checked={this.state.wfstatus.censored} /><br />
                <Checkbox label='Trimmed' onClick={() => this.toggle("trimmed")} checked={this.state.wfstatus.trimmed} /><br />
                <Checkbox label='Metus' onClick={() => this.toggle("metus")} checked={this.state.wfstatus.metus} /><br />
                <Checkbox label='Backup' onClick={() => this.toggle("backup")} checked={this.state.wfstatus.backup} /><br />
                <Checkbox label='Buffer' onClick={() => this.toggle("buffer")} checked={this.state.wfstatus.buffer} /><br />
                <Checkbox label='Fixed' onClick={() => this.toggle("fixed")} checked={this.state.wfstatus.fixed} /><br />
                <Checkbox label='Renamed' onClick={() => this.toggle("renamed")} checked={this.state.wfstatus.renamed} /><br />
                <Checkbox label='Locked' onClick={() => this.toggle("locked")} checked={this.state.wfstatus.locked} /><br />
                <Checkbox label='Secured' onClick={() => this.toggle("secured")} checked={this.state.wfstatus.secured} /><br />
                <Checkbox label='Removed' onClick={() => this.toggle("removed")} checked={this.state.wfstatus.removed} /><br /></div>
        );

        let files_data = files.map((data) => {
            const {file_id, file_name, file_type, date, language, extension, properties, product_id, uid} = data;
            const {removed, archive, sync} = properties;
            let name = sync ? <div>{l}&nbsp;&nbsp;&nbsp;{file_name}</div> : file_name;
            let time = new Date(file_id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            let href = `${MDB_UNIT_URL}/${uid}`;
            let link = archive ? (<a target="_blank" rel="noopener noreferrer" href={href}>{uid}</a>) : "";
            let rowcolor = archive && uid === "";
            let active = this.state.active === file_id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={file_id} negative={rowcolor} positive={archive} warning={false} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Popup
                        trigger={<Table.Cell>{file_id}</Table.Cell>}
                        on='click'
                        hideOnScroll
                        onOpen={() => this.getStatus(data)}
                        mountNode={document.getElementById("ltr-modal-mount")}>
                        {this.props.wf_root ? root : admin}
                    </Popup>
                    <Table.Cell>{product_id}</Table.Cell>
                    <Table.Cell>{link}</Table.Cell>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{file_type}</Table.Cell>
                    <Table.Cell>{language}</Table.Cell>
                    <Table.Cell>{extension}</Table.Cell>
                    <Table.Cell warning={removed}>{removed ? v : x}</Table.Cell>
                    <Table.Cell negative={!archive}>{archive ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        const to_mdb = files.find(f => f.uid && lang === f.language) || archive;
        const mdb_file = files.find(f => f.properties?.archive && lang === f.language);

        return (
            <Segment basic className="wfdb_app">
                <FileManager product_id={product_id}
                             mdb_file={mdb_file}
                             to_mdb={to_mdb}
                             metadata={i18n_data}
                             user={this.props.user}
                             file_data={file_data}
                             source={source}
                             show_filemanager={show_filemanager}
                             product={meta_data}
                             getProductFiles={this.getFiles}
                             toggleFileManager={this.toggleFileManager} />
                <Message size='large'>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Checkbox label='To Archive' checked={archive} onChange={() => this.setArchiveFilter(!archive)} />
                        </Menu.Item>
                        <Menu.Item>
                            <Dropdown
                                placeholder="Archive:"
                                selection
                                clearable
                                options={dep_options}
                                language={language}
                                onChange={(e, {value}) => this.setArchiveFilter(value)}
                                value={language}>
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                            <DatePicker
                                // locale={locale}
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
                            <Dropdown
                                placeholder="Language:"
                                selection
                                clearable
                                options={dep_options}
                                language={language}
                                onChange={(e, {value}) => this.setLangFilter(value)}
                                value={language}>
                            </Dropdown>
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
                            <Table.HeaderCell width={1}>Product ID</Table.HeaderCell>
                            <Table.HeaderCell width={1}>UID</Table.HeaderCell>
                            <Table.HeaderCell width={4}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Type</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Language</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Extension</Table.HeaderCell>
                            <Table.HeaderCell width={1}>RMV</Table.HeaderCell>
                            <Table.HeaderCell width={1}>SND</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='9' textAlign='center'>
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
