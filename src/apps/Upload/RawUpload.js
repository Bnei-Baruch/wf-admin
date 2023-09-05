import React, { Component } from 'react';
import {Label, Progress, Message, Segment, Dropdown, Button, Icon} from 'semantic-ui-react';
import Upload from 'rc-upload';
import {getData, getToken, postData, WF_BACKEND, WFSRV_BACKEND} from "../../shared/tools";

class RawUpload extends Component {

    state = {
        jobs: [],
        job_id: "",
        job_name: "",
        index: "",
        progress: {},
        users: [],
        mail_list: []
    };

    componentDidMount() {
        getData('jobs', (jobs) => {
            console.log(":: Jobs: ", jobs)
            this.setState({jobs});
        })
        getData('users/kv', (users) => {
            console.log(" :: Users: ", users);
            this.setState({users})
        });
    };

    selectJob = (index) => {
        const {jobs, users} = this.state;
        const {job_id, job_name, parent: {doers}} = jobs[index];
        let mail_list = [];
        for(let i=0; i<doers.length; i++) {
            let user = users.find(u => u.user_id === doers[i]);
            mail_list.push(user.email)
        }
        this.setState({index, job_id, job_name,  mail_list});
    };

    notifyDoers = () => {
        const {job_name, mail_list} = this.state;
        const data = {
            subject: "Raw Materials Notification",
            body: "Job Name - " + job_name,
            to: mail_list
        }
        postData(`${WFSRV_BACKEND}/wf/notify`, data, (cb) => {
            console.log("notify respond: ", cb);
            if(cb?.result === "success") {
                alert("Notification successfully sent")
            } else {
                alert("Error sending")
            }
        });
    };

    progress = (step, file) => {
        let {progress} = this.state;
        let count = Math.round(step.percent);
        progress[file.name] = count;
        this.setState({progress});
    };

    uploadDone = (file) => {
        let {progress, job_id} = this.state;
        file.wid = job_id;
        this.props.onFileData(file);
        console.log("Upload done", file);
        delete progress[file.file_name];
        this.setState({progress});
    };

    render() {
        const {progress, jobs, index, mail_list} = this.state;

        let files_progress = Object.keys(progress).map((id) => {
            let count = progress[id];
            return (<Progress key={id} label={id} percent={count} indicating progress='percent' />)
            });

        const jobs_list = jobs.map((j,i) => {
            const {job_id, job_name} = j;
            return ({key: job_id, text: job_name, value: i})
        });

        const props = {
            action: `${WF_BACKEND}/raw/upload`,
            headers: {'Authorization': 'bearer ' + getToken()},
            type: 'drag',
            accept: '',
            multiple: true,
            beforeUpload(file) {
                console.log('beforeUpload', file);
            },
            onStart(file) {
                console.log('onStart', file);
            },
            onError(err) {
                console.log('onError', err);
            },

        };

        return (
            <Segment textAlign='center' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label">Cloud</Label>
                <Segment.Group horizontal>
                    <Segment>
                        <Dropdown
                            placeholder="Select job.."
                            error={index === ""}
                            selection
                            options={jobs_list}
                            value={index}
                            onChange={(e, {value}) => this.selectJob(value)} />
                    </Segment>
                    <Segment>
                        <Button
                            disabled={mail_list.length === 0}
                            positive icon labelPosition='right'
                            onClick={this.notifyDoers}
                        >Notify Doers<Icon name='mail' /></Button>
                    </Segment>
                </Segment.Group>
                {index !== "" ?
                    <Message>
                        <Upload
                            {...this.props}
                            {...props}
                            className="raw"
                            onSuccess={this.uploadDone}
                            onProgress={this.progress} >
                            Drop file here or click me
                        </Upload>
                        {files_progress}
                    </Message>
                    : null}

            </Segment>
        );
    }
}

export default RawUpload;
