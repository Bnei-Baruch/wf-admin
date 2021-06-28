import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

import {CONTENT_TYPES_MAPPINGS, CT_CLIPS} from '../../../shared/consts';
import {isActive, isPattern} from '../shared/utils';
import BaseForm from './BaseForm';

class ClipForm extends BaseForm {

  // eslint-disable-next-line class-methods-use-this
  getActiveCollections(props) {
    const active = (props.collections.get(CT_CLIPS) || []).filter(isActive && isPattern);
    console.log(active)
    active.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });

    return active;
  }

  suggestName(diff) {
    const {
            topic,
            content_type: contentType,
            selected_collection: sIdx,
            episode,
            language,
            lecturer,
            has_translation: hasTranslation,
            active_collections: activeCollections,
            capture_date: captureDate,
            film_date: filmDate,
          } = Object.assign({}, this.state, diff || {});

    const collection = activeCollections[sIdx];

    const pattern = collection ? collection.properties.pattern : '';

      let suffix = topic;

    // eslint-disable-next-line prefer-template
    const name = (hasTranslation ? 'mlt' : language) +
      '_o_' +
      lecturer +
      '_' +
      (filmDate ? filmDate : captureDate) +
      '_' +
      CONTENT_TYPES_MAPPINGS[contentType].pattern +
      '_' +
      pattern +
        (suffix ? `_${suffix}` : '') +
      (episode !== '' ? (Number.isNaN(Number.parseInt(episode, 10)) ? '_' : '_n') + episode : '');

    return {
      pattern,
      auto_name: name.toLowerCase().trim(),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">Clip</Header>;
  }

  renderForm() {
    const { metadata } = this.props;
    return (
      <Grid.Row columns={3} className="bb-interesting">
        <Grid.Column width={10}>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column width={12}>
                {this.renderCollection()}
              </Grid.Column>
              <Grid.Column width={4}>
                {this.renderEpisode()}
              </Grid.Column>
            </Grid.Row>
              <Grid.Row>
                  <Grid.Column>
                      {this.renderTopic()}
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
              <Grid.Row >
                  <Grid.Column>
                      {this.renderFilmDate()}
                  </Grid.Column>
              </Grid.Row>
          </Grid>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default ClipForm;
