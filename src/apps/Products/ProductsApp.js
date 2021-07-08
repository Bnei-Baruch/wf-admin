import React, {Component, Fragment} from 'react'
import ProductsManager from "./ProductsManager";

class ProductsApp extends Component {

    state = {};

    render() {

        return (
            <Fragment>
                <ProductsManager user={this.props.user} />
            </Fragment>
        );
    }
}

export default ProductsApp;
