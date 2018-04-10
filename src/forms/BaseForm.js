import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Dropdown, Grid, Header, Icon, Input, Label, List } from 'semantic-ui-react';

import {
  ARTIFACT_TYPES,
  CONTENT_TYPES_MAPPINGS,
  CT_FULL_LESSON,
  CT_LELO_MIKUD,
  CT_LESSON_PART,
  CT_VIDEO_PROGRAM_CHAPTER,
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  EVENT_CONTENT_TYPES,
  EVENT_PART_TYPES,
  LANGUAGES,
  LECTURERS,
  LESSON_PARTS_OPTIONS,
  MDB_LANGUAGES
} from '../shared/consts';
import { findPath, today } from '../shared/utils';
import { Metadata, SourcesTree, TagsTree } from '../shared/shapes';
import SourceSelector from '../components/SourceSelector';
import TagSelector from '../components/TagSelector';
import FileNamesWidget from '../components/FileNamesWidget';
import CassetteDayPicker from '../components/CassetteDayPicker';

class BaseForm extends Component {

  static propTypes = {
    metadata: Metadata,
    availableSources: SourcesTree,
    availableTags: TagsTree,
    collections: PropTypes.instanceOf(Map),
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
    afterClear: PropTypes.bool,
  };

  static defaultProps = {
    metadata: EMPTY_OBJECT,
    availableSources: EMPTY_ARRAY,
    availableTags: EMPTY_ARRAY,
    collections: new Map(),
    afterClear: false,
  };

  constructor(props) {
    super(props);
    this.state = this.getInitialState(props);
  }

  getInitialState(props) {
    // This should be created a new every time or deep copied...
    const defaultState = {
      language: LANGUAGES[0].value,
      lecturer: LECTURERS[0].value,
      has_translation: true,
      capture_date: today(),
      film_date: today(),
      require_test: false,
      manual_name: null,
      sources: [],
      tags: [],
      major: {},
      pattern: '',  // given in suggestName

      // content_type specific
      part: 1,
      part_type: 0,
      number: 1,
      artifact_type: ARTIFACT_TYPES[0].value,
      episode: '1',

      // temporary
      error: null,
      active_collections: [],
      selected_collection: 0,
      topic: '',
    };

    const state       = Object.assign({}, defaultState, props.metadata);
    state.manual_name = state.manual_name || null;

    // map sources to their path
    if (Array.isArray(state.sources)) {
      state.sources = props.availableSources.length > 0 ?
        state.sources.map(x => findPath(props.availableSources, x)) :
        [];
    } else {
      state.sources = [];
    }

    // map tags to their path
    if (Array.isArray(state.tags)) {
      state.tags = props.availableTags.length > 0 ?
        state.tags.map(x => findPath(props.availableTags, x)) :
        [];
    } else {
      state.tags = [];
    }

    // filter active collections and lookup specified collection
    state.active_collections = this.getActiveCollections(props);
    if (props.metadata.collection_uid) {
      const idx                 = state.active_collections
        .findIndex(x => x.uid === props.metadata.collection_uid);
      state.selected_collection = idx > -1 ? idx : 0;
    }

    // adjust default language if there's a property of the collection
    if (state.active_collections.length > state.selected_collection) {
      const defaultLang = state.active_collections[state.selected_collection].properties.default_language;
      if (defaultLang) {
        state.language = MDB_LANGUAGES[defaultLang];
      }
    }

    Object.assign(state, this.suggestName(state));

    return state;
  }

