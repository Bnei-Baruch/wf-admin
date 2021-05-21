import React, {Component} from 'react'
import {putData, WFDB_BACKEND, newProductMeta} from '../../shared/tools';
import {Menu, Segment, Label, Button, Input, Dropdown} from 'semantic-ui-react'
import {dep_options} from "../../shared/consts";

class ProductsAdmin extends Component {

    state = {
        product_name: "",
        language: "heb",
        locale: "he",
        metadata: {},
        input_id: "",
    };

    componentDidMount() {
        //this.getProducts(this.state.language);
    };

    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    setProductLang = (language) => {
        this.setState({language});
        //this.getProducts(language);
    }

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    newProduct = () => {
        const {product_name, language} = this.state;
        let product_meta = newProductMeta(product_name, language);
        console.log(" :: New Meta: ", product_meta);
        putData(`${WFDB_BACKEND}/products/${product_meta.product_id}`, product_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
        });
        this.setState({product_name: ""});
    };


    setProduct = (product_id) => {
        console.log(product_id)
        this.setState({product_id});
        this.getProductFiles(product_id)
    }

    render() {

        const {product_data, product_name, language} = this.state;

        return (
            <Segment textAlign='left' className="ingest_segment" color='red' raised>
                <Label attached='top' className="trimmed_label">
                    {product_data?.product_name ? product_data.product_name : ""}
                </Label>
                <Menu secondary >
                    <Menu.Item>
                        <Dropdown
                            error={!language}
                            placeholder="Language:"
                            selection
                            options={dep_options}
                            language={language}
                            onChange={(e,{value}) => this.setProductLang(value)}
                            value={language} >
                        </Dropdown>
                    </Menu.Item>
                    <Menu.Item>
                        <Input size='large'
                               placeholder="Product name.."
                               onChange={e => this.setProductName(e.target.value)}
                               value={product_name} />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button positive={true}
                                disabled={product_name === ""}
                                onClick={this.newProduct}>New Product
                        </Button>
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </Segment>
        );
    }
}

export default ProductsAdmin;
