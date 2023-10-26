import React, {Component} from 'react'
import {
    WFDB_BACKEND,
    getToken,
    getMediaType,
    putData,
    newMdbUnit,
    updateMdbUnit,
    WFSRV_BACKEND,
    toHms, CNV_BACKEND, insertName
} from '../../shared/tools';
import {Divider, Button, Modal, Grid, Confirm, Segment, Select, Checkbox} from 'semantic-ui-react'
import MediaPlayer from "../../components/Media/MediaPlayer";
import {PRODUCT_FILE_TYPES, PRODUCT_FILE_TYPES_ALL, WF_LANGUAGES} from "../../shared/consts";

class FileManager extends Component {

    state = {
        active: null,
        delay: false,
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
        fetch(`${WFDB_BACKEND}/files/${file_data.file_id}`,
            { method: 'DELETE',headers: {'Authorization': 'bearer ' + getToken()}})
        this.setState({showConfirm: false});
        setTimeout(() => {
            this.props.getProductFiles();
            this.props.toggleFileManager();
        }, 1000)
    };

    saveFileData = () => {
        const {file_data, mdb_file} = this.props;
        const {file_type, archive} = this.state;
        if(mdb_file && archive) {
            fetch(`${WFDB_BACKEND}/files/${mdb_file.file_id}/properties/archive?value=false`,
                { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        }
        if(archive) {
            const d = toHms(file_data.media_info.format.duration);
            fetch(`${WFDB_BACKEND}/products/${file_data.product_id}/properties/duration?value=${d}`,
                { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
        }
        file_data.file_type = file_type;
        file_data.properties.archive = archive;
        delete file_data.id;
        putData(`${WFDB_BACKEND}/files/${file_data.file_id}`, file_data, (cb) => {
            console.log(":: EditFile respond: ",cb);
            this.setState({showEditFile: false});
            this.props.getProductFiles();
        });
    };

    makeUnit = () => {
        const {file_data} = this.props;
        const {properties:{change_sha1}} = file_data;

        if(change_sha1) {
            this.chnageUnit();
            return
        }

        const {line, parent, i18n} = this.props.product;
        this.setState({inserting: true});

        // UID in line indicate that unit already created. If we again here it's mean
        // insert was not successful or we insert translation. So we get unit from MDB and try to insert again.
        if(line.uid) {
            const {language} = this.props.file_data;
            const mdb_lang = WF_LANGUAGES[language];
            const lang = i18n[mdb_lang]
            lang.language = mdb_lang;
            updateMdbUnit(line.unit_id, lang)
                .then(unit => {
                    this.archiveInsert(unit);
                })
                .catch(reason => {
                    console.log(reason.message);
                    this.setState({inserting: false});
                })
        } else {
            newMdbUnit(line, parent.mdb_id, this.props.metadata)
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

    chnageUnit = () => {
        const {file_data} = this.props;
        const {file_id, sha1, properties:{change_sha1, change_id, url}} = file_data;

        // Take insert data
        insertName(change_sha1, "sha1", (data) => {
            console.log(":: insert data - got: ", data);
            if(data.length > 0) {
                let insert_meta = data[0]
                insert_meta.insert_type = "2";
                insert_meta.line.old_sha1 = change_sha1;
                insert_meta.sha1 = sha1;
                insert_meta.line.url = url;

                // Update insert data
                putData(`${WFSRV_BACKEND}/workflow/insert`, insert_meta, (cb) => {
                    console.log(":: WFSRV respond: ",cb);
                    if(cb.status === "ok") {

                        // Mark changed file as removed
                        fetch(`${WFDB_BACKEND}/files/${change_id}/properties/removed?value=true`,
                            { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})

                        file_data.uid = insert_meta.line.uid;
                        file_data.properties.archive = true;
                        file_data.properties.mdb = true;
                        delete file_data.properties.change_sha1;
                        delete file_data.id;

                        // Update file with new data
                        putData(`${WFDB_BACKEND}/files/${file_id}`, file_data, (cb) => {
                            console.log(":: saveFile: ",cb);
                            this.props.getProductFiles();
                            this.setState({inserting: false});
                            alert("Change successful :)");
                        });
                    } else {
                        alert("Something gone wrong :(");
                    }
                });
            } else {
                alert("Did not found insert object");
            }
        });
    }

    archiveInsert = (unit) => {
        const {file_data, product, user} = this.props;
        const {name,email} = user;
        const {date,extension,file_name,language,sha1,size,mime_type,properties:{url}} = file_data;

        if(!product.line.uid) {
            product.line.unit_id = unit.id;
            product.line.uid = unit.uid;
            product.pattern = unit.uid;
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
            line: {...product.line, name, email, url, mime_type},
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
                file_data.properties.mdb = true;
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
    };

    closeModal = () => {
        this.setState({file_type: "", archive: false});
        this.props.toggleFileManager();
    };

    mobileConvert = () => {
        const {file_data} = this.props;
        fetch(`${CNV_BACKEND}/convert?id=${file_data.file_id}&key=mobile`,
            { method: 'GET',headers: {'Authorization': 'bearer ' + getToken()}})
        this.makeDelay();
    };

    makeDelay = () => {
        this.setState({delay: true});
        setTimeout(() => {
            this.setState({delay: false});
        }, 30000);
    };

    render() {
        const {showConfirm, showEditFile, file_type, inserting, archive, delay} = this.state;
        const {source, file_data, to_mdb, metadata} = this.props;
        const name = metadata?.name;
        const {rooter, adminer, archer, viewer} = this.props.user;
        const lang_permission = archer || adminer || rooter;
        const product_permission = adminer || rooter;
        if(Object.keys(file_data).length === 0) return null

        const full_name = file_data.file_name+'.'+file_data.extension;

        const type = getMediaType(file_data.mime_type);
        const options = PRODUCT_FILE_TYPES[file_data.language] ? PRODUCT_FILE_TYPES[file_data.language][type] : PRODUCT_FILE_TYPES_ALL[type];
        const file_type_options = options.map(data => {
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
                   onClose={this.closeModal}
                   open={this.props.show_filemanager}
                   size='small'
                   closeIcon="close">
                <Modal.Header style={{display: "flex", justifyContent: "center"}}>{full_name}</Modal.Header>
                <Modal.Content>
                    <Grid textAlign='center'>
                        <Grid.Row columns={4}>
                            {lang_permission ?
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
                                                        <Checkbox label='File for  Archive' checked={archive} disabled={to_mdb}
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
                                : null}
                            {lang_permission ?
                            <Grid.Column>
                                <Button color='red' basic content='Delete'
                                        disabled={inserting || file_data.properties?.archive || !!file_data.uid}
                                        onClick={() => this.setState({showConfirm: true})} />
                                <Confirm
                                    content={message}
                                    open={showConfirm}
                                    onCancel={() => this.setState({showConfirm: false})}
                                    onConfirm={this.setRemoved}
                                />
                            </Grid.Column>
                                : null}
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
                                <Button color='orange' basic content='Mobile' loading={delay} disabled={delay}
                                onClick={this.mobileConvert} />
                            </Grid.Column>
                            {lang_permission ?
                            <Grid.Column>
                                <Button color='yellow' basic content='Mdb' loading={inserting}
                                        disabled={!name || inserting || !file_data.properties?.archive || file_data.uid}
                                        onClick={this.makeUnit} />
                            </Grid.Column>
                                : null}
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
