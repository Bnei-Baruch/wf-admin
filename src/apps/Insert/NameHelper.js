import React, { Component } from 'react';
import {getCollectionByID, getDataByID} from '../../shared/tools';
import { Grid, Header } from 'semantic-ui-react'
import {WF_LANGUAGES} from "../../shared/consts";

class NameHelper extends Component {

    state = { send_name: "" };

    componentDidMount() {
        if(this.props.id) {
            // getDataByID(this.props.id, (wfdata) => {
            //     console.log(":: Got Workflow Data: ", wfdata);
            //     this.setState({send_name: wfdata.file_name});
            // });
            getCollectionByID(this.props.id).then(unit => {
                const {language} = this.props;
                console.log(unit[0])
                let l = WF_LANGUAGES[language] || 'en'
                let name = unit[0].collection.i18n[l]?.name
                this.setState({send_name: name});
            })
        }
    };

    render() {
        return (
            <Grid>
                <Grid.Column textAlign='left'>
                    <Header as='h4' color="red" >
                        {this.state.send_name}
                    </Header>
                </Grid.Column>
            </Grid>
        )
    }
}

export default NameHelper;

