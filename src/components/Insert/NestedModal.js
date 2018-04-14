import React, { Component } from 'react';
//import {Fetcher, MDB_LANGUAGES, toHms} from '../../shared/consts';
import { Modal, Button, Table } from 'semantic-ui-react'

class NestedModal extends Component {
    state = {
        open: false,
        active: null,
    };

    open = () => this.setState({ open: true })

    close = () => this.setState({ open: false })

    componentDidMount() {
        // console.log("--Did mount--");
        // let path = this.props.id + '/files/';
        // Fetcher(path)
        //     .then(data => {
        //         this.setState({files: data.data});
        //     })
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            if(this.props.upload_type === "publication") {
                this.open();
            }
        }
    };

    rawClick = (pub) => {
        this.setState({active: pub.uid, publisher: pub});
    };

    selectPublisher  = () => {
        this.props.onPubSelect(this.state.publisher);
        this.setState({ open: false });
    }

    render() {
        const { open } = this.state;
        let pub_list = this.props.store.publishers.map((pub) => {
            let name = (pub.i18n.he) ? pub.i18n.he.name : "Name not found";
            let active = (this.state.active === pub.uid ? 'active' : '');
            return (
                <Table.Row className={active} key={pub.id} onClick={() => this.rawClick(pub)}>
                    <Table.Cell textAlign='right'
                                className={(pub.i18n.he ? "rtl-dir" : "negative")}>{name}</Table.Cell>
                </Table.Row>
            );
        });
        console.log("--NestedModal Render--")
        return (
            <Modal
                {...this.props}
                className="nestedmodal"
                size="tiny"
                dimmer={true}
                closeIcon={false}
                closeOnDimmerClick={false}
                defaultOpen={true}
                open={open}
                onOpen={this.open}
                onClose={this.close}
            >
                <Modal.Header>Publishers</Modal.Header>
                <Modal.Content className="tabContent">
                    <Table selectable compact='very' color='grey' key='teal' {...this.props}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell></Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {pub_list}
                        </Table.Body>
                    </Table>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' content='Select' disabled={!this.state.active} onClick={this.selectPublisher} />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default NestedModal;
