import React, {Component} from 'react'
import {JOB_STATUS, MQTT_ROOT} from "../../shared/consts";
import {getData, putData, WFDB_BACKEND, newJobMeta, postData, getToken} from '../../shared/tools';
import {Menu, Segment, Label, Icon, Table, Loader, Button, Message, Dropdown, Popup, TextArea, Input} from 'semantic-ui-react'
import mqtt from "../../shared/mqtt";
import JobEdit from "./JobEdit";

class JobsAdmin extends Component {

    state = {
        active: null,
        cit_open: false,
        doers: [],
        insert_open: false,
        insert_button: true,
        inserting: false,
        file_name: "",
        job_name: "",
        jobs: [],
        job_data: null,
        job_files: [],
        filedata: {},
        kmedia_option: false,
        metadata: {},
        topic: null,
        renaming: false,
        rename_button: false,
        send_button: true,
        sending: false,
        special: "censored",
        source: null,
        note_area: "",
        open_edit: false,
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = MQTT_ROOT + '/service/jobs/state';
        const local = true;
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "jobs") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({jobs: message});
    };

    selectJob = (job_data) => {
        console.log(":: ArichaJobs - selected job: ", job_data);
        const {job_id, job_name, file_name, parent} = job_data;
        this.getJobFiles(job_data.job_id);
        this.setState({job_data, job_name, file_name, active: job_id, doers: parent.doers, open_edit: true});
    };

    getJobFiles = (job_id) => {
        const path = `cloud/kv?wid=${job_id}&type=job`
        getData(path, job_files => {
            console.log("getJobFiles :: ", job_files);
            this.setState({job_files})
        });
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openCit = () => {
        let {job_data} = this.state;
        job_data.line = {manual_name: job_data.file_name};
        this.setState({job_data, cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    changeStatus = (id, name, status) => {
        console.log(":: changeStatus - set: ", id, name, status);
        fetch(`${WFDB_BACKEND}/jobs/${id}/wfstatus/${name}?value=${status}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    clearSelection = () => {
        this.setState({active: null, doers: [], job_name: "", job_data: {}, open_edit: false})
    }

    addNote = (job_data) => {
        const {note_area} = this.state;
        const {name} = this.props.user;
        const date = new Date().toLocaleString('sv');
        let {product} = job_data;
        product.notes.push({name,date,message: note_area});
        postData(`${WFDB_BACKEND}/jobs/${job_data.job_id}/product`, product, (cb) => {
            console.log(":: Post notes in WFDB: ",cb);
            job_data.product = product;
            this.setState({note_area: "", job_data});
        });
    };

    delNote = (job_data,i) => {
        let {product} = job_data;
        product.notes.splice(i, 1);
        postData(`${WFDB_BACKEND}/jobs/${job_data.job_id}/product`, product, (cb) => {
            console.log(":: Post notes in WFDB: ",cb);
            job_data.product = product;
            this.setState({job_data});
        });
    };

    render() {

        const {job_data, job_name, doers, active} = this.state;
        const {users} = this.props;

        const send_options = [
            {key: 'Censor', text: 'Censor', value: 'censored'},
            {key: 'ToFix', text: 'ToFix', value: 'fix_req'},
            {key: 'Fixed', text: 'Fixed', value: 'fixed'},
            {key: 'Checked', text: 'Checked', value: 'checked'},
            {key: 'Aricha', text: 'Aricha', value: 'aricha'},
            {key: 'Buffer', text: 'Buffer', value: 'buffer'},
        ];

        let v = (<Icon name='checkmark' color='green' />);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let p = (<Icon color='blue' name='cogs'/>);

        let jobs = this.state.jobs.map((data) => {
            const {date, job_name, product, parent, wfstatus, note_area} = data;
            const {aricha,removed,wfsend,censored,checked,fixed,fix_req,post_req,posted,sub_req,subed,locked} = wfstatus;
            let notes = product ? product.notes : [];
            let subtitles = product && product.subtitle ? product.subtitle.url : null;
            const editor = users.find(u => u.user_id === parent.doers[0]);
            const {firstName, lastName, email} = editor;
            let notes_list = notes.map((note,i) => {
                const {message,name,date} = note;
                let h = (<div><b>{name}</b><i style={{color: 'grey'}}> @ {date}</i></div>)
                return  (
                    <Message key={i} warning className='note_message' attached icon='copyright'
                             header={h} onDismiss={() => this.delNote(data,i)}
                             content={message} />
                )
            });
            let id = data.job_id;
            let ready = true;
            let title = ready ? job_name : <div>{l}&nbsp;&nbsp;&nbsp;{job_name}</div>;
            //let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
            if(removed) return false;
            let rowcolor = censored && !checked;
            let active = this.state.active === id ? 'active' : 'admin_raw';
            return (
                <Table.Row
                    negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked}
                    className={active} key={id} >
                    <Table.Cell>
                        <Popup mountNode={document.getElementById("ltr-modal-mount")}
                               trigger={<Icon name='mail' size='large' color={notes.length > 0 ? 'red' : 'grey'} />} flowing hoverable>
                            {notes_list}
                            <Message warning attached>
                                <TextArea value={note_area} className='note_area'
                                          rows={5} placeholder='Notes...'
                                          onChange={(e,{value}) => this.setState({note_area: value})} />
                            </Message>
                            <Button attached='bottom' positive
                                    onClick={() => this.addNote(data)} >Add note</Button>
                        </Popup>
                    </Table.Cell>
                    {/*<Table.Cell>*/}
                    {/*    {subtitles ? <Modal trigger={<Icon name='wordpress forms' size='large' color={subtitles ? 'green' : 'grey'} />}*/}
                    {/*           mountNode={document.getElementById("ltr-modal-mount")} >*/}
                    {/*        <FileViewer filePath={`${WFSRV_BACKEND}${subtitles}`} fileType='docx' />*/}
                    {/*    </Modal> : <Icon name='file' size='large' color={subtitles ? 'green' : 'grey'} />}*/}
                    {/*</Table.Cell>*/}
                    <Table.Cell onClick={() => this.selectJob(data)}>{locked ? d : ""}{title}</Table.Cell>
                    {/*<Table.Cell>{firstName + " " + lastName + " (" + email + ")"}</Table.Cell>*/}
                    <Table.Cell>{date}</Table.Cell>
                    {JOB_STATUS.map(s => {
                        const st = wfstatus[s.status] ? wfstatus[s.status] : false;
                        return (
                            <Popup trigger={<Table.Cell negative={!st}>{st ? v : x}</Table.Cell>} flowing hoverable>
                                <p>{s.desc}</p>
                                <Button.Group>
                                    <Button onClick={() => this.changeStatus(id, s.status, true)} icon>{v}</Button>
                                    <Button onClick={() => this.changeStatus(id, s.status, false)} icon>{x}</Button>
                                </Button.Group>
                        </Popup>
                        )
                    })}
                </Table.Row>
            )
        });

        return (
            <Segment textAlign='center' className="ingest_segment" basic>
                <JobEdit
                    {...this.state}
                    setProps={(props) => this.setState({...props})}
                    closeModal={this.clearSelection}
                    users={users} />
                <Message>
                    <Button fluid positive onClick={() => this.setState({open_edit: true})}>Add New Job</Button>
                </Message>
                <Table selectable compact='very' basic structured className="ingest_table" fixed>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell width={1}>Msg</Table.HeaderCell>
                            {/*<Table.HeaderCell width={1}>Sub</Table.HeaderCell>*/}
                            <Table.HeaderCell width={7}>Title</Table.HeaderCell>
                            {/*<Table.HeaderCell width={4}>Editor</Table.HeaderCell>*/}
                            <Table.HeaderCell width={2}>Date</Table.HeaderCell>
                            {JOB_STATUS.map(s => {
                                return (<Table.HeaderCell width={1}>{s.name}</Table.HeaderCell>)
                            })}
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

export default JobsAdmin;
