import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';

import {
  CT_CHILDREN_LESSON,
  CT_EVENT_PART,
  CT_LECTURE,
  CT_LELO_MIKUD,
  CT_LESSON_PART,
  CT_UNKNOWN,
  CT_VIDEO_PROGRAM_CHAPTER,
  CT_VIRTUAL_LESSON,
  CT_WOMEN_LESSON,
  EVENT_CONTENT_TYPES
} from './shared/consts';
import { Metadata } from './shared/shapes';
import { fetchCollections, fetchSources, fetchTags } from './shared/store';
import ContentTypeForm from './forms/ContentTypeForm';
import BaseForm from './forms/BaseForm';
import LessonForm from './forms/LessonForm';
import TVShowForm from './forms/TVShowForm';
import VirtualLessonForm from './forms/VirtualLessonForm';
import EventPartForm from './forms/EventPartForm';

import './forms/forms.css';

class CIT extends Component {

  static propTypes = {
    metadata: Metadata,
    onComplete: PropTypes.func,
    onCancel: PropTypes.func,
  };

  static defaultProps = {
    metadata: {
      content_type: null,
    },
    onComplete: noop,
    onCancel: noop,
  };

  constructor(props) {
    super(props);
    this.state = {
      metadata: { ...props.metadata },
      store: {
        sources: [],
        tags: [],
        collections: new Map(),
      },
      afterClear: false,
    };
  }

  componentDidMount() {
    fetchSources(sources => this.setState({ store: { ...this.state.store, sources } }));
    fetchTags(tags => this.setState({ store: { ...this.state.store, tags } }));
    fetchCollections(collections => this.setState({ store: { ...this.state.store, collections } }));
  }

  onCTSelected = (contentType) => {
    this.setState({ metadata: { ...this.state.metadata, content_type: contentType } });
  };

  onFormSubmit = (e, metadata) => {
    if (this.props.onComplete) {
      this.props.onComplete(metadata);
    } else {
      this.onFormCancel();
    }
  };

  onFormCancel = (e) => {
    if (this.props.onCancel) {
      this.props.onCancel(e);
    } else {
      this.onCTSelected(null);
    }
  };

  onClear = () => {
    // make a fresh copy of input metadata
    const metadata = { ...this.props.metadata };

    // set content_type to UNKNOWN
    metadata.content_type = CT_UNKNOWN;

    // delete all fields coming from us (leave what's given from external embedder, i.e. workflow)
    [
      'manual_name',
      'collection_uid',
      'collection_type',
      'sources',
      'tags',
      // 'artifact_type',
      'number',
      'part',
      'part_type',
      'episode',
      'pattern',
      'major',
      'film_date',
    ].forEach(f => delete metadata[f]);

    // artifact_type may not come from us but from embedder
    if (metadata.artifact_type !== CT_LELO_MIKUD) {
      delete metadata.artifact_type;
    }

    this.setState({ metadata, afterClear: true });
  };

  render() {
    const { store, metadata, afterClear } = this.state;

    const formProps = {
      metadata,
      afterClear,
      onSubmit: this.onFormSubmit,
      onCancel: this.onFormCancel,
      onClear: this.onClear,
      collections: store.collections,
      availableSources: store.sources,
      availableTags: store.tags,
    };

    let el;
    if (metadata.content_type && metadata.content_type !== CT_UNKNOWN) {
      let FormComponent;

      // This is here to allow reloading compatibility with given metadata saved from EventForm
      if (EVENT_CONTENT_TYPES.includes(metadata.collection_type)) {
        FormComponent = EventPartForm;
      } else {
        switch (metadata.content_type) {
        case CT_LESSON_PART:
          FormComponent = LessonForm;
          break;
        case CT_VIDEO_PROGRAM_CHAPTER:
          FormComponent = TVShowForm;
          break;
        case CT_EVENT_PART:
          FormComponent = EventPartForm;
          break;
        case CT_LECTURE:
        case CT_CHILDREN_LESSON:
        case CT_WOMEN_LESSON:
        case CT_VIRTUAL_LESSON:
          FormComponent = VirtualLessonForm;
          break;
        default:
          FormComponent = BaseForm;
          break;
        }
      }
      el = <FormComponent {...formProps} />;
    } else {
      el = <ContentTypeForm onSelect={this.onCTSelected} />;
    }

    return (
      <div style={{ direction: 'rtl' }}>
        {el}
      </div>
    );
  }
}

export default CIT;
