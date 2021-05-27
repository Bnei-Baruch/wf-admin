import React, {Component} from 'react'
import {getData, putData, removeData, WFDB_BACKEND, WFSRV_BACKEND, postData, getToken} from '../../shared/tools';
import {Menu, Segment, Label, Button, Grid, Dropdown, List, Divider, Input, Icon} from 'semantic-ui-react'
import {CT_VIDEO_PROGRAM, dep_options} from "../../shared/consts";
import DatePicker from "react-datepicker";
import he from "date-fns/locale/he";
import ProductFiles from "./ProductFiles";
import FilesUpload from "../Upload/FilesUpload";
import AddLanguage from "./AddLanguage";
import {fetchCollections} from "../CIT/shared/store";
import {isActive} from "../CIT/shared/utils";

class ProductsManager extends Component {

    state = {
        active: null,
        collections: [],
        date: new Date(),
        filters: {},
        drop_zone: false,
        insert_open: false,
        insert_button: true,
        inserting: false,
        product_name: "",
        products: [],
        files: [],
        product_data: {},
        filedata: {},
        kmedia_option: false,
        language: "",
        pattern: "",
        locale: he,
        original_language: "heb",
        metadata: {},
        renaming: false,
        rename_button: false,
        send_button: true,
        sending: false,
        special: "censored",
        source: null,
        note_area: "",
        show_filters: true,
    };

    componentDidMount() {
        this.getProducts();
        fetchCollections(data => {
            const collections = this.getActiveCollections(data);
            this.setState({collections});
        });
    };



    componentWillUnmount() {
        clearInterval(this.state.ival);
    };

    // eslint-disable-next-line class-methods-use-this
    getActiveCollections = (collections) => {
        const active = (collections.get(CT_VIDEO_PROGRAM) || []).filter(isActive);

        active.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        console.log(active)
        return active;
    };

