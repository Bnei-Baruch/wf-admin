import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

import { CONTENT_TYPES_MAPPINGS } from '../shared/consts';
import { isActive, sourcesTagsPattern } from '../shared/utils';
import BaseForm from './BaseForm';

class VirtualLessonForm extends BaseForm {

  // eslint-disable-next-line class-methods-use-this
  getActiveCollections(props) {
    const { collections, metadata: { content_type: ct } } = props;
    return (collections.get(CONTENT_TYPES_MAPPINGS[ct].collection_type) || [])
      .filter(isActive)
      .concat([{ name: 'אחר', uid: null, properties: { default_language: 'he', pattern: null } }]);
  }

  suggestName(diff) {
    const {
            content_type: contentType,
            selected_collection: sIdx,
            topic,
            language,
            lecturer,
            has_translation: hasTranslation,
            active_collections: activeCollections,
            capture_date: captureDate,
            film_date: filmDate,
            sources,
            tags,
            major
          } = Object.assign({}, this.state, diff || {});

    const collection = activeCollections[sIdx];
    const pattern    = collection ? collection.properties.pattern : '';

    let suffix = topic;
    if (!suffix) {
      suffix = sourcesTagsPattern(sources, tags, major);
    }

    // eslint-disable-next-line prefer-template
    const name = (hasTranslation ? 'mlt' : language) +
      '_o_' +
      lecturer +
      '_' +
      (this.props.metadata.label_id ? filmDate : captureDate) +
      '_' +
      CONTENT_TYPES_MAPPINGS[contentType].pattern +
      (pattern ? `_${pattern}` : '') +
      (suffix ? `_${suffix}` : '');

    return {
      pattern,
      auto_name: name.toLowerCase().trim(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">פרטי השיעור</Header>;
  }

  renderForm() {
    const { metadata } = this.props;

    return (
      <Grid.Row columns={3} className="bb-interesting">
        <Grid.Column width={10}>
          <Grid>
            <Grid.Row>
              <Grid.Column>
                {this.renderCollection()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderTopic()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderTags()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderSources()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
        <Grid.Column width={2} />
        <Grid.Column width={4}>
          <Grid className="bb-less-interesting">
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
            <Grid.Row>
              <Grid.Column>
                {this.renderRequireTest()}
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

export default VirtualLessonForm;
