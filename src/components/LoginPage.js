import React, { Component } from 'react';
import {client,BASE_URL,getUser} from './UserManager';
import { Container,Message,Button,Dropdown,Image } from 'semantic-ui-react';
import logo from './KL_Tree_128.png';

class LoginPage extends Component {

    state = {
        disabled: true,
        loading: true,
    };

    componentDidMount() {
        this.appLogin();
    };

    appLogin = () => {
        getUser(user => {
            if(user) {
                this.props.checkPermission(user);
            } else {
                client.signinRedirectCallback().then((user) => {
                    if(user.state) window.location = user.state;
                }).catch(() => {
                    client.signinSilent().then(user => {
                        if(user) this.appLogin();
                    }).catch((error) => {
                        console.log("SigninSilent error: ",error);
                        this.setState({disabled: false, loading: false});
                    });
                });
            }
        });
    };

    userLogin = () => {
        this.setState({disabled: true, loading: true});
        getUser(cb => {
            if(!cb) client.signinRedirect({state: `${BASE_URL}`});
        });
    };

    render() {

        const {disabled, loading} = this.state;

        let login = (<Button size='massive' primary onClick={this.userLogin} disabled={disabled} loading={loading}>Login</Button>);
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
                    <Message.Header>
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
