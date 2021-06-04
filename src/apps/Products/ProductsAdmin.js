import React, {Component} from 'react'
import {putData, WFDB_BACKEND, newProductMeta, WFSRV_BACKEND, postData} from '../../shared/tools';
import {Menu, Segment, Label, Button, Input, Dropdown, Modal} from 'semantic-ui-react'
import {dep_options} from "../../shared/consts";
import CIT from "../CIT/CIT";
import MDB from "./MDB";

class ProductsAdmin extends Component {

    state = {
        cit_open: false,
        product_name: "",
        product_description: "",
        language: "heb",
        locale: "he",
        metadata: {language: "heb"},
        mdb_open: false,
        unit: null
    };

    setProductLang = (language) => {
        this.setState({language});
    }

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    setProductDescription = (product_description) => {
        this.setState({product_description});
    };

    newProduct = () => {
        const {product_name, product_description, language, metadata, unit} = this.state;
        let product_meta = newProductMeta(product_name, product_description, language);
        product_meta.line = metadata;
        product_meta.pattern = metadata.pattern;
        product_meta.parent = {
            mdb_uid: unit.uid,
            mdb_id: unit.id,
            wf_id: unit.properties?.workflow_id,
            capture_date: unit.properties?.capture_date,
            film_date: unit.properties?.film_date,
        };
        product_meta.parent.mdb_id = unit.id;
        product_meta.parent.wf_id = unit.properties?.workflow_id;
        console.log(" :: New Meta: ", product_meta);
        putData(`${WFDB_BACKEND}/products/${product_meta.product_id}`, product_meta, (cb) => {
            console.log(":: PUT Respond: ",cb);
        });
        this.setState({product_name: ""});
    };

    openCit = () => {
        this.setState({cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false});
    };

    setMetadata = (metadata) => {
        console.log(":: Cit callback: ", metadata);
        this.setState({metadata, language: metadata.language, cit_open: false});
    };

    openMdb = () => {
        this.setState({mdb_open: true});
    };

    onMdbSelect = (data) => {
        console.log(":: Got MDB data: ", data);
        this.setState({mdb_open: false, unit: data});
    };

    onCancel = () => {
        this.setState({cit_open: false, mdb_open: false});
    };

    render() {

        const {product_name, product_description, language, cit_open, metadata, mdb_open} = this.state;

        return (
            <Segment textAlign='left' className="ingest_segment" color='red' raised>
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
                    <Menu.Item>
                        <Input size='large'
                               placeholder="Product description.."
                               onChange={e => this.setProductDescription(e.target.value)}
                               value={product_description} />
                    </Menu.Item>
                    <Menu.Item>
                        <Modal closeOnDimmerClick={false}
                               trigger={<Button color='blue' icon='tags' onClick={this.openCit} />}
                               onClose={this.onCancel}
                               open={cit_open}
                               closeIcon="close"
                               mountNode={document.getElementById("cit-modal-mount")}>
                            <Modal.Content>
                                <CIT metadata={metadata} onCancel={this.onCancel} onComplete={(x) => this.setMetadata(x)}/>
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                    <Menu.Item>
                        <Modal closeOnDimmerClick={false}
                               trigger={<Button color='teal' icon='archive' onClick={this.openMdb}/>}
                               onClose={this.onCancel}
                               open={mdb_open}
                               size='large'
                               closeIcon="close">
                            <Modal.Content>
                                <MDB metadata={metadata} user={this.props.user} onCancel={this.onCancel} onComplete={(x) => this.onMdbSelect(x)}/>
                            </Modal.Content>
                        </Modal>
                    </Menu.Item>
                    <Menu.Menu position='right'>
                    <Menu.Item>
                        <Button positive={true}
                                disabled={product_name === ""}
                                onClick={this.newProduct}>New Product
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <Button negative={true}
                                disabled
                                onClick={this.removeProduct}>Delete Product
                        </Button>
                    </Menu.Item>
                    </Menu.Menu>
                </Menu>
            </Segment>
        );
    }
}

export default ProductsAdmin;
