import React, {Component, Fragment} from 'react'
import FilesIngest from "./FilesIngest";
import '../WFDB/WFDB.css';
import {Tab} from "semantic-ui-react";
import FilesProducts from "./FilesProducts";
import {kc} from "../../components/UserManager";
import FilesLc from "./FilesLc";
import FilesVladek from "./FilesVladek";

class FilesApp extends Component {

    state = {
        tab: "ingest",
        files_closed: false,
        files_product: false,
        files_lc: false,
        files_vladek: false,
        wf_panes: []
    };

    componentDidMount() {
        const {user} = this.props;
        let files_closed = !kc.hasRealmRole("wf_closed");
        let files_product = !kc.hasRealmRole("wf_files_product");
        let files_lc = !kc.hasRealmRole("wf_files_lc");
        let files_vladek = !kc.hasRealmRole("wf_files_vladek");
        const panes = [
            { menuItem: { key: 'ingest', content: 'Ingest', disabled: files_closed},
                render: () => <Tab.Pane><FilesIngest user={user} /></Tab.Pane> },
            { menuItem: { key: 'products', content: 'Products', disabled: files_product },
                render: () => <Tab.Pane><FilesProducts user={user} /></Tab.Pane> },
            { menuItem: { key: 'lc', content: 'LC', disabled: files_lc },
                render: () => <Tab.Pane><FilesLc user={user} /></Tab.Pane> },
            { menuItem: { key: 'vladek', content: 'Vladek', disabled: files_vladek },
                render: () => <Tab.Pane><FilesVladek user={user} /></Tab.Pane> },
        ]
        const wf_panes = panes.filter(p => !p.menuItem.disabled);
        this.setState({files_closed, files_product, files_lc, files_vladek, wf_panes});
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };


    render() {
        const {wf_panes} = this.state;

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={wf_panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default FilesApp;
