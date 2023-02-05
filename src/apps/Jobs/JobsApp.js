import React, {Component, Fragment} from 'react'
import {getData} from "../../shared/tools";
import JobsAdmin from "./JobsAdmin";
import {kc} from "../../components/UserManager";
import {Tab} from "semantic-ui-react";
import CloudFiles from "./CloudFiles";
import '../WFDB/WFDB.css';
import UsersJob from "./UsersJob";
import BoardJob from "./BoardJob";
import JobFiles from "./JobFiles";

class JobsApp extends Component {

    state = {
        tab: "metadata",
        users: [],
        user: {
            user_id: this.props.user.sub,
            name: this.props.user.name,
            email: this.props.user.email,
            adminer: !kc.hasRealmRole("wf_jobs_admin"),
            editor: !kc.hasRealmRole("wf_jobs_editor"),
            writer: !kc.hasRealmRole("wf_jobs_writer"),
            viewer: !kc.hasRealmRole("wf_jobs_viewer"),
        }
    };

    componentDidMount() {
        this.getUsers();
    };

    getUsers = () => {
        getData('users/kv', (users) => {
            console.log(" :: Users: ", users);
            this.setState({users})
        });
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    render() {
        let {adminer, editor} = this.state.user;

        const panes = [
            { menuItem: { key: 'Home', content: 'Board', disabled: false },
                render: () => <Tab.Pane attached={true} ><BoardJob {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'jobs', content: 'Admin', disabled: adminer},
                render: () => <Tab.Pane><JobsAdmin {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files', disabled: false },
                render: () => <Tab.Pane ><CloudFiles {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'products', content: 'Products', disabled: false },
                render: () => <Tab.Pane ><JobFiles {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'users', content: 'Users', disabled: adminer },
                render: () => <Tab.Pane ><UsersJob {...this.state} getUsers={this.getUsers} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default JobsApp;
