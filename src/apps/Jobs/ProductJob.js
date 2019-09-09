import React, {Component} from 'react'
import moment from 'moment';
import {
    getData,
    putData,
    removeData,
    getUnits,
    IVAL,
    WFDB_BACKEND,
    WFSRV_BACKEND,
    getDCT,
    insertName,
    arichaName,
    MDB_FINDSHA, newJobMeta
} from '../../shared/tools';
import {
    Menu,
    Segment,
    Label,
    Icon,
    Table,
    Loader,
    Button,
    Modal,
    Select,
    Message,
    Dropdown,
    Input
} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import InsertApp from "../Insert/InsertApp"
import CIT from '../CIT/CIT';

class ProductJob extends Component {

    state = {
        active: null,
        cit_open: false,
        doers: [],
        insert_open: false,
        insert_button: true,
        inserting: false,
        job_name: "",
        jobs: [],
        job_data: {},
        filedata: {},
        kmedia_option: false,
        metadata: {},
        input_id: "",
        ival: null,
        renaming: false,
        rename_button: false,
        send_button: true,
        sending: false,
        special: "censored",
        source: null,

    };

    componentDidMount() {
        let ival = setInterval(() => getData('jobs', (data) => {
                if (JSON.stringify(this.state.jobs) !== JSON.stringify(data))
                    this.setState({jobs: data})
            }), IVAL );
        this.setState({ival});
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    selectJob = (job_data) => {
        console.log(":: ArichaJobs - selected job: ", job_data);

        // Check if master file is added
        if(!job_data.original) {
            this.setState({job_data, source: null, active: job_data.job_id});
            return
        } else {
            // Build url for preview
            let path = job_data.original.format.filename;
            let source = `${WFSRV_BACKEND}${path}`;
            this.setState({job_data, source, active: job_data.job_id});
        }

        // Check SHA1 in WFDB
        getData(`trimmer/sha1?value=${job_data.original.format.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in trimmer DB by SHA1: ",trimmer);
                alert("File did NOT changed from trimmer");
            } else {
                // Check SHA1 in MDB
                let sha1 = job_data.original.format.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The SHA1 exist in MDB!", units);
                    }
                });
            }
        });
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {job_data} = this.state;
        let newfile_name = newline.final_name;
        let oldfile_name = job_data.file_name;
        if(job_data.original) {
            let path = job_data.original.format.filename.split('/').slice(0,-1).join('/');
            let opath = `${path}/${newfile_name}_${job_data.job_id}o.mp4`;
            job_data.original.format.filename = opath;
        }
        if(job_data.proxy) {
            let path = job_data.proxy.format.filename.split('/').slice(0,-1).join('/');
            let ppath = `${path}/${newfile_name}_${job_data.job_id}p.mp4`;
            job_data.proxy.format.filename = ppath;
        }
        job_data.line = newline;
        job_data.parent.file_name = oldfile_name;
        job_data.file_name = newfile_name;
        job_data.wfstatus.renamed = true;
        this.setState({cit_open: false, renaming: true});
        if(job_data.original) {
            putData(`${WFSRV_BACKEND}/workflow/rename`, job_data, (cb) => {
                console.log(":: Ingest - rename respond: ",cb);
                if(cb.status === "ok") {
                    setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
                    this.selectJob(job_data);
                } else {
                    setTimeout(() => this.setState({renaming: false, disabled: job_data.wfstatus.wfsend}), 2000);
                }
            });
        } else {
            setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
            this.selectJob(job_data);
        }

    };

    openCit = () => {
        let {job_data} = this.state;
        job_data.line = {manual_name: job_data.file_name};
        this.setState({job_data, cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    setSpecial = (special) => {
        console.log(":: Selected send options: ", special);
        this.setState({special});
    };

    sendFile = () => {
        let {job_data,special} = this.state;
        job_data.special = special;
        console.log(":: Going to send File: ", job_data + " : to: ", special);
        this.setState({ sending: true, send_button: true });
        fetch(`${WFDB_BACKEND}/jobs/${job_data.job_id}/wfstatus/${special}?value=true`, { method: 'POST',});
        setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
        // putData(`${WFSRV_BACKEND}/workflow/send_aricha`, job_data, (cb) => {
        //     console.log(":: Aricha - send respond: ",cb);
        //     // While polling done it does not necessary
        //     //this.selectJob(job_data);
        //     if(cb.status === "ok") {
        //         setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
        //     } else {
        //         alert("Something goes wrong!");
        //     }
        // });

    };

    setJobName = (job_name) => {
        this.setState({job_name});
    };

    newJob = () => {
        const {job_name,doers} = this.state;
        let job_meta = newJobMeta(job_name);
        if(doers)
            job_meta.parent.doers = doers;
        console.log(" :: New Meta: ", job_meta);
        putData(`${WFDB_BACKEND}/jobs/${job_meta.job_id}`, job_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
        });
        this.setState({job_name: "", doers: []});
    };
    
    removeJob = () => {
        const {job_data} = this.state;
        removeData(`${WFDB_BACKEND}/jobs/${job_data.job_id}`, (cb) => {
            console.log(":: DELETE Respond: ",cb);
        });
    };

    setRemoved = () => {
        let {job_data} = this.state;
        console.log(":: Censor - set removed: ", job_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/jobs/${job_data.job_id}/wfstatus/removed?value=true`, { method: 'POST',})
    };

    addDoer = (doers) => {
        console.log(doers);
        this.setState({doers});
    };

    uploadMaster = () => {
        this.props.masterUpload(this.state.job_data.job_id);
    };

    openJob = () => {
        //TODO: Open modal with job files and options
    };

    newUnit = () => {
        //TODO: Make new unit
    };

    render() {

        const {job_data, source, renaming, rename_button, cit_open, inserting, insert_button, insert_open,
            filedata, metadata, special, send_button, sending, job_name, doers} = this.state;

        const send_options = [
            {key: 'Censor', text: 'Censor', value: 'censored'},
            {key: 'ToFix', text: 'ToFix', value: 'fix_req'},
            {key: 'Fixed', text: 'Fixed', value: 'fixed'},
            {key: 'Checked', text: 'Checked', value: 'checked'},
            {key: 'Aricha', text: 'Aricha', value: 'aricha'},
            {key: 'Buffer', text: 'Buffer', value: 'buffer'},
        ];

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);

        let jobs = this.state.jobs.map((data) => {
            const {aricha,removed,wfsend,censored,checked,fixed,fix_req,locked} = data.wfstatus;
            let id = data.job_id;
            let ready = true;
            let name = ready ? data.job_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.job_name}</div>;
            //let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked}
                    className={active} key={id} onClick={() => this.selectJob(data)}>
                    <Table.Cell>{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{data.date}</Table.Cell>
                    <Table.Cell negative={!checked}>{checked ? v : x}</Table.Cell>
                    <Table.Cell negative={!fix_req}>{fix_req ? v : x}</Table.Cell>
                    <Table.Cell negative={!fixed}>{fixed ? v : x}</Table.Cell>
                    <Table.Cell negative={!aricha}>{aricha ? v : x}</Table.Cell>
                </Table.Row>
            )
        });

