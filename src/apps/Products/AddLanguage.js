import React, {Component} from 'react'
import {postData, WFDB_BACKEND} from '../../shared/tools';
import {Segment, Button, Form} from 'semantic-ui-react'
import {dep_options} from "../../shared/consts";

class AddLanguage extends Component {

    state = {
        name: "",
        description: "",
    };

    setProductName = (name) => {
        this.setState({name});
    };

    setProductDescription = (description) => {
        this.setState({description});
    };

    addProduct = () => {
        const {name, description} = this.state;
        const {product_id, language} = this.props;
        const data = {name, description};
        postData(`${WFDB_BACKEND}/products/${product_id}/i18n/${language}`, data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.setState({name: "", description: ""});
            this.props.getProducts(language);
        });
    };


    setProduct = (product_id) => {
        console.log(product_id)
        this.setState({product_id});
        this.getProductFiles(product_id)
    }

    render() {

        const {name, description} = this.state;

        return (
            <Segment padded basic>
                <Form>
                    <Form.Select
                        fluid
                        label='Language'
                        options={dep_options}
                        placeholder='Choose Language'
                    />
                    <Form.Input fluid label='Title' placeholder='Title' onChange={e => this.setProductName(e.target.value)} value={name} />
                    <Form.TextArea label='Description' placeholder='Description...' onChange={e => this.setProductDescription(e.target.value)} value={description} />
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <Button positive={true}
                                    disabled={name === ""}
                                    onClick={this.addProduct}>Add Language
                            </Button>
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Segment>
        );
    }
}

export default AddLanguage;
