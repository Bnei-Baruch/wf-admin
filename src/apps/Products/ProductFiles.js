import React, {Component} from 'react'
import {getMediaType, WFNAS_URL} from '../../shared/tools';
import {Button, Table, Icon, Popup, Label} from 'semantic-ui-react'
import FilesUpload from "../Upload/FilesUpload";
import FileManager from "./FileManager";

class ProductFiles extends Component {

    state = {
        active: "video",
        archive: this.props.metadata.archive,
        name: this.props.metadata.name,
        description: this.props.metadata.description,
        file_data: {},
    };

    selectFile = (file_data) => {
        console.log(":: ProductFiles - selected file: ", file_data);
        let path = file_data.properties.url;
        let source = `${WFNAS_URL}${path}`;
        this.setState({file_data, source, show_filemanager: true});
    };

    onFileUploaded = () => {
        this.props.getProductFiles();
        this.toggleUpload();
    };

    toggleUpload = () => {
        this.setState({show_upload: !this.state.show_upload});
    };

    toggleFileManager = () => {
        this.setState({show_filemanager: !this.state.show_filemanager});
    };

    render() {

        const {active, source, show_filemanager, show_upload, file_data, name, description, archive} = this.state;
        const {rooter, adminer, archer, viewer} = this.props.user;
        const lang_permission = archer || adminer || rooter;
        const {lang, file_name, product_id} = this.props;
        let lang_file_name

        if(file_name.split("_")[0] === lang) {
            lang_file_name = file_name;
        } else {
            let new_name = file_name.split("_");
            new_name[0] = lang;
            new_name[1] = "t";
            lang_file_name = new_name.join("_");
        }

        // Only one file per language product go to archive
        const to_mdb = this.props.files.find(f => f.uid && lang === f.language) || archive;
        const mdb_file = this.props.files.find(f => f.properties?.archive && lang === f.language);

        const video_list = this.props.files.map(f => {
            const {date, language, file_id, file_name, file_type, mime_type, uid, properties} = f;
            const media_type = getMediaType(mime_type);
            if(language === this.props.lang && media_type === "video") {
                return(
                    <Table.Row key={file_id} >
                        <Table.Cell className='product-file-cell'
                                    colSpan={2}
                                    selectable
                                    onClick={() => this.selectFile(f)}>{file_name}&nbsp;&nbsp;&nbsp;
                            {properties?.archive ? <Icon name='archive' color={uid ? 'green' : 'red'} /> : null}
                        </Table.Cell>
                        <Table.Cell width={3}>{file_type}</Table.Cell>
                        <Table.Cell>{date}</Table.Cell>
                    </Table.Row>
                )
            } else {
                return null
            }
            }
        );

        const audio_list = this.props.files.map(f => {
                const {date, language, file_id, file_name, file_type, mime_type, uid, properties} = f;
            const media_type = getMediaType(mime_type);
                if(language === this.props.lang && media_type === "audio") {
                    return(
                        <Table.Row key={file_id} >
                            <Table.Cell className='product-file-cell'
                                        colSpan={2}
                                        selectable
                                        onClick={() => this.selectFile(f)}>{file_name}&nbsp;&nbsp;&nbsp;
                                {properties?.archive ? <Icon name='archive' color={uid ? 'green' : 'red'} /> : null}
                            </Table.Cell>
                            <Table.Cell width={3}>{file_type}</Table.Cell>
                            <Table.Cell>{date}</Table.Cell>
                        </Table.Row>
                    )
                } else {
                    return null
                }
            }
        );

        const other_list = this.props.files.map(f => {
                const {date, language, file_id, file_name, file_type, mime_type, uid, properties} = f;
                const media_type = getMediaType(mime_type);
                if(language === this.props.lang && media_type === "other") {
                    return(
                        <Table.Row key={file_id} >
                            <Table.Cell className='product-file-cell'
                                        colSpan={2}
                                        selectable
                                        onClick={() => this.selectFile(f)}>{file_name}&nbsp;&nbsp;&nbsp;
                                {properties?.archive ? <Icon name='archive' color={uid ? 'green' : 'red'} /> : null}
                            </Table.Cell>
                            <Table.Cell width={3}>{file_type}</Table.Cell>
                            <Table.Cell>{date}</Table.Cell>
                        </Table.Row>
                    )
                } else {
                    return null
                }
            }
        );

        return (
            <Table basic='very'>
                <FileManager product_id={product_id}
                             mdb_file={mdb_file}
                             to_mdb={to_mdb}
                             metadata={this.props.metadata}
                             user={this.props.user}
                             file_data={file_data}
                             source={source}
                             show_filemanager={show_filemanager}
                             product={this.props.product}
                             getProductFiles={this.props.getProductFiles}
                             toggleFileManager={this.toggleFileManager} />
                <Table.Header>
                    <Table.Row>
                        <Table.Cell singleLine width={3}>Title&nbsp;&nbsp;&nbsp;
                            <Button compact basic color='grey'>{name || " ..."}</Button>
                        </Table.Cell>
                        <Table.Cell singleLine>Description&nbsp;&nbsp;&nbsp;
                                <Popup
                                    trigger={<Button compact basic color='grey' className='overflow'>{description || " ..."}</Button>}
                                    content={description || " ..."}
                                    inverted
                                />
                        </Table.Cell>
                        <Table.Cell width={1}>
                            {lang_permission ?
                                <Button compact basic color='blue' onClick={this.props.toggleAddLanguage} >EDIT</Button>
                                : null}
                        </Table.Cell>
                        <Table.Cell width={2} />
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell colSpan={3}>Files &nbsp;&nbsp;&nbsp;
                            {lang_permission ?
                            <Button basic compact positive
                                    onClick={this.toggleUpload}>ADD FILE</Button>
                                : null }
                            </Table.Cell>
                        <Table.Cell />
                        <FilesUpload product_id={product_id}
                                     to_mdb={to_mdb}
                                     language={lang}
                                     file_name={lang_file_name}
                                     show_upload={show_upload}
                                     onFileUploaded={this.onFileUploaded}
                                     toggleUpload={this.toggleUpload} />
                    </Table.Row>
                </Table.Header>
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1} onClick={() => this.setState({active: "video"})}>
                            <Icon link name={active === "video" ? 'angle up' : 'angle down'} />Video &nbsp;
                            <Label size='tiny' color='grey' content={video_list.filter(f=>f).length} />
                        </Table.Cell>
                    </Table.Row>
                    {active === "video" ? video_list : null}
                </Table.Header>
                <br />
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1} onClick={() => this.setState({active: "audio"})}>
                            <Icon link name={active === "audio" ? 'angle up' : 'angle down'} />Audio &nbsp;
                            <Label size='tiny' color='grey' content={audio_list.filter(f=>f).length} />
                        </Table.Cell>
                    </Table.Row>
                    {active === "audio" ? audio_list : null}
                </Table.Header>
                <br />
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1} onClick={() => this.setState({active: "other"})}>
                            <Icon link name={active === "other" ? 'angle up' : 'angle down'} />Other &nbsp;
                            <Label size='tiny' color='grey' content={other_list.filter(f=>f).length} />
                        </Table.Cell>
                    </Table.Row>
                    {active === "other" ? other_list : null}
                </Table.Header>
                <br />
            </Table>
        );
    }
}

export default ProductFiles;
