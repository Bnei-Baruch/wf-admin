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
        rename_button: true,
        send_button: true,
        sending: false,
        special: "backup",

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
            this.setState({job_data, active: job_data.job_id});
            return
        }

        const {wfsend} = job_data.wfstatus;

        // Build url for preview
        let path = job_data.original.format.filename;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({
            job_data, source,
            active: job_data.aricha_id,
            rename_button: false,
            send_button: !wfsend,
            filedata: {filename: job_data.file_name},
            insert_button: true
            //kmedia_option: wfsend,
        });

        // Check SHA1 in WFDB
        getData(`trimmer/sha1?value=${job_data.original.format.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in trimmer DB by SHA1: ",trimmer);
                alert("File did NOT changed from trimmer");
                //this.setState({trimmer});
            } else {

                // Check SHA1 in MDB
                let sha1 = job_data.original.format.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The SHA1 exist in MDB!", units);

                        // Check SHA1 in Workflow
                        insertName(sha1, "sha1", (data) => {
                            if (data.length > 0 && job_data.file_name !== data[0].file_name) {
                                job_data.line.old_name = data[0].file_name;
                                job_data.line.fix_aricha_id = data[0].send_id;
                                console.log("The SHA1 exist in WorkFlow!", data);
                                console.log("-- Rename Insert mode --");
                                this.newInsertData(job_data, data, "3");
                            } else if (data.length > 0 && job_data.file_name === data[0].file_name) {
                                console.log("-- Insert Done --");
                            } else {
                                console.log("The SHA1 exist in MDB but does NOT exist in WorkFlow!");
                                alert("File already in MDB, but did pass WorkFlow!");
                            }
                        });
                    } else {

                        // Check filename in Workflow
                        arichaName(job_data.file_name, (data) => {
                            if(data.length > 1 && data[data.length-2].original.format.sha1 !== job_data.original.format.sha1) {
                                job_data.line.old_sha1 = data[data.length-2].original.format.sha1;
                                job_data.line.fix_aricha_id = data[data.length-2].aricha_id;
                                job_data.line.fix_unit_uid = data[data.length-2].line.uid;
                                console.log("The Filename already exist in WorkFlow but SHA1 does NOT exist in MDB: ",data);
                                console.log("-- Update Insert mode --");
                                this.newInsertData(job_data, data, "2");
                            } else if(data.length > 1 && data[data.length-2].original.format.sha1 === job_data.original.format.sha1) {
                                console.log("It's duplicate");
                                alert("It's duplicate");
                            } else {
                                console.log("-- New Insert mode --");
                                this.newInsertData(job_data, data, "1");
                            }

                        });
                    }
                });
            }
        });
    };

    newInsertData = (job_data, insert_old, insert_mode) => {
        if (job_data.line.content_type) {

            // Build data for insert app
            let date = job_data.file_name.match(/\d{4}-\d{2}-\d{2}/)[0];

            // Make insert metadata
            let insert_data = {};
            insert_data.insert_id = insert_old.length > 0 ? insert_old[0].insert_id : "i"+moment().format('X');
            insert_data.line = job_data.line;
            insert_data.line.mime_type = "video/mp4";
            insert_data.content_type = getDCT(job_data.line.content_type);
            insert_data.date = date;
            insert_data.file_name = job_data.file_name;
            insert_data.extension = "mp4";
            insert_data.insert_name = `${job_data.file_name}.${insert_data.extension}`;

            // In InsertApp upload_filename use for filename gen in OldWF
            insert_data.line.upload_filename = insert_data.insert_name;
            insert_data.insert_type = insert_mode;
            insert_data.language = job_data.line.language;
            insert_data.send_id = job_data.aricha_id;
            insert_data.send_uid = insert_mode === "3" ? insert_old[0].line.uid : "";
            insert_data.upload_type = "aricha";
            insert_data.sha1 = job_data.original.format.sha1;
            insert_data.size = parseInt(job_data.original.format.size, 10);
            this.setState({metadata:{...insert_data}, insert_button: false});
        } else {
            console.log("Content Type not known, rename must be done");
        }
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openInsert = () => {
        this.setState({insert_open: true});
    };

    onInsert = (data) => {
        console.log(":: Got insert data: ", data);
        this.setState({insert_open: false});
        this.setMeta(data);
    };

    setMeta = (insert_data) => {
        let {job_data} = this.state;
        job_data.parent = {insert_id: insert_data.insert_id, name: insert_data.line.send_name};
        job_data.line.uid = insert_data.line.uid;
        job_data.line.mime_type = "video/mp4";
        job_data.wfstatus.wfsend = true;
        if(insert_data.insert_type !== "1") {
            job_data.wfstatus.fixed = true;
        }
        this.setState({inserting: true, insert_button: true });
        insert_data.send_id = job_data.aricha_id;

        // Now we put metadata to mdb on backend
        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_data, (cb) => {
            console.log(":: ArichaApp - workflow respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({job_data, inserting: false, send_button: false, kmedia_option: true}), 2000);
                putData(`${WFDB_BACKEND}/aricha/${job_data.aricha_id}`, job_data, (cb) => {
                    console.log(":: PUT Respond: ",cb);
                    this.selectJob(job_data);
                });
                alert("Insert successful :)");
            } else {
                alert("Something gone wrong :(");
                this.setState({ inserting: false, insert_button: false});
            }
        });
    };

    renameFile = (newline) => {
        console.log(":: Cit callback: ", newline);
        let {job_data} = this.state;
        let newfile_name = newline.final_name;
        let oldfile_name = job_data.file_name;
        let opath = `/backup/aricha/${newfile_name}_${job_data.aricha_id}o.mp4`;
        job_data.line = {...newline};
        job_data.parent = {...{file_name: oldfile_name}};
        //job_data.line.title = this.state.tags[newline.pattern] || "";
        job_data.original.format.filename = opath;
        job_data.file_name = newfile_name;
        job_data.wfstatus.renamed = true;

        // If rename done after send we need to do insert
        if(job_data.wfstatus.wfsend) {
            job_data.wfstatus.wfsend = false;
        }
        console.log(":: Old Meta: ", this.state.job_data+" :: New Meta: ",job_data);
        this.setState({upload_filename: oldfile_name, cit_open: false, insert_button: true, renaming: true});
        putData(`${WFSRV_BACKEND}/workflow/rename`, job_data, (cb) => {
            console.log(":: Ingest - rename respond: ",cb);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({renaming: false, insert_button: false}), 2000);
                this.selectJob(job_data);
            } else {
                setTimeout(() => this.setState({renaming: false, disabled: job_data.wfstatus.wfsend}), 2000);
            }
        });
    };

    openCit = () => {
        this.setState({cit_open: true});
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
        putData(`${WFSRV_BACKEND}/workflow/send_aricha`, job_data, (cb) => {
            console.log(":: Aricha - send respond: ",cb);
            // While polling done it does not necessary
            //this.selectJob(job_data);
            if(cb.status === "ok") {
                setTimeout(() => this.setState({sending: false, disabled: false}), 2000);
            } else {
                alert("Something goes wrong!");
            }
        });

    };

    setJobName = (job_name) => {
        console.log(":: Job Name: ", job_name);
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

    render() {

        const {job_data, source, renaming, rename_button, cit_open, inserting, insert_button, insert_open,
            filedata, metadata, special, send_button, sending, job_name, doers} = this.state;

        const send_options = [
            { key: 'kmedia', text: 'Kmedia', value: 'kmedia', disabled: !insert_button },
            { key: 'youtube', text: 'Youtube', value: 'youtube' },
            { key: 'metus', text: 'Metus', value: 'metus' },
            { key: 'Backup', text: 'Backup', value: 'backup' },
        ];

        let v = (<Icon name='checkmark'/>);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);

        let jobs = this.state.jobs.map((data) => {
            const {backup,kmedia,metus,youtube,removed,wfsend,censored,checked,fixed,locked} = data.wfstatus;
            let id = data.job_id;
            let ready = true;
            let name = ready ? data.job_name : <div>{l}&nbsp;&nbsp;&nbsp;{data.job_name}</div>;
            let time = moment.unix(id.substr(1)).format("HH:mm:ss") || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked}
                    className={active} key={id} onClick={() => this.selectJob(data)}>
                    <Table.Cell>{censored ? c : ""}{fixed ? f : ""}{locked ? d : ""}{name}</Table.Cell>
                    <Table.Cell>{time}</Table.Cell>
                    <Table.Cell negative={!backup}>{backup ? v : x}</Table.Cell>
                    <Table.Cell negative={!kmedia}>{kmedia ? v : x}</Table.Cell>
                    <Table.Cell negative={!youtube}>{youtube ? v : x}</Table.Cell>
                    <Table.Cell negative={!metus}>{metus ? v : x}</Table.Cell>
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
                                <Modal { ...this.props }
                                       trigger={<Button color='teal' icon='archive'
                                                        loading={inserting}
                                                        disabled={insert_button}
                                                        onClick={this.openInsert} />}
                                       closeOnDimmerClick={true}
                                       closeIcon={true}
                                       onClose={this.onCancel}
                                       open={insert_open}
                                       size="large"
                                       mountNode={document.getElementById("ltr-modal-mount")}>
                                    <InsertApp filedata={filedata} metadata={metadata} onComplete={this.onInsert} user={this.props.user} />
                                </Modal>
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
                                        disabled={send_button}
                                        onClick={this.sendFile} loading={sending} />
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table">
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell>File Name</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Time</Table.HeaderCell>
                            <Table.HeaderCell width={1}>BA</Table.HeaderCell>
                            <Table.HeaderCell width={1}>KM</Table.HeaderCell>
                            <Table.HeaderCell width={1}>YT</Table.HeaderCell>
                            <Table.HeaderCell width={1}>ME</Table.HeaderCell>
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