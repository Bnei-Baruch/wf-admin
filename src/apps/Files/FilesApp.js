import React, {Component, Fragment} from 'react'
import FilesIngest from "./FilesIngest";
import '../WFDB/WFDB.css';
import {Tab} from "semantic-ui-react";
import FilesProducts from "./FilesProducts";
import {kc} from "../../components/UserManager";

class FilesApp extends Component {

    state = {
        tab: "ingest",
    };

    componentDidMount() {
        let files_closed = !kc.hasRealmRole("wf_closed");
        let files_product = !kc.hasRealmRole("wf_files_product");
        this.setState({files_closed, files_product});
    };

    componentWillUnmount() {

    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };


    render() {
        const {user} = this.props;

        const panes = [
        { menuItem: { key: 'ingest', content: 'Ingest' },
            render: () => <Tab.Pane attached={true} ><FilesIngest user={user} /></Tab.Pane> },
        { menuItem: { key: 'products', content: 'Products' },
            render: () => <Tab.Pane attached={false} ><FilesProducts user={user} /></Tab.Pane> },
            ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default FilesApp;
