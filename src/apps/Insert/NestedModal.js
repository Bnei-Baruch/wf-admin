import React, { Component } from 'react';
import { Modal, Button, Table } from 'semantic-ui-react'

class NestedModal extends Component {
    state = {
        open: false,
        actived: null,
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            if(this.props.upload_type === "publication") {
                this.open();
            }
        }
    };

    rawClick = (publisher) => {
        this.setState({actived: publisher.uid, publisher});
    };

    selectPublisher  = () => {
        this.props.onPubSelect(this.state.publisher);
        this.setState({ open: false });
    };

    open = () => this.setState({ open: true });

    close = () => this.setState({ open: false });

    render() {
        const {open,actived} = this.state;
        let pub_list = this.props.publishers.map((pub) => {
            let name = (pub.i18n.he) ? pub.i18n.he.name : "Name not found";
            let active = (actived === pub.uid ? 'active' : '');
            return (
                <Table.Row className={active} key={pub.id} onClick={() => this.rawClick(pub)}>
                    <Table.Cell textAlign='right'
                                className={(pub.i18n.he ? "rtl-dir" : "negative")}>{name}</Table.Cell>
                </Table.Row>
            );
        });

        return (
            <Modal
                className="nestedmodal"
                size="tiny"
                dimmer={true}
                closeIcon={false}
                closeOnDimmerClick={false}
                open={open}
                onOpen={this.open}
                onClose={this.close}
                mountNode={document.getElementById("ltr-modal-mount")}
            >
                <Modal.Header>Publishers</Modal.Header>
                <Modal.Content className="tabContent">
                    <Table selectable compact='very' color='grey' key='teal'>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell />
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {pub_list}
                        </Table.Body>
                    </Table>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' content='Select' disabled={!actived} onClick={this.selectPublisher} />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default NestedModal;
