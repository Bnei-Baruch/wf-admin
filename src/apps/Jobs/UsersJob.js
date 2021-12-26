import React, { Component } from 'react';
import {Container, Segment, Table, Icon, Menu, Input, Button, Select, Popup} from "semantic-ui-react";
import {getAuthData, AUTH_API} from "../../shared/tools";

class UsersJob extends Component {

    state = {
        users: [],
        selected_user: "",
        search: "id",
        disabled: true,
        loading: true,
        input: "",
        user_info: {},
    };

    componentDidMount() {
    };

    searchUser = () => {
        const {search, input, users} = this.state;
        getAuthData(`${AUTH_API}/find?${search}=${input}`, (response) => {
            users.push(response)
            console.log(response)
            this.setState({input: ""});
        });
    };

    cleanUsers = () => {
        getAuthData(`${AUTH_API}/cleanup`, (response) => {
            console.log(response);
            alert("Done");
        });
    };

    selectUser = (id, user) => {
        getAuthData(`${AUTH_API}/user/${id}`, (user_info) => {
            this.setState({selected_user: user, user_info});
            console.log(user_info)
        });
    }

    render() {
        const {users, selected_user, search, input, user_info} = this.state;

        const {groups,roles,social} = user_info;

        let v = (<Icon color='green' name='checkmark'/>);
        let x = (<Icon color='red' name='close'/>);

        const gxy_user = !!roles?.find(r => r.name === "gxy_user")
        const idp = social?.length ? social[0].identityProvider : x
        const grp = groups?.length ? groups[0].name : ""

        let users_content = users.map(user => {
            const {id,firstName,lastName,emailVerified,email,createdTimestamp} = user;
            const reg_time = new Date(createdTimestamp).toUTCString();
            return (<Popup trigger={<Table.Row key={id}
                                               active={id === selected_user}
                                               negative={!emailVerified}
                                               onClick={() => this.selectUser(id, user)} >
                    <Table.Cell>{<Icon name={emailVerified ? 'checkmark' : 'close'} />} - {email}</Table.Cell>
                    <Table.Cell>{firstName}</Table.Cell>
                    <Table.Cell>{lastName}</Table.Cell>
                    <Table.Cell>{reg_time}</Table.Cell>
                </Table.Row>} flowing hoverable on='click'>
                    <Table compact='very' structured unstackable singleLine celled>
                        <Table.Row disabled>
                            <Table.HeaderCell width={3}>Social Id</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Sec Group</Table.HeaderCell>
                            <Table.HeaderCell width={2}>Gxy User</Table.HeaderCell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell textAlign='center'>{idp}</Table.Cell>
                            <Table.Cell textAlign='center'>{grp}</Table.Cell>
                            <Table.Cell textAlign='center'>{gxy_user ? v : x}</Table.Cell>
                        </Table.Row>
                    </Table>
                </Popup>
            )
        });

        const options = [
            { key: 'email', text: 'MAIL', value: 'email' },
            { key: 'id', text: 'ID', value: 'id' },
        ]

        return (
            <Container fluid >
                <Menu size='large' secondary>
                    <Menu.Item>
                    </Menu.Item>
                    <Menu.Menu position='left'>
                        <Input type='text' placeholder='Search..' action value={input}
                               onChange={(e, { value }) => this.setState({input: value})}>
                            <input />
                            <Select compact options={options} value={search}
                                    onChange={(e, { value }) => this.setState({search: value})}/>
                            <Button type='submit' color='blue' disabled={!search}
                                    onClick={() => this.searchUser(search)}>Search</Button>
                        </Input>
                    </Menu.Menu>
                    {/*<Menu.Menu position='right'>*/}
                    {/*    <Menu.Item>*/}
                    {/*    </Menu.Item>*/}
                    {/*    <Menu.Item>*/}
                    {/*        <Button color='red' onClick={this.cleanUsers}>CleanUsers</Button>*/}
                    {/*    </Menu.Item>*/}
                    {/*</Menu.Menu>*/}
                </Menu>
                <Segment textAlign='center' className="group_list" raised >
                    <Table selectable compact='very' basic structured className="admin_table" unstackable>
                        <Table.Body>
                            <Table.Row disabled>
                                <Table.Cell width={3}>Email</Table.Cell>
                                <Table.Cell width={2}>First Name</Table.Cell>
                                <Table.Cell width={2}>Last Name</Table.Cell>
                                <Table.Cell width={3}>Reg Time</Table.Cell>
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
