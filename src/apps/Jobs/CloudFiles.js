import React, {Component} from 'react';
import {getData, WFDB_BACKEND, MDB_UNIT_URL, getToken, WFSRV_BACKEND, WFNAS_STP, putData} from '../../shared/tools';
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
import {dep_options} from "../../shared/consts";
import ProductUpload from "./ProductUpload";

class CloudFiles extends Component {

    state = {
        files: [],
        jobs: [],
        job_id: null,
        filters: {},
        wfstatus: {},
        line: {},
        page: 0,
        source: "",
        archive: false,
        date: null,
        language: "",
    };

    componentDidMount() {
        const {user_id} = this.props.user;
        getData('jobs/find?doers='+user_id, (jobs) => {
            console.log(jobs)
            this.setState({jobs});
        })
    };

    selectJob = (job_id) => {
        this.setState({job_id});
        this.getFiles(job_id)
    };

    getFiles = (job_id, offset) => {
        const {filters, page} = this.state;
        offset = offset < 0 ? 0 : offset !== undefined ? offset : page;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? `cloud/find?limit=20&offset=${offset}` : `cloud/find?limit=20&offset=${offset}&` + query.join('&');

        if(filters.archive) {
            path = path + `&archive=true&uid=`
        }

        if(filters.pattern) {
            let id = filters.pattern;
            if(id.match(/^([a-zA-Z0-9]{8})$/)) {
                path = `cloud/find?pattern=${id}`
            } else {
                path = `cloud/find?product_id=${id}`
            }
        }

        path = `cloud/find?wid=${job_id}`

        getData(path, files => {
            console.log(files)
            this.setState({page: offset, files})
        });
    };

    jobWorkflow = (filedata) => {
        filedata.archive_type = "product";
        filedata.job_id = this.state.job_id;
        filedata.timestamp = Date.now()
        console.log(":: JobsApp - got data: ", filedata);
        putData(`${WFSRV_BACKEND}/workflow/jobs`, filedata, (cb) => {
            console.log(":: JobsApp - workflow respond: ",cb);
            this.setState({job_id: null})
        });
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

    selectFile = (file_data) => {
        console.log(":: Selected file: ",file_data);
        let path = file_data.url;
        let source = `${WFNAS_STP}${path}`;
        this.setState({source, active: file_data.oid, file_data});
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

    render() {
        const {files, source, page, job_id, date, language, jobs} = this.state;

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

        const jobs_list = jobs.map(j => {
            const {job_id, job_name} = j;
            return ({key: job_id, text: job_name, value: job_id})
        });

        let files_data = files.map((data) => {
            const {oid, name, type, date, language, extension} = data;
            //let time = new Date(oid.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            const file_id = oid;
            let active = this.state.active === file_id ? 'active' : 'monitor_tr';
            return (
                <Table.Row key={file_id} warning={false} className={active}
                           onClick={() => this.selectFile(data)}>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{date}</Table.Cell>
                    <Table.Cell>{language}</Table.Cell>
                    <Table.Cell>{extension}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Segment basic className="wfdb_app">
                {this.state.job_id ? <ProductUpload onFileData={this.jobWorkflow} /> : ''}
                <Message size='large'>
                    <Menu size='large' secondary >
                        {/*<Menu.Item>*/}
                        {/*    <Checkbox label='To Archive' checked={archive} onChange={() => this.setArchiveFilter(!archive)} />*/}
                        {/*</Menu.Item>*/}
                        {/*<Menu.Item>*/}
                        {/*    <DatePicker*/}
                        {/*        customInput={<Input icon={*/}
                        {/*            <Icon name={date ? 'close' : 'dropdown'} link onClick={() => this.removeFilter("date")} />*/}
                        {/*        }/>}*/}
                        {/*        dateFormat="yyyy-MM-dd"*/}
                        {/*        showYearDropdown*/}
                        {/*        showMonthDropdown*/}
                        {/*        scrollableYearDropdown*/}
                        {/*        maxDate={new Date()}*/}
                        {/*        openToDate={new Date()}*/}
                        {/*        selected={date ? date : null}*/}
                        {/*        placeholderText="Date:"*/}
                        {/*        onChange={this.setDateFilter}*/}
                        {/*    />*/}
                        {/*</Menu.Item>*/}
                        <Menu.Item>
                            <Dropdown
                                placeholder="Select project.."
                                selection
                                options={jobs_list}
                                onChange={(e, {value}) => this.selectJob(value)}
                                value={job_id}>
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
                            <Table.HeaderCell width={4}>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Language</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Extension</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {files_data}
                    </Table.Body>
                    <Table.Footer fullWidth>
                        <Table.Row>
                            <Table.HeaderCell colSpan='4' textAlign='center'>
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

export default CloudFiles;
