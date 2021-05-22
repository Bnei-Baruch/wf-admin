import React, {Component} from 'react'
import {postData, WFDB_BACKEND} from '../../shared/tools';
import {Menu, Segment, Label, Button, Input} from 'semantic-ui-react'

class AddLanguage extends Component {

    state = {
        product_name: "",
        product_description: "",
    };

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    setProductDescription = (product_description) => {
        this.setState({product_description});
    };

    addProduct = () => {
        const {product_name, product_description} = this.state;
        const {product_id, language} = this.props;
        const data = {product_name, product_description};
        postData(`${WFDB_BACKEND}/products/${product_id}/i18n/${language}`, data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.setState({product_name: "", product_description: ""});
            this.props.getProducts(language);
        });
    };


    setProduct = (product_id) => {
        console.log(product_id)
        this.setState({product_id});
        this.getProductFiles(product_id)
    }

    render() {

        const {product_name, product_description} = this.state;

        return (
            <Segment textAlign='left' className="ingest_segment" color='red' raised>
                <Menu secondary >
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Item>
                        <Input size='large'
                               placeholder="Product name.."
                               onChange={e => this.setProductName(e.target.value)}
                               value={product_name} />
                    </Menu.Item>
                    <Menu.Item>
                        <Input size='large'
                               placeholder="Product description.."
                               onChange={e => this.setProductDescription(e.target.value)}
                               value={product_description} />
                    </Menu.Item>
                    <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button positive={true}
                                disabled={product_name === ""}
                                onClick={this.addProduct}>Add Language
                        </Button>
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </Segment>
        );
    }
}

export default AddLanguage;