  componentWillReceiveProps(nextProps) {
    const diff = {};

    // availableSources changed ?
    if (nextProps.availableSources.length > 0 &&
      nextProps.metadata.sources &&
      this.props.availableSources !== nextProps.availableSources) {
      diff.sources = nextProps.metadata.sources.map(x => findPath(nextProps.availableSources, x));
    }

    // availableTags changed ?
    if (nextProps.availableTags.length > 0 &&
      nextProps.metadata.tags &&
      this.props.availableTags !== nextProps.availableTags) {
      diff.tags = nextProps.metadata.tags.map(x => findPath(nextProps.availableTags, x));
    }

    // collections changed ?
    if (this.props.collections !== nextProps.collections) {
      // which collection should be selected after filter ?
      let sIdx     = this.state.selected_collection;
      let language = this.state.language;
      let cuid;
      if (this.state.active_collections.length > 0) {
        // current selection
        cuid = this.state.active_collections[sIdx].collection_uid;
      } else {
        // next props
        cuid = nextProps.metadata.collection_uid;
      }

      // filter active collections
      const activeCollections = this.getActiveCollections(nextProps);

      // lookup collection in filtered list
      if (cuid) {
        const idx = activeCollections.findIndex(x => x.uid === cuid);
        sIdx      = idx > -1 ? idx : 0;
      }

      // adjust default language if there's a property of the collection
      if (activeCollections.length > sIdx) {
        const defaultLang = activeCollections[sIdx].properties.default_language;
        if (defaultLang) {
          language = MDB_LANGUAGES[defaultLang];
        }
      }

      Object.assign(diff, {
        active_collections: activeCollections,
        selected_collection: sIdx,
        language,
      });
    }

    this.setStateAndName(diff);
  }

  onLanguageChange = (e, data) => {
    this.setStateAndName({ language: data.value });
  };

  onLecturerChange = (e, data) => {
    this.setStateAndName({ lecturer: data.value });
  };

  onTranslationChange = (e, data) => {
    this.setStateAndName({ has_translation: data.checked });
  };

  onRequireTestChange = (e, data) => {
    this.setState({ require_test: data.checked });
  };

  onManualEdit = (e, data) => {
    this.setState({ manual_name: data.value });
  };

  onFilmDateChange = (date) => {
    this.setStateAndName({ film_date: date });
  };

  onSourceClick(idx) {
    const major = this.updateMajor('SET', 'source', idx);
    this.setStateAndName({ major });
  }

  onTagClick(idx) {
    const major = this.updateMajor('SET', 'tag', idx);
    this.setStateAndName({ major });
  }

  onSelectedCollectionChange = (e, data) => {
    const sIdx       = data.value;
    const collection = this.state.active_collections[sIdx];
    let language     = this.state.language;
    if (collection.properties.default_language) {
      language = MDB_LANGUAGES[collection.properties.default_language];
    }
    this.setStateAndName({ selected_collection: sIdx, language });
  };

  onPartChange = (e, data) => {
    const part = data.value;
    this.setStateAndName({
      part,
      error: (part === 0) ? null : this.state.error
    });
  };

  onArtifactTypeChange = (e, data) => {
    this.setStateAndName({ artifact_type: data.value });
  };

  onPartTypeChange = (e, data) => {
    this.setStateAndName({ part_type: data.value });
  };

  onNumberChange = (e, data) => {
    const number = Number.parseInt(data.value, 10);
    if (Number.isNaN(number)) {
      this.setStateAndName({
        number: 1,
        error: 'שדה מספר לא יכול להכיל אותיות'
      });
    } else if (number < 0) {
      this.setStateAndName({
        number: 1,
        error: 'שדה מספר חייב להיות גדול מאפס'
      });
    } else {
      this.setStateAndName({ number, error: null });
    }
  };

  onTopicChange = (e, data) => {
    const clean = data.value.trim().toLowerCase().replace(/[^0-9a-z]+/g, '-');
    this.setStateAndName({ topic: clean });
  };

  onEpisodeChange = (e, data) => {
    const clean = data.value.trim().split(/\s+/).join('_');
    this.setStateAndName({ episode: clean });
  };

  // eslint-disable-next-line class-methods-use-this,no-unused-vars
  getActiveCollections(props) {
    return EMPTY_ARRAY;
  }

  setStateAndName(diff) {
    this.setState({ ...diff, ...this.suggestName(diff) });
  }

