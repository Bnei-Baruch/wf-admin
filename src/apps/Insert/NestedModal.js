import React, { Component } from 'react';
import { Modal, Button, Table } from 'semantic-ui-react'

class NestedModal extends Component {
    state = {
        open: false,
        selected: null,
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(this.props) !== JSON.stringify(prevProps)) {
            if(this.props.upload_type === "publication") {
                this.open();
            }
        }
    };

    rawClick = (publisher) => {
        this.setState({selected: publisher.uid, publisher});
    };

    selectPublisher  = () => {
        this.props.onPubSelect(this.state.publisher);
        this.setState({ open: false });
    };

    open = () => this.setState({ open: true });

    close = () => this.setState({ open: false });

    render() {
        const {locale} = this.props;
        const {open, selected} = this.state;
        let pub_list = this.props.publishers.map((pub) => {
            const {pattern, i18n, id, uid} = pub;
            let name = i18n?.[locale]?.name || pattern;
            let active = selected === uid ? 'active' : '';
            return (
                <Table.Row className={active} key={id} onClick={() => this.rawClick(pub)}>
                    <Table.Cell>{name}</Table.Cell>
                    <Table.Cell>{pattern}</Table.Cell>
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
                <Modal.Content className="publishers">
                    <Table selectable compact='very' color='grey' key='teal'>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Name</Table.HeaderCell>
                                <Table.HeaderCell>Pattern</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {pub_list}
                        </Table.Body>
                    </Table>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='blue' content='Select' disabled={!selected} onClick={this.selectPublisher} />
                </Modal.Actions>
            </Modal>
        )
    }
}

export default NestedModal;
