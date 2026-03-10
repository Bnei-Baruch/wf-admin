import React from 'react';
import { Grid, Header } from 'semantic-ui-react';

import BaseForm from './BaseForm';
import CassetteDayPicker from '../components/CassetteDayPicker';

class MealForm extends BaseForm {

  onCaptureDateChange = (date) => {
    this.setStateAndName({ capture_date: date });
  };

  renderCaptureDate() {
    const { capture_date: captureDate } = this.state;
    return (
      <div>
        <Header as="h5">תאריך</Header>
        <CassetteDayPicker onSelect={this.onCaptureDateChange} defaultValue={captureDate} />
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderHeader() {
    return <Header as="h2" color="blue">פרטי הסעודה</Header>;
  }

  renderForm() {
    const { metadata } = this.props;

    return (
      <Grid.Row columns={2} className="bb-interesting">
        <Grid.Column width={12}>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column width={8}>
                {this.renderNumber()}
              </Grid.Column>
              <Grid.Column width={8}>
                {this.renderCaptureDate()}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
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
          </Grid>
        </Grid.Column>
      </Grid.Row>
    );
  }
}

export default MealForm;
