import React, { Component } from 'react';
import { Container,Message,Button } from 'semantic-ui-react';

class LoginPage extends Component {

    render() {

        const {onInsert} = this.props;

        let main = (
            <Button.Group size='massive' >
                <Button positive value='1' onClick={(e,{value}) => onInsert(value)}>&nbsp;&nbsp;Insert&nbsp;</Button>
                <Button.Or />
                <Button value='2' onClick={(e,{value}) => onInsert(value)} color='orange'>Update</Button>
            </Button.Group>
        );

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header>
                    </Message.Header>
                    <p>Service for inserting new materials into the bb archive.</p>
                    {main}
                </Message>
            </Container>
        );
    }
}

export default LoginPage;
