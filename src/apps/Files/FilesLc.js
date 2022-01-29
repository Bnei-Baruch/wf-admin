import React, {Component} from 'react'
import {Segment} from 'semantic-ui-react'
import {getFiles} from "../../shared/tools";

class FilesLc extends Component {

    state = {
        local: window.location.hostname === "wfsrv.bbdomain.org",
        data: []
    };

    componentDidMount() {
        getFiles(data => {
            console.log(data.children)
            this.setState({data: data.children})
        });
    };


    render() {
        const {local} = this.state;


        return (
            <Segment textAlign='center' basic className='frame'>

            </Segment>
        );
    }
}

export default FilesLc;