  cleanData(data) {
    /* eslint-disable no-param-reassign */

    // temporary
    delete data.error;
    delete data.topic;
    delete data.selected_collection;
    delete data.active_collections;

    // Cassette mode only
    if (!this.props.metadata.label_id) {
      delete data.film_date;
    }

    // content_type specific
    // number is not considered for removal since it mostly arrives from workflow
    const ctSpecificToClean = new Set(['part', 'part_type', 'artifact_type', 'episode']);

    switch (data.content_type) {
    case CT_LESSON_PART:
      ctSpecificToClean.delete('part');
      ctSpecificToClean.delete('artifact_type');
      break;
    case CT_FULL_LESSON:
      ctSpecificToClean.delete('part');
      break;
    case CT_VIDEO_PROGRAM_CHAPTER:
      ctSpecificToClean.delete('episode');
      break;
    default:
      break;
    }

    if (EVENT_CONTENT_TYPES.includes(data.collection_type)) {
      ctSpecificToClean.delete('part_type');
    }

    ctSpecificToClean.forEach(x => delete data[x]);

    return data;
  }

  prepareData() {
    const data           = { ...this.state };
    data.final_name      = data.manual_name || data.auto_name;
    data.collection_type = CONTENT_TYPES_MAPPINGS[data.content_type].collection_type;
    data.sources         = data.sources.map(x => x[x.length - 1].uid);
    data.tags            = data.tags.map(x => x[x.length - 1].uid);

    if (data.active_collections.length > data.selected_collection) {
      const selected      = data.active_collections[data.selected_collection];
      data.collection_uid = selected.uid;
    }

    return this.cleanData(data);
  }

  handleSubmit = (e) => {
    if (!this.validate()) {
      return;
    }

    const data = this.prepareData();
    this.setState(this.getInitialState(this.props), () => this.props.onSubmit(e, data));
  };

  handleCancel = (e) => {
    this.setState(this.getInitialState(this.props), () => this.props.onCancel(e));
  };

  handleClear = (e) => {
    this.props.onClear(e);
  };

