import React, {Component} from 'react';
import {Container, Segment, Table, Menu, Input, Button, Select} from "semantic-ui-react";
import {getAuthData, AUTH_API, putData, WFDB_BACKEND} from "../../shared/tools";

class UsersJob extends Component {

    state = {
        user: null,
        disabled: true,
        loading: true,
        input: "",
        role: "editor",
        user_info: {},
    };

    componentDidMount() {
    };

    searchUser = () => {
        const {input} = this.state;
        getAuthData(`${AUTH_API}/find?email=${input}`, (response) => {
            console.log(response)
            let user = null;
            if(response) {
                const {email, firstName, lastName, id} = response;
                user = {email, firstName, lastName, user_id: id};
            } else {
                alert("Email not found");
            }
            this.setState({input: "", user});
        });
    };

    addUser = () => {
        const {user} = this.state;
        user.properties = {removed: false};
        console.log(user);
        putData(`${WFDB_BACKEND}/users/${user.user_id}`, user, (cb) => {
            console.log(":: addUser respond: ",cb);
            this.setState({user: null});
            this.props.getUsers();
        });
    };

    selectUser = (id, user) => {
        getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
            this.setState({selected_user: user, user_info});
            console.log(user_info)
        });
    }

    render() {
        const {selected_user, input, user, role} = this.state;
        const {users} = this.props;

        let users_content = users.map(user => {
            const {user_id,firstName,lastName,email,role} = user;
            return (
                <Table.Row key={user_id}
                               active={user_id === selected_user}
                               onClick={() => this.selectUser(user_id, user)} >
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{email}</Table.Cell>
                    <Table.Cell>{role}</Table.Cell>
                </Table.Row>
            )
        });

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item position='left'>
                        <Input type='text' placeholder='Search..' action value={input}
                               onChange={(e, { value }) => this.setState({input: value})}>
                            <input />
                            <Button type='submit' color='blue' disabled={!input}
                                    onClick={() => this.searchUser()}>Search</Button>
                        </Input>
                    </Menu.Item>
                    <Menu.Item>
                        {user ?
                            <Select value={role} options={[
                                {key:"editor",text:"editor",value:"editor"},
                                {key:"writer",text:"writer",value:"writer"}
                            ]} onChange={(e, { value }) => this.setState({role: value})} />
                            : null}
                    </Menu.Item>
                    <Menu.Item>
                        {user ?
                            <Input focus type='text' placeholder='Search..' action value={user.firstName + " " + user.lastName}
                                   onChange={(e, { value }) => this.setState({input: value})}>
                                <input />
                                <Button type='submit' color='green'
                                        onClick={this.addUser}>Add</Button>
                            </Input>
                            : null}
                    </Menu.Item>
                </Menu>
                <Segment textAlign='center' className="group_list" raised >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={3}>Email</Table.Cell>
                                <Table.Cell width={2}>Role</Table.Cell>
                            </Table.Row>
                            {users_content}
                        </Table.Body>
                    </Table>
                </Segment>
            </Container>
        );
    }
}

export default UsersJob;
