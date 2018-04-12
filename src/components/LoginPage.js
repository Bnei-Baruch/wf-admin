import React, { Component } from 'react';
import {client,BASE_URL} from './UserManager';
import { Container,Message,Button,Dropdown,Image } from 'semantic-ui-react';
import logo from './KL_Tree_128.png';

class LoginPage extends Component {

    getUser = () => {
        client.getUser().then(function(user) {
            (user === null) ? client.signinRedirect({state: `${BASE_URL}`}) : console.log(":: What just happend?");
        }).catch(function(error) {
            console.log("Error: ",error);
        });
    };

    handleInsert = (e, data) => {
        console.log("-- Handle Insert --", data.value);
        this.props.onInsert(data.value);
    };

    render() {

        let login = (<Button size='massive' primary onClick={this.getUser} {...this.props} disabled={this.props.loading} >Login</Button>);
        //let logout = (<Button size='mini' primary onClick={() => client.signoutRedirect()}>LogOut</Button>);
        let logout = (<Image src={logo} centered />);
        let profile = (
            <Dropdown inline text=''>
                <Dropdown.Menu>
                    <Dropdown.Item content='Profile:' disabled />
                    <Dropdown.Item text='My Account' onClick={() => window.open("https://accounts.kbb1.com/auth/realms/main/account", "_blank")} />
                    <Dropdown.Item text='Sign Out' onClick={() => client.signoutRedirect()} />
                </Dropdown.Menu>
            </Dropdown>);

        return (
            <Container textAlign='center' >
                <Message size='massive'>
                    <Message.Header {...this.props}>
                        {this.props.user === null ? "Archive WorkFlow" : "Welcome, "+this.props.user.name}
                        {this.props.user === null ? "" : profile}
                    </Message.Header>
                    <p>Archive WorkFlow Administrative Tools and Services</p>
                    {this.props.user === null ? login : logout}
                </Message>
            </Container>
        );
    }
}

export default LoginPage;
