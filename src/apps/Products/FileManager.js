import React, {Component} from 'react'
import {
    WFDB_BACKEND,
    getToken,
    getMediaType,
    putData,
    postData,
    newMdbUnit,
    WFSRV_BACKEND,
    getUnit, MDB_LOCAL_URL, MDB_EXTERNAL_URL
} from '../../shared/tools';
import {Divider, Button, Modal, Grid, Confirm, Segment, Select, Checkbox} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import {PRODUCT_FILE_TYPES, WF_LANGUAGES} from "../../shared/consts";

class FileManager extends Component {

    state = {
        active: null,
        file_type: "",
        langs_files: {},
        product_name: "",
        files: [],
        product_data: {},
        filedata: {},
        language: "heb",
        original_language: "heb",
        metadata: {},
        showConfirm: false,
        showEditFile: false,
        inserting: false,
        archive: false,
    };

    checkEdit = () => {
        if(this.props.file_data) {
            const {file_type, properties: {archive}} = this.props.file_data;
            this.setState({file_type, archive});
        } else {
            this.setState({file_type: "", archive: false});
        }
    };

    sortFiles = () => {
        const {langs, files} = this.props;
        Object.keys(langs).map(l => langs[l]["files"] = files.filter(f => f.language === l));
        this.setState({langs_files: langs});
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    setProductName = (product_name) => {
        this.setState({product_name});
    };

    setRemoved = () => {
        let {file_data} = this.props;
        console.log(":: FileManager - set removed: ", file_data);
        fetch(`${WFDB_BACKEND}/files/${file_data.file_id}/status/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        this.setState({showConfirm: false});
        setTimeout(() => {
            this.props.getProductFiles();
            this.props.toggleFileManager();
        }, 1000)
    };

    saveFileData = () => {
        const {file_data} = this.props;
        file_data.file_type = this.state.file_type;
        file_data.properties.archive = this.state.archive;
        delete file_data.id;
        putData(`${WFDB_BACKEND}/files/${file_data.file_id}`, file_data, (cb) => {
            console.log(":: EditFile respond: ",cb);
            this.setState({showEditFile: false});
            this.props.getProductFiles();
        });
    };

    makeUnit = () => {
        const {line, parent} = this.props.product;
        this.setState({inserting: true});

        // UID in line indicate that unit already created. If we again here it's mean
        // insert was not successful or we insert translation. So we get unit from MDB and try to insert again.
        if(line.uid) {
            const local = window.location.hostname !== "wfsrv.kli.one";
            const url = local ? MDB_LOCAL_URL : MDB_EXTERNAL_URL;
            getUnit(`${url}/${line.unit_id}/`, (unit) => {
                this.archiveInsert(unit);
            })
        } else {
            newMdbUnit(line, parent.mdb_id)
                .then(unit => {
                    console.log("makeUnit: ", unit);
                    this.archiveInsert(unit);
                })
                .catch(reason => {
                    console.log(reason.message);
                    this.setState({inserting: false});
                })
        }
    };

    archiveInsert = (unit) => {
        const {file_data, product, user} = this.props;
        const {name,email} = user;
        const {date,extension,file_name,language,sha1,size,properties:{url}} = file_data;

        if(!product.line.uid) {
            product.line.unit_id = unit.id;
            product.line.uid = unit.uid;
            product.i18n[WF_LANGUAGES[language]].archive = true;
            putData(`${WFDB_BACKEND}/products/${product.product_id}`, product, (cb) => {
                console.log(":: saveProduct: ",cb);
            });
        }

        const insert_meta = {
            date, extension, file_name,
            insert_id: "i" + Math.floor(Date.now() / 1000),
            insert_name: `${file_name}.${extension}`,
            insert_type: "1",
            language,
            line: {...product.line, name, email, url},
            send_id: product.product_id,
            sha1, size,
            upload_type: "product",
        };

        console.log(insert_meta)

        putData(`${WFSRV_BACKEND}/workflow/insert`, insert_meta, (cb) => {
            console.log(":: WFSRV respond: ",cb);
            if(cb.status === "ok") {

                // We save file data to DB after successful insert.
                file_data.uid = unit.uid;
                file_data.properties.archive = true;
                delete file_data.id;
                putData(`${WFDB_BACKEND}/files/${file_data.file_id}`, file_data, (cb) => {
                    console.log(":: saveFile: ",cb);
                    this.props.getProductFiles();
                    this.setState({inserting: false});
                });

                alert("Insert successful :)");
            } else {
                alert("Something gone wrong :(");
                this.setState({inserting: false});
            }
        });
    }

    render() {
        const {showConfirm, showEditFile, file_type, inserting, archive} = this.state;
        const {source, file_data} = this.props;
        if(Object.keys(file_data).length === 0) return null

        const full_name = file_data.file_name+'.'+file_data.extension;

        const type = getMediaType(file_data.mime_type)
        const file_type_options = PRODUCT_FILE_TYPES[file_data.language][type].map(data => {
            return ({key: data, value: data, text: data})
        });

        const message = (
            <div>
                <Segment size='massive' basic textAlign='center'>Delete {full_name}?</Segment>
                <Segment size='massive' basic textAlign='center'>This action can't be undone!</Segment>
            </div>
        )

        return (
            <Modal closeOnDimmerClick={false}
                   onMount={this.checkEdit}
                   onClose={this.props.toggleFileManager}
                   open={this.props.show_filemanager}
                   size='small'
                   closeIcon="close">
                <Modal.Header style={{display: "flex", justifyContent: "center"}}>{full_name}</Modal.Header>
                <Modal.Content>
                    <Grid textAlign='center'>
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                <Modal
                                    onClose={() => this.setState({showEditFile: false})}
                                    onOpen={() => this.setState({showEditFile: true})}
                                    open={showEditFile}
                                    trigger={<Button color='green' basic content='Edit' />}
                                    size='small'>
                                    <Modal.Content>
                                        <Segment size='massive' basic textAlign='center'>Change File Type.</Segment>
                                        <Segment size='massive' basic textAlign='center'>{full_name}</Segment>
                                        <Segment size='small' basic textAlign='center'>
                                            <Grid columns='equal'>
                                                <Grid.Column>
                                                    <Select fluid
                                                            error={!file_type}
                                                            options={file_type_options}
                                                            placeholder='File Type'
                                                            value={file_type}
                                                            onChange={(e, {value}) => this.setState({file_type: value})}
                                                    />
                                                </Grid.Column>
                                                <Grid.Column>
                                                    <Segment size='mini' basic>
                                                        <Checkbox label='To Archive' checked={archive}
                                                                  onChange={() => this.setState({archive: !archive})} />
                                                    </Segment>
                                                </Grid.Column>
                                            </Grid>
                                        </Segment>
                                    </Modal.Content>
                                    <Modal.Actions>
                                        <Button onClick={() => this.setState({showEditFile: false})} >Cancel</Button>
                                        <Button positive={true} disabled={!file_type} onClick={this.saveFileData} >Apply</Button>
                                    </Modal.Actions>
                                </Modal>
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='red' basic content='Delete' onClick={() => this.setState({showConfirm: true})} />
                                <Confirm
                                    content={message}
                                    open={showConfirm}
                                    onCancel={() => this.setState({showConfirm: false})}
                                    onConfirm={this.setRemoved}
                                />
                            </Grid.Column>
                        </Grid.Row>
                        <Divider hidden />
                        <Grid.Row columns={4}>
                            <Grid.Column>
                                <Modal trigger={<Button color='blue' basic content='Play' />} size='tiny'>
                                    <MediaPlayer player={this.getPlayer} source={source} type='video/mp4' />
                                </Modal>
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='violet' basic content='Download' href={source} download />
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='orange' basic content='Youtube' />
                            </Grid.Column>
                            <Grid.Column>
                                <Button color='yellow' basic content='Mdb' loading={inserting}
                                        disabled={inserting || !file_data.properties?.archive || file_data.uid}
                                        onClick={this.makeUnit} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.props.toggleFileManager} >Cancel</Button>
                </Modal.Actions>
            </Modal>
        );
    }
}

export default FileManager;
