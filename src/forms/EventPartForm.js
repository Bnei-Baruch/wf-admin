import React from 'react';
import { Dropdown, Grid, Header } from 'semantic-ui-react';

import {
  ARTIFACT_TYPES,
  CONTENT_TYPES_MAPPINGS,
  CT_FULL_LESSON,
  CT_LESSON_PART,
  EVENT_CONTENT_TYPES,
  EVENT_PART_TYPES,
  LESSON_PARTS_OPTIONS
} from '../shared/consts';
import { isActive } from '../shared/utils';
import BaseForm from './BaseForm';

class EventPartForm extends BaseForm {

  // eslint-disable-next-line class-methods-use-this
  getActiveCollections(props) {
    const { collections } = props;
    return EVENT_CONTENT_TYPES.reduce((acc, val) =>
        acc.concat((collections.get(val) || []).filter(isActive))
      , []);
  }

  cleanData(data) {
    /* eslint-disable no-param-reassign */

    // correct content_type for lesson
    data.content_type = EVENT_PART_TYPES[data.part_type].content_type;
    if (data.content_type === CT_LESSON_PART) {
      if (data.part === -1) {
        data.content_type = CT_FULL_LESSON;
      }
    }

    // collection_type from selected event
    data.collection_type = data.active_collections[data.selected_collection].type;

    return super.cleanData(data);
  }

  suggestName(diff) {
    const {
            selected_collection: sIdx,
            part_type: partType,
            language,
            lecturer,
            has_translation: hasTranslation,
            capture_date: captureDate,
            film_date: filmDate,
            number,
            part,
            active_collections: activeCollections,
            artifact_type: artifactType,
          } = Object.assign({}, this.state, diff || {});

    let pattern   = '';
    let eventType = '';
    if (activeCollections.length !== 0) {
      const e   = activeCollections[sIdx];
      pattern   = e.properties.pattern;
      eventType = e.type.replace(/_/g, '-');
    }

    let p  = '';
    let at = '';
    let pt = EVENT_PART_TYPES[partType].pattern;
    if (EVENT_PART_TYPES[partType].content_type === CT_LESSON_PART) {
      p = (part === -1) ? '_full' : `_p${part}`;
      if (artifactType !== ARTIFACT_TYPES[0].value) {
        pt = '';
        at = CONTENT_TYPES_MAPPINGS[artifactType].pattern;
      }
    }

    // eslint-disable-next-line prefer-template
    const name = (hasTranslation ? 'mlt' : language) +
      '_o_' +
      lecturer +
      '_' +
      (this.props.metadata.label_id ? filmDate : captureDate) +
      '_' +
      eventType +
      '_' +
      pt +
      at +
      (pattern ? `_${pattern}` : '') +
      '_n' +
      (Number.isNaN(number) ? 1 : number) +
      p
    ;

    return {
      pattern,
      auto_name: name.toLowerCase().trim(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">פרטי האירוע</Header>;
  }

  renderForm() {
    const { metadata }                  = this.props;
    const { part_type: partType, part } = this.state;

    return (
      <Grid.Row columns={3} className="bb-interesting">
        <Grid.Column width={9}>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                {this.renderCollection()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={2}>
              <Grid.Column width={10}>
                {this.renderPartType()}
              </Grid.Column>
              <Grid.Column width={6}>
                {this.renderNumber()}
              </Grid.Column>
            </Grid.Row>
            {
              EVENT_PART_TYPES[partType].content_type === CT_LESSON_PART ?
                <Grid.Row>
                  <Grid.Column width={6}>
                    <Header as="h5">חלק</Header>
                    <Dropdown
                      selection
                      fluid
                      options={LESSON_PARTS_OPTIONS.concat([{ text: 'גיבוי', value: -1 }])}
                      value={part}
                      onChange={this.onPartChange}
                    />
                  </Grid.Column>
                </Grid.Row> :
                null
            }
            <Grid.Row>
              <Grid.Column>
                {this.renderTags()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
        <Grid.Column width={3} />
        <Grid.Column width={4}>
          <Grid stretched className="bb-less-interesting">
            {
              EVENT_PART_TYPES[partType].content_type === CT_LESSON_PART ?
                <Grid.Row>
                  <Grid.Column>
                    {this.renderArtifactType()}
                  </Grid.Column>
                </Grid.Row> :
                null
            }
            <Grid.Row>
              <Grid.Column>
                {this.renderLanguage()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderLecturer()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderHasTranslation()}
              </Grid.Column>
            </Grid.Row>
            {
              metadata.label_id ?
                <Grid.Row>
                  <Grid.Column>
                    {this.renderFilmDate()}
                  </Grid.Column>
                </Grid.Row> :
                null
            }
          </Grid>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default EventPartForm;
