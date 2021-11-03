import React, {Component, Fragment} from 'react'
import ProductsManager from "./ProductsManager";
import FilesView from "./FilesView";
import {kc} from "../../components/UserManager";
import {Tab} from "semantic-ui-react";

class ProductsApp extends Component {

    state = {
        tab: "metadata",
        user: {
            name: this.props.user.name,
            email: this.props.user.email,
            rooter: kc.hasRealmRole("wf_products_root"),
            adminer: kc.hasRealmRole("wf_products_admin"),
            archer: kc.hasRealmRole("wf_products_archive"),
            viewer: kc.hasRealmRole("wf_products_viewer"),
        }
    };

    componentDidMount() {
        let files_product = !kc.hasRealmRole("wf_products_root");
        this.setState({files_product});
    };

    selectTab = (e, data) => {
        let tab = data.panes[data.activeIndex].menuItem.key;
        console.log(" :: Tab selected: ",tab);
        this.setState({tab});
    };

    render() {
        const {files_product} = this.state;

        const panes = [
            { menuItem: { key: 'metadata', content: 'Metadata', disabled: false},
                render: () => <Tab.Pane attached ><ProductsManager {...this.state} /></Tab.Pane> },
            { menuItem: { key: 'files', content: 'Files', disabled: files_product },
                render: () => <Tab.Pane ><FilesView {...this.state} /></Tab.Pane> },
        ]

        return (
            <Fragment>
                <Tab menu={{ pointing: true }} panes={panes} onTabChange={this.selectTab} />
            </Fragment>
        );
    }
}

export default ProductsApp;