        const doers_list = [
            {key: 0, text: "Michael Waintraub", value: "Michael Waintraub"},
            {key: 1, text: "Tanya Jdanova", value: "Tanya Jdanova"},
            {key: 2, text: "Hava Talal", value: "Hava Talal"},
            ];

        return (
            <Segment textAlign='center' className="ingest_segment" color='teal' raised>
                <Label  attached='top' className="trimmed_label" size='large'>
                    {job_data.job_name ? job_data.job_name : "Aricha Jobs"}
                </Label>
                <Menu secondary >
                    <Menu.Item>
                        <Button positive={true}
                                disabled={job_name === ""}
                                onClick={this.newJob}>New Job
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Input className="job_input"
                               placeholder="Job name.."
                               onChange={e => this.setJobName(e.target.value)}
                               value={job_name} />
                    </Menu.Item>
                    <Menu.Item>
                        <Dropdown
                            placeholder="Add doer.."
                            selection
                            multiple
                            options={doers_list}
                            value={doers}
                            onChange={(e, {value}) => this.addDoer(value)} />
                    </Menu.Item>
                    <Menu.Item>
                        <Button negative={true}
                                disabled={job_data.job_id === undefined}
                                onClick={this.removeJob}>Delete Job
                        </Button>
                    </Menu.Item>
                </Menu>
                <Message>
                    <Menu size='large' secondary >
                        <Menu.Item>
                            <Modal trigger={<Button color='brown' icon='play' disabled={!source} />}
                                   size='tiny'
                                   mountNode={document.getElementById("ltr-modal-mount")}>
                                <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                            </Modal>
                        </Menu.Item>
                        <Menu.Item>
                            <Modal closeOnDimmerClick={false}
                                   trigger={<Button color='blue' icon='tags'
                                                    loading={renaming}
                                                    disabled={rename_button}
                                                    // disabled={!source}
                                                    onClick={this.openCit} />}
                                   onClose={this.onCancel}
                                   open={cit_open}
                                   closeIcon="close"
                                   mountNode={document.getElementById("cit-modal-mount")}>
                                <Modal.Content>
                                    <CIT metadata={job_data.line}
                                         onCancel={this.onCancel}
                                         onComplete={(x) => this.renameFile(x)}/>
                                </Modal.Content>
                            </Modal>
                        </Menu.Item>
                        <Menu.Menu position='left'>
                            <Menu.Item>
                                <Button color='teal' icon='archive'
                                        loading={inserting}
                                        disabled={insert_button}
                                        onClick={this.newUnit} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='orange' icon='upload' disabled={job_data.job_id === undefined}
                                        onClick={this.uploadMaster} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='yellow' icon='folder' disabled={job_data.job_id === undefined}
                                        onClick={this.openJob} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button color='red' icon='close' disabled={job_data.job_id === undefined}
                                        onClick={this.setRemoved} />
                            </Menu.Item>
                        </Menu.Menu>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                    <Select compact options={send_options}
                                            defaultValue={special}
                                            placeholder='Send options'
                                            onChange={(e, {value}) => this.setSpecial(value)} />
                            </Menu.Item>
                            <Menu.Item>
                                <Button positive icon="arrow right"
                                        //disabled={send_button}
                                        disabled={job_data.job_id === undefined}
                                        onClick={this.sendFile} loading={sending} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Censor</Table.HeaderCell>
                            <Table.HeaderCell width={1}>ToFix</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Fixed</Table.HeaderCell>
                            <Table.HeaderCell width={1}>Aricha</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {jobs}
                    </Table.Body>
                </Table>
            </Segment>
        );
    }
}

export default ProductJob;