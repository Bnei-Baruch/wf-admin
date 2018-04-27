import React, { Component, Fragment } from 'react'
import { getData } from '../shared/tools';
import { Table, Container } from 'semantic-ui-react'

class LangSelector extends Component {

    state = {
        languages: {},
    };

    componentDidMount() {
        const lang_data = ["heb","rus","eng","spa","fre","ita","ger","por","trk","bul","geo","ron","hun","swe","lit","hrv","jpn","slv","pol","nor","lav","ukr","chn"];
        let languages = {};
        lang_data.map((lang) => {
            languages[lang] = false;
        });
        this.setState({languages});
        //this.getKmediaData("date", this.props.date);
    };

    componentDidUpdate(prevProps) {
        let prev = [prevProps.date, prevProps.skey, prevProps.svalue];
        let next = [this.props.date, this.props.skey, this.props.svalue];
        if (JSON.stringify(prev) !== JSON.stringify(next))
            this.getKmediaData(this.props.skey, this.props.svalue);
    };

    getKmediaData = (skey, svalue) => {
        let search = this.props.skey === "date" ? this.props.date : svalue;
        if(!search) return;
        getData(`kmedia/find?key=${skey}&value=${search}`, (kmedia) => {
            console.log(":: Kmedia DB Data: ",kmedia);
            this.setState({kmedia});
            this.restructure(kmedia);
        });
    };

    render() {

        let langs_data = Object.keys(this.state.languages).map((id, i) => {
            return (
                <Table.Cell colSpan='23' >{id}</Table.Cell>
            );
        });

        return (
            <Container textAlign='center'>
                <Table compact='very' selectable fixed basic size='small'>
                    <Table.Header>
                        <Table.Row className='table_header'>
                            <Table.HeaderCell colSpan='24'>File Name</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        <Table.Row className="monitor_tr" >
                        {langs_data}
                        </Table.Row>
                    </Table.Body>
                </Table>
            </Container>
        );
    }
}

export default LangSelector;