  addSource = (selection) => {
    const sources = this.state.sources;

    // Prevent duplicates
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].length === selection.length &&
        sources[i].every((x, j) => selection[j] === x)) {
        return;
      }
    }

    sources.push(selection);
    const major = this.updateMajor('ADD', 'source', sources.length - 1);
    this.setStateAndName({ sources, major, error: null });
  };

  removeSource(e, idx) {
    e.stopPropagation(); // don't bubble up to onSourceClick

    const sources = this.state.sources;
    const major   = this.updateMajor('REMOVE', 'source', idx);

    sources.splice(idx, 1);
    this.setStateAndName({ sources, major });
  }

  addTag = (selection) => {
    const { tags } = this.state;

    // Prevent duplicates
    for (let i = 0; i < tags.length; i++) {
      if (tags[i].length === selection.length && tags[i].every((x, j) => selection[j] === x)) {
        return;
      }
    }

    tags.push(selection);
    const major = this.updateMajor('ADD', 'tag', tags.length - 1);
    this.setStateAndName({ tags, major, error: null });
  };

  removeTag(e, idx) {
    e.stopPropagation(); // don't bubble up to onTagClick

    const tags  = this.state.tags;
    const major = this.updateMajor('REMOVE', 'tag', idx);

    tags.splice(idx, 1);
    this.setStateAndName({ tags, major });
  }

  updateMajor(op, type, idx) {
    let major = this.state.major;

    switch (op) {
    case 'SET':
      major = { type, idx };
      break;
    case 'ADD':
      if (!major.type) {
        major = { type, idx };
      }
      break;
    case 'REMOVE':
      // If the currently selected major is removed,
      // pass the torch to the next best option.
      // Else keep the index in sync.
      if (major.type === type) {
        if (major.idx !== idx && idx < major.idx) {
          major.idx--;    // we've been shifted left...
        } else if (major.idx === idx) {
          let selection = this.state[`${type}s`];
          if (selection.length > 1) {
            // keep it in the family
            major = { type, idx: Math.max(0, idx - 1) };
          } else {
            // try the other type
            const type2 = type === 'source' ? 'tag' : 'source';
            selection   = this.state[`${type2}s`];
            if (selection.length > 0) {
              major = { type: type2, idx: 0 };
            } else {
              // no replacement
              major = {};
            }
          }
        }
      }
      break;
    default:
      break;
    }

    return major;
  }

  suggestName(diff) {
    const {
            language,
            lecturer,
            has_translation: hasTranslation,
            capture_date: captureDate,
            content_type: contentType,
            number,
            film_date: filmDate,
          } = Object.assign({}, this.state, diff || {});

    // eslint-disable-next-line prefer-template
    const name = (hasTranslation ? 'mlt' : language) +
      '_o_' +
      lecturer +
      '_' +
      (this.props.metadata.label_id ? filmDate : captureDate) +
      '_' +
      CONTENT_TYPES_MAPPINGS[contentType].pattern +
      '_n' +
      (number || 1) +
      (contentType === CT_FULL_LESSON ? '_full' : '');

    return {
      pattern: contentType.toLowerCase(),
      auto_name: name.toLowerCase().trim(),
    };
  }

  validate() {
    return !this.state.error;
  }

  renderSelectedSources() {
    const { sources, major } = this.state;

    if (sources.length === 0) {
      return (
        <List className="bb-selected-sources-list">
          <List.Item>
            <Header as="h5" color="grey">אין חומרי לימוד</Header>
          </List.Item>
        </List>
      );
    }

    return (
      <List className="bb-selected-sources-list">
        {
          sources.map((x, i) => {
            const title   = x.map(y => y.name).join(', ');
            const isMajor = major.type === 'source' && major.idx === i;

            return (
              <List.Item key={x[x.length - 1].id}>
                <Label
                  color="blue"
                  size="large"
                  basic={!isMajor}
                  onClick={() => this.onSourceClick(i)}
                >
                  {title}
                  <Icon name="delete" onClick={e => this.removeSource(e, i)} />
                </Label>
              </List.Item>
            );
          })
        }
      </List>
    );
  }

  renderSelectedTags() {
    const { tags, major } = this.state;

    if (tags.length === 0) {
      return (
        <List className="bb-selected-tags-list">
          <List.Item>
            <Header as="h5" color="grey">אין תגיות</Header>
          </List.Item>
        </List>
      );
    }

    return (
      <div className="bb-selected-tags-list">
        {
          tags.map((x, i) => {
            const isMajor = major.type === 'tag' && major.idx === i;
            return (
              <Label
                color="pink"
                size="large"
                basic={!isMajor}
                key={x[x.length - 1].id}
                onClick={() => this.onTagClick(i)}
              >
                {x[x.length - 1].label}
                <Icon name="delete" onClick={e => this.removeTag(e, i)} />
              </Label>
            );
          })
        }
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">פרטי התוכן</Header>;
  }

  renderLanguage() {
    const { language } = this.state;
    return (
      <div>
        <Header as="h5">שפה</Header>
        <Dropdown
          selection
          fluid
          options={LANGUAGES}
          value={language}
          onChange={this.onLanguageChange}
        />
      </div>
    );
  }

  renderLecturer() {
    const { lecturer } = this.state;
    return (
      <div>
        <Header as="h5">מרצה</Header>
        <Dropdown
          selection
          fluid
          options={LECTURERS}
          value={lecturer}
          onChange={this.onLecturerChange}
        />
      </div>
    );
  }

  renderHasTranslation() {
    const { has_translation: hasTranslation } = this.state;
    return (
      <Checkbox
        label="מתורגם"
        checked={hasTranslation}
        onChange={this.onTranslationChange}
      />
    );
  }

  renderRequireTest() {
    const { require_test: requireTest } = this.state;
    return (
      <Checkbox
        label="צריך בדיקה"
        checked={requireTest}
        onChange={this.onRequireTestChange}
      />
    );
  }

  renderSources() {
    const { availableSources } = this.props;
    return (
      <div>
        <Header size="medium">חומר לימוד</Header>
        <SourceSelector tree={availableSources} onSelect={this.addSource} />
        {this.renderSelectedSources()}
      </div>
    );
  }

  renderTags() {
    const { availableTags } = this.props;
    return (
      <div>
        <Header size="medium">תגיות</Header>
        <TagSelector tree={availableTags} onSelect={this.addTag} />
        {this.renderSelectedTags()}
      </div>
    );
  }

  renderFilmDate() {
    const { metadata } = this.props;
    return (
      <div>
        <Header as="h5">תאריך</Header>
        <CassetteDayPicker onSelect={this.onFilmDateChange} defaultValue={metadata.film_date} />
      </div>
    );
  }

  renderPart() {
    const { part } = this.state;
    return (
      <div>
        <Header as="h5">חלק</Header>
        <Dropdown
          selection
          fluid
          options={LESSON_PARTS_OPTIONS}
          value={part}
          onChange={this.onPartChange}
        />
      </div>
    );
  }

  renderArtifactType() {
    const { artifact_type: artifactType } = this.state;
    return (
      <div>
        <Header as="h5">סוג</Header>
        <Dropdown
          selection
          fluid
          options={ARTIFACT_TYPES}
          disabled={artifactType === CT_LELO_MIKUD}
          value={artifactType}
          onChange={this.onArtifactTypeChange}
        />
      </div>
    );
  }

  renderCollection() {
    const { active_collections: activeCollections, selected_collection: sIdx } = this.state;
    return (
      <div>
        <Header as="h5">אוסף</Header>
        <Dropdown
          selection
          fluid
          placeholder={activeCollections.length === 0 ? 'אין אוספים פתוחים' : 'בחר אוסף'}
          options={activeCollections.map((x, i) => ({ text: x.name, value: i }))}
          value={sIdx}
          disabled={activeCollections.length === 0}
          onChange={this.onSelectedCollectionChange}
        />
      </div>
    );
  }

  renderNumber() {
    const { number } = this.state;
    return (
      <div>
        <Header as="h5">מספר</Header>
        <Input
          fluid
          defaultValue={number}
          onChange={this.onNumberChange}
        />
      </div>
    );
  }

  renderEpisode() {
    const { episode } = this.state;
    return (
      <div>
        <Header as="h5">פרק</Header>
        <Input
          fluid
          defaultValue={episode}
          onChange={this.onEpisodeChange}
        />
      </div>
    );
  }

  renderTopic() {
    const { topic } = this.state;
    return (
      <div>
        <Header as="h5">נושא</Header>
        <Input
          fluid
          defaultValue={topic}
          onChange={this.onTopicChange}
        />
      </div>
    );
  }

  renderPartType() {
    const { part_type: partType } = this.state;
    return (
      <div>
        <Header as="h5">משבצת תוכן</Header>
        <Dropdown
          selection
          fluid
          options={EVENT_PART_TYPES.map((x, i) => ({ text: x.text, value: i }))}
          value={partType}
          onChange={this.onPartTypeChange}
        />
      </div>
    );
  }

  renderForm() {
    const { metadata, afterClear } = this.props;

    return (
      <Grid.Row className="bb-interesting">
        <Grid.Column width={4}>
          {this.renderLanguage()}
        </Grid.Column>
        <Grid.Column width={4}>
          {this.renderLecturer()}
        </Grid.Column>
        <Grid.Column width={4}>
          {this.renderHasTranslation()}
        </Grid.Column>
        {
          afterClear ?
            <Grid.Column width={4}>
              {this.renderNumber()}
            </Grid.Column> :
            null
        }
        {
          metadata.label_id ?
            <Grid.Column width={4}>
              {this.renderFilmDate()}
            </Grid.Column> :
            null
        }
      </Grid.Row>
    );
  }

  render() {
    const { auto_name: autoName, manual_name: manualName, error } = this.state;

    return (
      <Grid stackable container>
        <Grid.Row columns={1}>
          <Grid.Column>
            {this.renderHeader()}
          </Grid.Column>
        </Grid.Row>
        {this.renderForm()}
        <Grid.Row columns={1}>
          <Grid.Column>
            <FileNamesWidget
              auto_name={autoName}
              manual_name={manualName}
              onChange={this.onManualEdit}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={1} textAlign="right">
          <Grid.Column>
            <Button
              content="אפס בחירה"
              color="orange"
              icon="trash outline"
              floated="left"
              onClick={this.handleClear}
            />
            {error ? <Label basic color="red" size="large">{error}</Label> : null}
            <Button onClick={this.handleCancel}>בטל</Button>
            <Button primary onClick={this.handleSubmit}>שמור</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default BaseForm;
