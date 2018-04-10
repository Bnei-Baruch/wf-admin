import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

import { ARTIFACT_TYPES, CONTENT_TYPES_MAPPINGS } from '../shared/consts';
import { sourcesTagsPattern } from '../shared/utils';
import BaseForm from './BaseForm';

class LessonForm extends BaseForm {

  suggestName(diff) {
    const {
            content_type: contentType,
            language,
            lecturer,
            has_translation: hasTranslation,
            sources,
            tags,
            capture_date: captureDate,
            film_date: filmDate,
            number,
            part,
            artifact_type: artifactType,
            major
          } = Object.assign({}, this.state, diff || {});

    let pattern = sourcesTagsPattern(sources, tags, major);

    // override lesson preparation value
    if (pattern === '' && part === 0) {
      pattern = 'achana';
    }
    pattern = pattern.toLowerCase().trim();

    // eslint-disable-next-line prefer-template
    const name = (hasTranslation ? 'mlt' : language) +
      '_o_' +
      lecturer +
      '_' +
      (this.props.metadata.label_id ? filmDate : captureDate) +
      '_' +
      CONTENT_TYPES_MAPPINGS[artifactType === ARTIFACT_TYPES[0].value ? contentType : artifactType].pattern +
      (pattern ? `_${pattern}` : '') +
      '_n' +
      (number || 1) +
      '_' +
      'p' + part;

    return {
      pattern,
      auto_name: name.toLowerCase().trim(),
    };
  }

  validate() {
    if (this.isValidClassification()) {
      return true;
    }

    this.setState({ error: 'נא לבחור חומרי לימוד או תגיות' });
    return false;
  }

  isValidClassification() {
    const { sources, tags, part, artifact_type: artifactType } = this.state;
    return sources.length !== 0 ||
      tags.length !== 0 ||
      part === 0 ||
      artifactType !== 'main';
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">פרטי השיעור</Header>;
  }

  renderForm() {
    const { metadata } = this.props;

    return (
      <Grid.Row columns={2} className="bb-interesting">
        <Grid.Column width={12}>
          <Grid>
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
            {
              this.props.afterClear ?
                <Grid.Row>
                  <Grid.Column width={6}>
                    {this.renderNumber()}
                  </Grid.Column>
                </Grid.Row>
                : null
            }
          </Grid>
        </Grid.Column>
        <Grid.Column width={4}>
          <Grid className="bb-less-interesting">
            <Grid.Row>
              <Grid.Column>
                {this.renderPart()}
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column>
                {this.renderArtifactType()}
              </Grid.Column>
            </Grid.Row>
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

export default LessonForm;
