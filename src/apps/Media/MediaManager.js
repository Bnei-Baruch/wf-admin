import React, {Component, Fragment} from 'react'
import {Modal, Segment, Grid, Select, Checkbox, Button} from "semantic-ui-react";
import MediaAdmin from "./MediaAdmin";
import MediaUpload from "./MediaUpload";
import {WFSRV_BACKEND, putData, getData, MDB_FINDSHA, getUnits} from "../../shared/tools";
import mqtt from "../../shared/mqtt";
import {MQTT_ROOT} from "../../shared/consts";

class MediaManager extends Component {

    state = {
        media: [],
        modal_open: false,
        file_data: null,
        label_id: "",
        cassette: false,
        labels: [],
        selected_label: null,
        label_loading: false,
        label_query: "",
    };

    componentDidMount() {
        this.initMQTT();
    };

    componentWillUnmount() {
        mqtt.exit(this.state.topic)
    };

    initMQTT = () => {
        const data = MQTT_ROOT + '/service/media/state';
        const local = true;
        const topic = local ? data : 'bb/' + data;
        this.setState({topic})
        mqtt.join(topic);
        mqtt.watch((message, type, source) => {
            this.onMqttMessage(message, type, source);
        }, local)
    };

    onMqttMessage = (message, type, source) => {
        if(type !== "media") return
        console.log("[Monitor] Got msg: ", message, " | from: " + source, " | type: " + type);
        this.setState({media: message});
    };

    // Server-side search: query labels as the user types instead of loading the whole list
    searchLabels = (e, {searchQuery}) => {
        this.setState({label_query: searchQuery});
        clearTimeout(this.searchTimer);
        if(!searchQuery || searchQuery.length < 2) {
            this.setState({labels: [], label_loading: false});
            return;
        }
        this.setState({label_loading: true});
        this.searchTimer = setTimeout(() => {
            getData(`label/find?key=comments&value=${encodeURIComponent(searchQuery)}`, (labels) => {
                console.log(":: Got labels: ", labels);
                this.setState({labels: labels || [], label_loading: false});
            });
        }, 400);
    };

    labelOption = (data) => {
        const {id, date, comments, lecturer} = data;
        let text = [id, date, comments || lecturer].filter(Boolean).join(" — ");
        return ({key: id, value: id, text});
    };

    mediaWorkflow = (file_data) => {
        console.log(":: Upload file: ", file_data)
        // Check SHA1 in WFDB
        getData(`trimmer/kv?sha1=${file_data.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in trimmer DB by SHA1: ",trimmer);
                alert("File exist in ingest after trim");
            } else {
                // Check SHA1 in MDB
                let sha1 = file_data.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The SHA1 exist in MDB!", units);
                        alert("File already in MDB!");
                    } else {
                        // File passed all checks and does not exist yet - ask for metadata
                        console.log(":: MediaApp - new file, open modal: ", file_data);
                        this.setState({file_data, modal_open: true, label_id: "", cassette: false,
                            selected_label: null, labels: [], label_query: ""});
                    }
                });
            }
        });
    };

    closeModal = () => {
        clearTimeout(this.searchTimer);
        this.setState({modal_open: false, file_data: null, label_id: "", cassette: false,
            selected_label: null, labels: [], label_query: "", label_loading: false});
    };

    selectLabel = (value) => {
        const selected = this.state.labels.find(d => d.id === value) || null;
        this.setState({label_id: value, selected_label: selected});
    };

    applyMedia = () => {
        let {file_data, label_id, cassette} = this.state;
        file_data.label_id = label_id;
        file_data.wfstatus = {...(file_data.wfstatus || {}), cassette};
        console.log(":: MediaApp - apply media: ", file_data);
        putData(`${WFSRV_BACKEND}/workflow/media`, file_data, (cb) => {
            console.log(":: MediaApp - workflow respond: ",cb);
        });
        this.closeModal();
    };

    render() {
        const {modal_open, label_id, cassette, labels, selected_label, label_loading, label_query} = this.state;

        let label_options = labels.map(this.labelOption);
        // keep the currently selected label visible even after the search results change
        if(selected_label && !labels.find(d => d.id === selected_label.id)) {
            label_options = [this.labelOption(selected_label), ...label_options];
        }

        return (
            <Fragment>
                <MediaUpload onFileData={this.mediaWorkflow}/>
                <MediaAdmin user={this.props.user} media={this.state.media} />
                <Modal closeOnDimmerClick={false}
                       onClose={this.closeModal}
                       open={modal_open}
                       size='tiny'
                       closeIcon="close">
                    <Modal.Header>Media Metadata</Modal.Header>
                    <Modal.Content>
                        <Grid columns='equal'>
                            <Grid.Column>
                                <Select
                                    fluid
                                    selection
                                    clearable
                                    search={(options) => options}
                                    minCharacters={2}
                                    loading={label_loading}
                                    options={label_options}
                                    placeholder='Search label...'
                                    value={label_id}
                                    onSearchChange={this.searchLabels}
                                    onChange={(e, {value}) => this.selectLabel(value)}
                                    noResultsMessage={label_query.length < 2 ? 'Type to search…' : (label_loading ? 'Searching…' : 'No labels found')}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Segment size='mini' basic>
                                    <Checkbox label='Cassette' checked={cassette}
                                              onChange={() => this.setState({cassette: !cassette})} />
                                </Segment>
                            </Grid.Column>
                        </Grid>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.closeModal}>Cancel</Button>
                        <Button positive disabled={!label_id} onClick={this.applyMedia}>Apply</Button>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        );
    }
}

export default MediaManager;
