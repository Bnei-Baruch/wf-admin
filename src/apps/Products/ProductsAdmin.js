import React, {Component} from 'react'
import {
    putData,
    WFDB_BACKEND,
    newProductMeta,
    getUnit,
    MDB_LOCAL_URL,
    MDB_EXTERNAL_URL
} from '../../shared/tools';
import {Segment, Button, Modal, Form, FormField} from 'semantic-ui-react'
import {dep_options, WF_LANGUAGES} from "../../shared/consts";
import CIT from "../CIT/CIT";
import MDB from "../../components/MDB";
import {JSONToHTMLTable} from "@kevincobain2000/json-to-html-table";

class ProductsAdmin extends Component {

    state = {
        cit_open: false,
        product_name: "",
        product_description: "",
        language: "heb",
        locale: "he",
        metadata: {language: "heb", content_type: "CLIP", has_translation: false, lecturer: "rav", film_date: "", capture_date: ""},
        mdb_open: false,
        unit: null,
        parent: null,
        show_info: false
    };

    checkEdit = () => {
        if(this.props.product) {
            const {product_name, language, i18n, line, parent} = this.props.product;
            const {[WF_LANGUAGES[language]]: {description}} = i18n;
            const local = window.location.hostname !== "wfsrv.kli.one";
            const url = local ? MDB_LOCAL_URL : MDB_EXTERNAL_URL;
            getUnit(`${url}/${parent.mdb_id}/`, (unit) => {
                this.setState({product_name, language, product_description: description, metadata: line, parent, unit});
            })
        } else {
            this.setState({product_name: "", language: "heb", product_description: "",
                metadata: {language: "heb", content_type: "CLIP", has_translation: false, lecturer: "rav"}, parent: null, unit: null});
        }
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
        product_meta.film_date = metadata.film_date;
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
        this.saveProduct(product_meta);
    };

    editProduct = () => {
        let {product_name, language, metadata, unit, parent} = this.state;
        let {product} = this.props;
        let line = metadata;
        if(unit) {
            parent = {...parent,
                mdb_uid: unit.uid,
                mdb_id: unit.id,
                wf_id: unit.properties?.workflow_id,
                capture_date: unit.properties?.capture_date,
                film_date: unit.properties?.film_date,
            }
        }
        product = {...product, product_name, language, parent, line, film_date: line.film_date,
            i18n: {[WF_LANGUAGES[language]]: {name: "", description: ""}}
        };
        this.saveProduct(product);
    }

    saveProduct = (product_meta) => {
        putData(`${WFDB_BACKEND}/products/${product_meta.product_id}`, product_meta, (cb) => {
            console.log(":: saveProduct Respond: ",cb);
            this.setState({product_name: "", product_description: "", language: "", unit: null, metadata: {language: ""}});
            this.props.finishProduct();
        });
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

        const {product_name, product_description, language, cit_open, metadata, show_info, mdb_open, unit} = this.state;
        const valid_form = metadata.hasOwnProperty("final_name") && !!unit && !!product_name

        return (
            <Modal closeOnDimmerClick={false}
                   onMount={this.checkEdit}
                   onClose={this.props.toggleProductAdmin}
                   open={this.props.show_admin}
                   size='tiny'
                   closeIcon="close">
                <Modal.Header>Add/Edit Product</Modal.Header>

                <Modal.Content>
                    <Segment padded basic>
                        <Form>
                            <Form.Select
                                fluid
                                label='Original Language'
                                options={dep_options}
                                placeholder='Choose Original Language'
                                value={language}
                                onChange={(e, {value}) => this.setProductLang(value)}
                            />
                            <Form.Input fluid label='Title' placeholder='Title' value={product_name} onChange={(e, {value}) => this.setProductName(value)} />
                            <Form.TextArea label='Description' placeholder='Description...' value={product_description} onChange={(e, {value}) => this.setProductDescription(value)}/>
                            <Form.Group widths='equal'>
                                <Form.Field>
                                    <Modal closeOnDimmerClick={false}
                                           trigger={<Button color='blue' content='RENAME' icon='tags' onClick={this.openCit} />}
                                           onClose={this.onCancel}
                                           open={cit_open}
                                           closeIcon="close" >
                                        <Modal.Content>
                                            <CIT metadata={metadata} onCancel={this.onCancel} onComplete={(x) => this.setMetadata(x)}/>
                                        </Modal.Content>
                                    </Modal>
                                </Form.Field>
                                <FormField>
                                    {unit ?
                                    <Modal
                                        onClose={() => this.setState({show_info: false})}
                                        onOpen={() => this.setState({show_info: true})}
                                        open={show_info}
                                        size='small'
                                        trigger={<Button>UID</Button>}
                                    >
                                        <Modal.Content>
                                            <JSONToHTMLTable data={unit} tableClassName="ui small basic very compact table"/>
                                        </Modal.Content>
                                    </Modal>
                                        : null}
                                </FormField>
                                <Form.Field>
                                    <Modal closeOnDimmerClick={false}
                                           trigger={<Button color='teal' content='RELATE' icon='archive' onClick={this.openMdb}/>}
                                           onClose={this.onCancel}
                                           open={mdb_open}
                                           size='large'
                                           closeIcon="close">
                                        <Modal.Content>
                                            <MDB metadata={metadata} user={this.props.user} onCancel={this.onCancel} onComplete={(x) => this.onMdbSelect(x)}/>
                                        </Modal.Content>
                                    </Modal>
                                </Form.Field>
                            </Form.Group>
                        </Form>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleProductAdmin}>Cancel</Button>
                    <Button positive={true} disabled={!valid_form}
                            onClick={this.props.product ? this.editProduct : this.newProduct}>Apply</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default ProductsAdmin;
