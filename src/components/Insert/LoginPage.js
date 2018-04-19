import React, { Component } from 'react';
import { Container,Message,Button } from 'semantic-ui-react';

class LoginPage extends Component {

    handleInsert = (e, data) => {
        console.log("-- Handle Insert --", data.value);
        this.props.onInsert(data.value);
    };

    render() {

        let main = (
            <Button.Group size='massive' >
                <Button positive value='new' onClick={this.handleInsert}>&nbsp;&nbsp;Insert&nbsp;</Button>
                <Button.Or />
                <Button value='update' onClick={this.handleInsert} color='orange'>Update</Button>
            </Button.Group>
        );

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header {...this.props}>
                    </Message.Header>
                    <p>Service for inserting new materials into the bb archive.</p>
                    {main}
                </Message>
            </Container>
        );
    }
}

export default LoginPage;
