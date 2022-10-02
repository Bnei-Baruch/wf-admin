import React, {Component} from 'react'
import {JOB_STATUS} from "../../shared/consts";
import {getData, putData, WFDB_BACKEND, newJobMeta, postData, getToken} from '../../shared/tools';
import {
    Menu,
    Modal,
    Grid,
    Icon,
    Table,
    Loader,
    Button,
    Message,
    Dropdown,
    Popup,
    TextArea,
    Input,
    Header
} from 'semantic-ui-react'

class JobsAdmin extends Component {

    state = {
        note_area: "",
    };

    componentDidMount() {
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

    newJob = () => {
        const {job_name,doers} = this.props;
        let job_meta = newJobMeta(job_name);
        if(doers)
            job_meta.parent.doers = doers;
        console.log(" :: New Meta: ", job_meta);
        putData(`${WFDB_BACKEND}/jobs/${job_meta.job_id}`, job_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.props.closeModal();
        });
    };

    editJob = () => {
        const {job_name, doers, job_data} = this.props;
        job_data.job_name = job_name;
        if(doers.length !== job_data.parent.doers.length)
            job_data.parent.doers = doers;
        console.log(" :: Edit Meta: ", job_data);
        putData(`${WFDB_BACKEND}/jobs/${job_data.job_id}`, job_data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.props.closeModal();
        });
    };

    setRemoved = () => {
        let {job_data} = this.props;
        console.log(":: Censor - set removed: ", job_data);
        fetch(`${WFDB_BACKEND}/jobs/${job_data.job_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        this.props.closeModal();
    };

    changeStatus = (id, name, status) => {
        console.log(":: changeStatus - set: ", id, name, status);
        fetch(`${WFDB_BACKEND}/jobs/${id}/wfstatus/${name}?value=${status}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    setJobName = (job_name) => {
        this.props.setProps({job_name});
    };

    addDoer = (doers) => {
        this.props.setProps({doers});
    };

    openJob = () => {
        //TODO: Open modal with job files and options
    };

    newUnit = () => {
        //TODO: Make new unit
    };

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

        const {doers, active, users, open_edit, job_data, job_name} = this.props;

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

        // let jobs = this.state.jobs.map((data) => {
        //     const {date, job_name, product, parent, wfstatus, note_area} = data;
        //     const {aricha,removed,wfsend,censored,checked,fixed,fix_req,post_req,posted,sub_req,subed,locked} = wfstatus;
        //     let notes = product ? product.notes : [];
        //     let subtitles = product && product.subtitle ? product.subtitle.url : null;
        //     const editor = users.find(u => u.user_id === parent.doers[0]);
        //     const {firstName, lastName, email} = editor;
        //     let notes_list = notes.map((note,i) => {
        //         const {message,name,date} = note;
        //         let h = (<div><b>{name}</b><i style={{color: 'grey'}}> @ {date}</i></div>)
        //         return  (
        //             <Message key={i} warning className='note_message' attached icon='copyright'
        //                      header={h} onDismiss={() => this.delNote(data,i)}
        //                      content={message} />
        //         )
        //     });
        //     let id = data.job_id;
        //     let ready = true;
        //     let title = ready ? job_name : <div>{l}&nbsp;&nbsp;&nbsp;{job_name}</div>;
        //     //let time = new Date(id.substr(1) * 1000).toLocaleString('sv').slice(11,19) || "";
        //     if(removed) return false;
        //     let rowcolor = censored && !checked;
        //     let active = this.state.active === id ? 'active' : 'admin_raw';
        //     return (
        //         <Table.Row
        //             negative={rowcolor} positive={wfsend} warning={!ready} disabled={!ready || locked}
        //             className={active} key={id} >
        //             <Table.Cell>
        //                 <Popup mountNode={document.getElementById("ltr-modal-mount")}
        //                        trigger={<Icon name='mail' size='large' color={notes.length > 0 ? 'red' : 'grey'} />} flowing hoverable>
        //                     {notes_list}
        //                     <Message warning attached>
        //                         <TextArea value={note_area} className='note_area'
        //                                   rows={5} placeholder='Notes...'
        //                                   onChange={(e,{value}) => this.setState({note_area: value})} />
        //                     </Message>
        //                     <Button attached='bottom' positive
        //                             onClick={() => this.addNote(data)} >Add note</Button>
        //                 </Popup>
        //             </Table.Cell>
        //             {/*<Table.Cell>*/}
        //             {/*    {subtitles ? <Modal trigger={<Icon name='wordpress forms' size='large' color={subtitles ? 'green' : 'grey'} />}*/}
        //             {/*           mountNode={document.getElementById("ltr-modal-mount")} >*/}
        //             {/*        <FileViewer filePath={`${WFSRV_BACKEND}${subtitles}`} fileType='docx' />*/}
        //             {/*    </Modal> : <Icon name='file' size='large' color={subtitles ? 'green' : 'grey'} />}*/}
        //             {/*</Table.Cell>*/}
        //             <Table.Cell onClick={() => this.selectJob(data)}>{locked ? d : ""}{title}</Table.Cell>
        //             <Table.Cell>{firstName + " " + lastName + " (" + email + ")"}</Table.Cell>
        //             <Table.Cell>{date}</Table.Cell>
        //             {JOB_STATUS.map(s => {
        //                 const st = wfstatus[s.status] ? wfstatus[s.status] : false;
        //                 return (
        //                     <Popup trigger={<Table.Cell negative={!st}>{st ? v : x}</Table.Cell>} flowing hoverable>
        //                         <p>{s.desc}</p>
        //                         <Button.Group>
        //                             <Button onClick={() => this.changeStatus(id, s.status, true)} icon>{v}</Button>
        //                             <Button onClick={() => this.changeStatus(id, s.status, false)} icon>{x}</Button>
        //                         </Button.Group>
        //                     </Popup>
        //                 )
        //             })}
        //         </Table.Row>
        //     )
        // });

        const doers_list = users.map( u => {
            const {user_id, firstName, lastName, email} = u;
            return ({key: user_id, text: firstName + " " + lastName + " (" + email + ")", value: user_id})
        });

        return (
            <Modal open={open_edit} onClose={() => this.props.closeModal()} size='large' >
                <Modal.Header>
                    <Header textAlign="center" >{job_data ? job_data.job_name : ""}</Header>
                </Modal.Header>
                <Modal.Content>
                    {/*<Modal.Description>*/}
                        <Grid columns='equal'>
                            <Grid.Row>
                                <Grid.Column>
                                    <Input className="job_input"
                                           placeholder="Project name.."
                                           onChange={e => this.setJobName(e.target.value)}
                                           value={job_name} />
                                </Grid.Column>
                                <Grid.Column>

                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Dropdown
                                        placeholder="Add doer.."
                                        selection
                                        multiple
                                        options={doers_list}
                                        value={doers}
                                        onChange={(e, {value}) => this.addDoer(value)} />
                                </Grid.Column>
                            </Grid.Row>
                            <Grid.Row>
                                <Grid.Column>
                                    <Table selectable compact='very' basic structured className="ingest_table" fixed>
                                        <Table.Header>
                                            <Table.Row className='table_header'>
                                                {JOB_STATUS.map(s => {
                                                    return (<Table.HeaderCell width={1}>{s.desc}</Table.HeaderCell>)
                                                })}
                                            </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                            {JOB_STATUS.map(s => {
                                                const st = job_data?.wfstatus ? job_data.wfstatus[s.status] : false;
                                                return (
                                                    <Popup trigger={<Table.Cell negative={!st}>{st ? v : x}</Table.Cell>} flowing hoverable>
                                                        <p>{s.desc}</p>
                                                        <Button.Group>
                                                            <Button onClick={() => this.changeStatus(job_data.job_id, s.status, true)} icon>{v}</Button>
                                                            <Button onClick={() => this.changeStatus(job_data.job_id, s.status, false)} icon>{x}</Button>
                                                        </Button.Group>
                                                    </Popup>
                                                )
                                            })}
                                        </Table.Body>
                                    </Table>
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    {/*<Button fluid disabled={!active} onClick={this.clearSelection}>Clear</Button>*/}
                    {/*</Modal.Description>*/}
                </Modal.Content>
                <Modal.Actions>
                    <Menu secondary >
                        <Menu.Item>
                            <Button color={active ? "blue" : "green"}
                                    disabled={job_name === "" || doers.length === 0}
                                    onClick={active ? this.editJob : this.newJob}>{active ? "Save" : "New"} Job
                            </Button>
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Button negative={true}
                                        disabled={job_data?.job_id === undefined}
                                        onClick={this.setRemoved}>Remove Job
                                </Button>
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default JobsAdmin;
