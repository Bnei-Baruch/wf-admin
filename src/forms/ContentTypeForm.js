import React from 'react';
import PropTypes from 'prop-types';
import { Button, Grid } from 'semantic-ui-react';

import {
  CT_CHILDREN_LESSON,
  CT_CLIP,
  CT_EVENT_PART,
  CT_FRIENDS_GATHERING,
  CT_LECTURE,
  CT_LESSON_PART,
  CT_MEAL,
  CT_TRAINING,
  CT_VIDEO_PROGRAM_CHAPTER,
  CT_VIRTUAL_LESSON,
  CT_WOMEN_LESSON
} from '../shared/consts';

const ContentTypeForm = props => (
  <Grid columns="equal">
    <Grid.Row columns={2}>
      <Grid.Column>
        <Button
          fluid
          content="שיעור"
          color="blue"
          size="massive"
          onClick={() => props.onSelect(CT_LESSON_PART)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="תכנית טלוויזיה"
          color="purple"
          size="massive"
          onClick={() => props.onSelect(CT_VIDEO_PROGRAM_CHAPTER)}
        />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row columns={2}>
      <Grid.Column>
        <Button
          fluid
          content="ישיבת חברים"
          color="teal"
          size="massive"
          onClick={() => props.onSelect(CT_FRIENDS_GATHERING)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="סעודה"
          color="teal"
          size="massive"
          onClick={() => props.onSelect(CT_MEAL)}
        />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row columns={2}>
      <Grid.Column>
        <Button
          fluid
          content="שיעור וירטואלי"
          color="teal"
          size="massive"
          onClick={() => props.onSelect(CT_VIRTUAL_LESSON)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="אירוע מיוחד"
          color="teal"
          size="massive"
          onClick={() => props.onSelect(CT_EVENT_PART)}
        />
      </Grid.Column>
    </Grid.Row>
    <Grid.Row columns={5}>
      <Grid.Column>
        <Button
          fluid
          content="קליפ"
          color="grey"
          onClick={() => props.onSelect(CT_CLIP)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="הרצאה"
          color="grey"
          onClick={() => props.onSelect(CT_LECTURE)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="הכשרה"
          color="grey"
          onClick={() => props.onSelect(CT_TRAINING)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="שיעור נשים"
          color="grey"
          onClick={() => props.onSelect(CT_WOMEN_LESSON)}
        />
      </Grid.Column>
      <Grid.Column>
        <Button
          fluid
          content="שיעור ילדים"
          color="grey"
          onClick={() => props.onSelect(CT_CHILDREN_LESSON)}
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

ContentTypeForm.propTypes = {
  onSelect: PropTypes.func.isRequired
};

export default ContentTypeForm;
