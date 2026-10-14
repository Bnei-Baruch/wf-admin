import React, {Component, Fragment} from 'react'
import {Modal, Segment, Grid, Select, Checkbox, Button, Form, TextArea} from "semantic-ui-react";
import MediaAdmin from "./MediaAdmin";
import MediaUpload from "./MediaUpload";
import {WFSRV_BACKEND, putData, getData, MDB_FINDSHA, getUnits,
    mdbUpload, findMdbFile, newMediaUnit, insertFile} from "../../shared/tools";
import mqtt from "../../shared/mqtt";
import {MQTT_ROOT} from "../../shared/consts";

class MediaManager extends Component {

    state = {
        media: [],
        modal_open: false,
        file_data: null,
        label_id: "",
        cassette: true,
        description: "",
        labels: [],
        selected_label: null,
        label_loading: false,
        label_query: "",
        saving: false,
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

    // Lookup label by cassette id. The id column is an integer, so this is an exact
    // match (labels/kv?id=) - non numeric input is ignored, it would break the query.
    searchLabels = (e, {searchQuery}) => {
        this.setState({label_query: searchQuery});
        clearTimeout(this.searchTimer);
        const query = (searchQuery || "").trim();
        if(!/^\d+$/.test(query)) {
            this.setState({labels: [], label_loading: false});
            return;
        }
        this.setState({label_loading: true});
        this.searchTimer = setTimeout(() => {
            getData(`labels/kv?id=${query}`, (labels) => {
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
        getData(`media/kv?sha1=${file_data.sha1}`, (trimmer) => {
            if(trimmer.length > 0) {
                console.log(":: Found data in media DB by SHA1: ",trimmer);
                alert("File already exist in Workflow DB!");
            } else {
                // Check SHA1 in MDB
                let sha1 = file_data.sha1;
                let fetch_url = `${MDB_FINDSHA}/${sha1}`;
                getUnits(fetch_url, (units) => {
                    if (units.total > 0) {
                        console.log("The file exist in MDB!", units);
                        alert("File already exist in MDB!");
                    } else {
                        // File passed all checks and does not exist yet - ask for metadata
                        console.log(":: MediaApp - new file, open modal: ", file_data);
                        this.setState({file_data, modal_open: true, label_id: "", cassette: true,
                            description: "", selected_label: null, labels: [], label_query: ""});
                    }
                });
            }
        });
    };

    closeModal = () => {
        clearTimeout(this.searchTimer);
        this.setState({modal_open: false, file_data: null, label_id: "", cassette: false,
            description: "", selected_label: null, labels: [], label_query: "", label_loading: false,
            saving: false});
    };

    selectLabel = (value) => {
        const selected = this.state.labels.find(d => d.id === value) || null;
        this.setState({label_id: value, selected_label: selected});
    };

    // The file passed all checks (not in WFDB, not in MDB), so before handing it over
    // to the workflow we archive it in MDB:
    //   1. register the file     - POST operations/upload
    //   2. resolve its id/uid    - GET rest/files/?sha1=  (upload responds with status only)
    //   3. create TAPE unit   - POST rest/content_units/
    //   4. link file to the unit - PUT rest/files/:id/
    // Resulting ids go to extra, unit_uid is duplicated into the root uid.
    applyMedia = async () => {
        let {file_data, label_id, cassette, selected_label, description} = this.state;
        file_data.label_id = label_id;
        file_data.label = selected_label;
        file_data.description = description;
        file_data.wfstatus = {...(file_data.wfstatus || {}), cassette};

        this.setState({saving: true});

        try {
            await mdbUpload(file_data, this.props.user, selected_label);

            const mdb_file = await findMdbFile(file_data.sha1);
            if(!mdb_file) throw new Error("File not found in MDB after upload");

            const unit = await newMediaUnit(file_data, selected_label, description);
            await insertFile(mdb_file.id, unit.id);

            file_data.extra = {...(file_data.extra || {}),
                file_id: mdb_file.id, file_uid: mdb_file.uid,
                unit_id: unit.id, unit_uid: unit.uid};
            file_data.uid = unit.uid;
        } catch (err) {
            console.error(":: MediaApp - MDB error: ", err);
            alert(`MDB error: ${err.message}`);
            this.setState({saving: false});
            return;
        }

        console.log(":: MediaApp - apply media: ", file_data);
        putData(`${WFSRV_BACKEND}/workflow/media`, file_data, (cb) => {
            console.log(":: MediaApp - workflow respond: ",cb);
        });
        this.closeModal();
    };

    render() {
        const {modal_open, label_id, cassette, description, labels, selected_label, label_loading, label_query, saving} = this.state;

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
                                    minCharacters={1}
                                    loading={label_loading}
                                    options={label_options}
                                    placeholder='Cassette id...'
                                    value={label_id}
                                    onSearchChange={this.searchLabels}
                                    onChange={(e, {value}) => this.selectLabel(value)}
                                    noResultsMessage={!/^\d+$/.test(label_query.trim()) ? 'Enter cassette id…' : (label_loading ? 'Searching…' : 'No labels found')}
                                />
                            </Grid.Column>
                            <Grid.Column>
                                <Segment size='mini' basic>
                                    <Checkbox label='Cassette' checked={cassette}
                                              onChange={() => this.setState({cassette: !cassette})} />
                                </Segment>
                            </Grid.Column>
                        </Grid>
                        <Form>
                            <Form.Field>
                                <label>Description</label>
                                <TextArea
                                    placeholder='Notes...'
                                    value={description}
                                    onChange={(e, {value}) => this.setState({description: value})}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.closeModal} disabled={saving}>Cancel</Button>
                        <Button positive loading={saving} disabled={!label_id || saving} onClick={this.applyMedia}>Apply</Button>
                    </Modal.Actions>
                </Modal>
            </Fragment>
        );
    }
}

export default MediaManager;