    getProducts = () => {
        const {filters} = this.state;
        const query = Object.keys(filters).map(f => f + "=" + filters[f]);
        let path = Object.keys(filters).length === 0 ? 'products' : 'products/find?' + query.join('&');
        getData(path, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], add_language: false, drop_zone: false})
        });
    };

    findProducts = () => {
        const {language, date} = this.state;
        getData(`products/find?language=${language}&date=${date}`, products => {
            console.log(products)
            this.setState({products: products, product_id: null, files: [], add_language: false, drop_zone: false})
        });
    };

    getProductFiles = (product_id) => {
        if(!this.state.language) return
        //TODO: Add dynamic sql here
        getData(`files/${this.state.language}?product_id=${product_id}`, (files) => {
            console.log(":: Files DB Data: ", files);
            this.setState({product_id, files, add_language: false, drop_zone: false});
        });
    };

    selectProduct = (product_data) => {
        console.log(":: ProductsAdmin - selected product: ", product_data);
        this.props.setProduct(product_data.product_id);

        // Check if master file is added
        if(!product_data.original) {
            this.setState({product_data, source: null, active: product_data.product_id});
            return
        } else {
            // Build url for preview (take proxy if exist)
            let path = product_data.proxy ? product_data.proxy.format.filename : product_data.original.format.filename;
            let source = `${WFSRV_BACKEND}${path}`;
            this.setState({product_data, source, active: product_data.product_id});
        }
    };

    applyFilter = () => {
        this.getProducts();
    };

    setProductLang = (language) => {
        const {filters} = this.state;
        filters.language = language
        this.setState({filters, language});
    };

    selectDate = (date) => {
        const {filters} = this.state;
        filters.date = date.toISOString().slice(0,10);
        this.setState({filters, date});
    };

    selectCollection = (pattern) => {
        const {filters} = this.state;
        console.log("selectCollection: ", pattern);
        filters.pattern = pattern;
        this.setState({filters, pattern});
    };

    removeFilter = (f) => {
        const {filters} = this.state;
        delete filters[f];
        const value = f === "date" ? null : "";
        this.setState({filters, [f]: value}, () => {
            this.getProducts();
        });
    };

    getPlayer = (player) => {
        console.log(":: Trimmed - got player: ", player);
        //this.setState({player: player});
    };

    openCit = () => {
        let {product_data} = this.state;
        product_data.line = {manual_name: product_data.file_name};
        this.setState({product_data, cit_open: true});
    };

    onCancel = () => {
        this.setState({cit_open: false, insert_open: false});
    };

    removeProduct = () => {
        const {product_data} = this.state;
        removeData(`${WFDB_BACKEND}/products/${product_data.product_id}`, (cb) => {
            console.log(":: DELETE Respond: ",cb);
        });
    };

    setRemoved = () => {
        let {product_data} = this.state;
        console.log(":: Censor - set removed: ", product_data);
        this.setState({source: "", rename_button: true, send_button: true, insert_button: true});
        fetch(`${WFDB_BACKEND}/products/${product_data.product_id}/wfstatus/removed?value=true`, { method: 'POST',headers: {'Authorization': 'bearer ' + getToken()}})
    };

    setProduct = (product_id) => {
        console.log(product_id)
        if(product_id === this.state.product_id) {
            //this.setState({product_id: null, files: []});
        } else {
            this.getProductFiles(product_id);
        }
    }

    addFile = () => {
        this.setState({drop_zone: !this.state.drop_zone});
    }

    addLanguage = () => {
        console.log("addLanguage")
        this.setState({add_language: true});
    }

    render() {

        const {filters, pattern, collections, date, show_filters, products, locale, drop_zone, add_language, language, files} = this.state;

        const products_list = products.map(data => {
                const {product_name, product_id, i18n, date, language, pattern} = data;
                const product_selected = product_id === this.state.product_id;
                const name = i18n[language] ? i18n[language].name : product_name;
                const description = i18n[language] ? i18n[language].description : "None";
                return (<List.Item key={product_id} active={product_id === this.state.product_id}>
                    {/*<List.Content floated='right'>*/}
                    {/*    {product_selected ? <Button onClick={i18n[language] ? this.addFile : this.addLanguage}>Add File</Button> : null}*/}
                    {/*</List.Content>*/}
                    <List.Icon name='folder' />
                    <List.Content>
                        <List.Header onClick={() => this.setProduct(product_id)} >
                            <Grid columns='equal'>
                                <Grid.Row>
                                    <Grid.Column width={8}>{name}</Grid.Column>
                                    <Grid.Column>{date}</Grid.Column>
                                    <Grid.Column>{pattern}</Grid.Column>
                                    <Grid.Column>{language}</Grid.Column>
                                    <Grid.Column>
                                        {product_selected ? <Button onClick={i18n[language] ? this.addFile : this.addLanguage}>Add File</Button> : null}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </List.Header>
                        {product_selected ? <List.Content>{description}</List.Content> : null}
                        {product_selected && add_language ? <AddLanguage language={language} product_id={product_id} getProducts={this.getProducts} /> : null}
                        {product_selected && drop_zone ? <FilesUpload product_id={product_id} language={language} /> : ''}
                        {product_selected ? <ProductFiles user={this.props.user} files={files} ref="files" /> : null}
                    </List.Content>
                </List.Item>)
            }
        );

        const col_options = collections.map(data => {
            if(collections.length > 0) {
                const {uid, name, properties:{pattern}} = data;
                return({key: uid, value: pattern, text: name})
            }
        });

        const active_filters = Object.keys(filters).map(f => {
            return (<Label key={f} as='a' size='big' color='blue'>{f}
                      <Icon name='delete' onClick={() => this.removeFilter(f)}/>
                    </Label>)
        });

        return (
            <Segment textAlign='left' className="ingest_segment" color='green' raised>
                <Label as='a' attached='top' size='big' >
                    <Icon name='filter' size='big' color={show_filters ? 'green' : 'grey'} onClick={() => this.setState({show_filters: !this.state.show_filters})} />
                    {active_filters}
                </Label>
                <br /><br /><br />
                {show_filters ?
                <Menu secondary>
                    <Menu.Item>
                        <Button color='blue'
                                disabled={Object.keys(filters).length === 0}
                                onClick={this.applyFilter}>Apply
                        </Button>
                    </Menu.Item>
                    <Menu.Item>
                        <DatePicker
                            className="datefilter"
                            locale={locale}
                            customInput={<Input action={{ icon: 'calendar' }} actionPosition='left' placeholder='Dagte...'  />}
                            dateFormat="yyyy-MM-dd"
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            maxDate={new Date()}
                            openToDate={new Date()}
                            selected={date ? date : null}
                            placeholderText="Date:"
                            onChange={this.selectDate}
                        />
                    </Menu.Item>
                        <Menu.Item>
                            <Dropdown className='icon' button labeled icon='world'
                                // error={!language}
                                placeholder="Language:"
                                selection
                                options={dep_options}
                                language={language}
                                onChange={(e,{value}) => this.setProductLang(value)}
                                value={language} >
                            </Dropdown>
                        </Menu.Item>
                        <Menu.Item>
                            <Dropdown className='icon' button labeled icon='tag'
                                // error={!pattern}
                                search
                                selection
                                options={col_options}
                                placeholder='Collections:'
                                value={pattern}
                                onChange={(e,{value}) => this.selectCollection(value)}
                            />
                        </Menu.Item>
                        <Menu.Menu position='right'>
                        </Menu.Menu>
                    </Menu> : null}

                <Grid columns='equal' inverted padded relaxed='very' >
                    <Grid.Row>
                        <Grid.Column width={8} color='grey'>Title</Grid.Column>
                        <Grid.Column color='grey'>Date</Grid.Column>
                        <Grid.Column color='grey'>Collection</Grid.Column>
                        <Grid.Column color='grey'>Language</Grid.Column>
                        <Grid.Column color='grey'>Action</Grid.Column>
                    </Grid.Row>
                </Grid>
                <List selection animated divided relaxed='very'>
                    {products_list}
                </List>
            </Segment>
        );
    }
}

export default ProductsManager;
