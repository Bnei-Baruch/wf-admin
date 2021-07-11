import React, {Component} from 'react'
import {postData, WFDB_BACKEND} from '../../shared/tools';
import {Segment, Button, Form, Modal} from 'semantic-ui-react'
import {language_options, MDB_LANGUAGES, WF_LANGUAGES} from "../../shared/consts";

class AddLanguage extends Component {

    state = {
        language: "",
        name: "",
        description: "",
    };

    checkEdit = () => {
        const {selected_language, product} = this.props;
        if(product && selected_language) {
            const {name, description} = product.i18n[WF_LANGUAGES[selected_language]];
            this.setState({name, language: selected_language, description});
        } else {
            this.setState({name: "", language: "", description: ""});
        }
    };

    setLanguageName = (name) => {
        this.setState({name});
    };

    setLanguageDescription = (description) => {
        this.setState({description});
    };

    setLanguage = (language) => {
        this.setState({language});
    };

    addLanguage = () => {
        const {language, name, description} = this.state;
        const {product_id} = this.props;
        const data = {name, description};
        postData(`${WFDB_BACKEND}/products/${product_id}/i18n/${MDB_LANGUAGES[language]}`, data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.setState({name: "", description: "", language: ""});
            this.props.finishLanguage();
        });
    };

    render() {

        const {language, name, description} = this.state;

        return (
            <Modal closeOnDimmerClick={false}
                   onMount={this.checkEdit}
                   onClose={this.props.toggleAddLanguage}
                   open={this.props.add_language}
                   size='tiny'
                   closeIcon="close">
                <Modal.Header>Add/Edit Language</Modal.Header>
                <Modal.Content>
                    <Segment padded basic>
                        <Form>
                            <Form.Select
                                fluid
                                label='Language'
                                options={language_options} //FIXME: Don't show languages that already exist
                                placeholder='Choose Language'
                                value={language}
                                onChange={(e, {value}) => this.setLanguage(value)}
                            />
                            <Form.Input fluid label='Title' placeholder='Title' onChange={e => this.setLanguageName(e.target.value)} value={name} />
                            <Form.TextArea label='Description' placeholder='Description...' onChange={e => this.setLanguageDescription(e.target.value)} value={description} />
                        </Form>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleAddLanguage} >Cancel</Button>
                    <Button positive={true} onClick={this.addLanguage} >Apply</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default AddLanguage;
