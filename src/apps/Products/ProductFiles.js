import React, {Component} from 'react'
import {WFDB_BACKEND, WFSRV_BACKEND, postData} from '../../shared/tools';
import {Button, Table, Icon, Popup} from 'semantic-ui-react'
import FilesUpload from "../Upload/FilesUpload";
import FileManager from "./FileManager";

class ProductFiles extends Component {

    state = {
        active: null,
        name: this.props.metadata.name,
        description: this.props.metadata.description,
        file_data: {},
    };

    selectFile = (file_data) => {
        console.log(":: ProductFiles - selected file: ", file_data);
        let path = file_data.properties.url;
        let source = `${WFSRV_BACKEND}${path}`;
        this.setState({file_data, source, active: file_data.file_id, show_filemanager: true});
    };

    editLanguage = () => {
        const {name, description} = this.state;
        const language = this.props.lang;
        const {product_id} = this.props;
        const data = {name, description};
        postData(`${WFDB_BACKEND}/products/${product_id}/i18n/${language}`, data, (cb) => {
            console.log(":: PUT Respond: ",cb);
            this.props.getProducts();
        });
    };

    onFileUploaded = () => {
        this.setState({upload: false});
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

        const {active, source, show_filemanager, show_upload, file_data, name, description} = this.state;
        const {metadata} = this.props;

        const files_list = this.props.files.map(f => {
            const {date, language, file_id, file_name} = f;
            if(language === this.props.lang) {
                return(
                    <Table.Row key={file_id} >
                        <Table.Cell className='product-file-cell'
                                    colSpan={3}
                                    selectable
                                    onClick={() => this.selectFile(f)}>{file_name}</Table.Cell>
                        <Table.Cell>{date}</Table.Cell>
                    </Table.Row>
                )
            }
            }
        );

        return (
            <Table basic='very'>
                <FileManager product_id={this.props.product_id} file_data={file_data} source={source} show_filemanager={show_filemanager}
                             onFileUploaded={this.onFileUploaded}
                             toggleFileManager={this.toggleFileManager} />
                <Table.Header>
                    <Table.Row>
                        <Table.Cell singleLine width={3}>Title&nbsp;&nbsp;&nbsp;<Button compact basic color='grey'>{name}</Button>
                            {/*<Input fluid placeholder='Title...'*/}
                            {/*       label={{ basic: true, content: 'Title' }}*/}
                            {/*       value={name} onChange={e => this.setState({name: e.target.value})} />*/}
                        </Table.Cell>
                        <Table.Cell singleLine>Description&nbsp;&nbsp;&nbsp;
                            <Popup
                                trigger={<Button compact basic color='grey' className='overflow'>{description}</Button>}
                                content={description}
                                inverted
                            />
                            {/*<Input fluid placeholder='Description...'*/}
                            {/*       label={{ basic: true, content: 'Description' }}*/}
                            {/*       value={description} onChange={e => this.setState({description: e.target.value})}/>*/}
                        </Table.Cell>
                        <Table.Cell />
                        <Table.Cell width={2}><Button compact basic color='blue' onClick={this.editLanguage}>EDIT</Button></Table.Cell>
                    </Table.Row>
                    <Table.Row>
                        <Table.Cell colSpan={3}>Files &nbsp;&nbsp;&nbsp;
                            <Button basic compact positive
                                    onClick={this.toggleUpload}>ADD FILE</Button></Table.Cell>
                        <Table.Cell />
                        <FilesUpload product_id={this.props.product_id} language={this.props.lang} show_upload={show_upload}
                                     onFileUploaded={this.onFileUploaded}
                                     toggleUpload={this.toggleUpload} />
                    </Table.Row>
                </Table.Header>
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1}><Icon link name={true ? 'angle up' : 'plus'} />Video</Table.Cell>
                    </Table.Row>
                    {files_list}
                </Table.Header>
                <br />
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1}><Icon link name={true ? 'angle down' : 'plus'} />Audio</Table.Cell>
                    </Table.Row>
                </Table.Header>
                <br />
                <Table.Header fullWidth className='files_list'>
                    <Table.Row>
                        <Table.Cell colSpan={4} width={1}><Icon link name={true ? 'angle down' : 'plus'} />Other</Table.Cell>
                    </Table.Row>
                </Table.Header>
                <br />
            </Table>
        );
    }
}

export default ProductFiles;
