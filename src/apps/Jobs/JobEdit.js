import React, {Component} from 'react'
import {JOB_STATUS} from "../../shared/consts";
import {putData, WFDB_BACKEND, newJobMeta, postData, getToken} from '../../shared/tools';
import {Menu, Modal, Icon, Table, Loader, Button, Popup, Form, Header} from 'semantic-ui-react'

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
        const {file_name, job_name, doers} = this.props;
        let job_meta = newJobMeta(job_name, file_name);
        if(doers)
            job_meta.parent.doers = doers;
        console.log(" :: New Meta: ", job_meta);
        putData(`${WFDB_BACKEND}/jobs/${job_meta.job_id}`, job_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.props.closeModal();
        });
    };

    editJob = () => {
        const {file_name, job_name, doers, job_data} = this.props;
        job_data.job_name = job_name;
        job_data.file_name = file_name;
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
        const {job_data} = this.props;
        console.log(":: changeStatus - set: ", id, name, status);
        job_data.wfstatus[name] = status;
        fetch(`${WFDB_BACKEND}/jobs/${id}/wfstatus/${name}?value=${status}`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        this.props.setProps({job_data});
    };

    setJobName = (job_name) => {
        this.props.setProps({job_name});
    };

    setFileName = (file_name) => {
        this.props.setProps({file_name});
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
        const {doers, active, users, open_edit, job_data, job_name, file_name} = this.props;

        let v = (<Icon name='checkmark' color='green' />);
        let x = (<Icon name='close'/>);
        let l = (<Loader size='mini' active inline />);
        let c = (<Icon name='copyright'/>);
        let f = (<Icon color='blue' name='configure'/>);
        let d = (<Icon color='blue' name='lock'/>);
        let p = (<Icon color='blue' name='cogs'/>);

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
                    <Form size='large'>
                        <Form.Group widths='equal'>
                            <Form.Input fluid label='Job name' placeholder="Job name.." required
                                        onChange={e => this.setJobName(e.target.value)}
                                        value={job_name} />
                            <Form.Input fluid label='File name' placeholder="File name.."
                                        onChange={e => this.setFileName(e.target.value)}
                                        value={file_name} />
                        </Form.Group>
                        <Form.Select placeholder="Add doer.." required
                                     label='Job doers'
                                     selection
                                     multiple
                                     options={doers_list}
                                     value={doers}
                                     onChange={(e, {value}) => this.addDoer(value)} />
                        <Form.Field
                            id='status'
                            disabled={!active}
                            control={Button}
                            content={<Table selectable compact='very' className="ingest_table" fixed>
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
                            </Table>}
                            label='Job Progress Status'
                        />
                    </Form>
                    {/*<Modal.Description>*/}
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
