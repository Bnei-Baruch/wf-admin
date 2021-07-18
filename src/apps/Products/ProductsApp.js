import React, {Component, Fragment} from 'react'
import ProductsManager from "./ProductsManager";
import {kc} from "../../components/UserManager";

class ProductsApp extends Component {

    state = {
        user: {
            name: this.props.user,
            email: this.props.user,
            rooter: kc.hasRealmRole("wf_products_root"),
            adminer: kc.hasRealmRole("wf_products_admin"),
            archer: kc.hasRealmRole("wf_products_archive"),
            viewer: kc.hasRealmRole("wf_products_viewer"),
        }
    };

    render() {

        return (
            <Fragment>
                <ProductsManager {...this.state} />
            </Fragment>
        );
    }
}

export default ProductsApp;
