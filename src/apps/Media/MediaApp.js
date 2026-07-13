import React, {Component, Fragment} from 'react'
import '../WFDB/WFDB.css';
import MediaManager from "./MediaManager";
import FilesView from "./FilesView";
import {kc} from "../../components/UserManager";
import {Tab} from "semantic-ui-react";

class MediaApp extends Component {

    state = {
        tab: "metadata",
        user: {
            name: this.props.user.name,
            email: this.props.user.email,
            rooter: kc.hasRealmRole("wf_media_root"),
            adminer: kc.hasRealmRole("wf_media_admin"),
            archer: kc.hasRealmRole("wf_media_archive"),
            viewer: kc.hasRealmRole("wf_media_viewer"),
        }
    };

    componentDidMount() {
        let files_media = !kc.hasRealmRole("wf_media");
        this.setState({files_media});
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    render() {
        const {files_media} = this.state;

        const panes = [
            { menuItem: { key: 'metadata', content: 'Metadata', disabled: false},
                render: () => <Tab.Pane attached ><MediaManager {...this.state} user={this.props.user} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files', disabled: files_media },
                render: () => <Tab.Pane ><FilesView {...this.state} user={this.props.user} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default MediaApp;
