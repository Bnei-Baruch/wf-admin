import PropTypes from 'prop-types';

export const Error = PropTypes.object;

const BaseSource = {
  id: PropTypes.number,
  uid: PropTypes.string,
  type: PropTypes.string,
  parent_id: PropTypes.number,
  position: PropTypes.number,
  pattern: PropTypes.string,
  name: PropTypes.string.isRequired,
  code: PropTypes.string,
  full_name: PropTypes.string,
};

BaseSource.children = PropTypes.arrayOf(PropTypes.shape(BaseSource));
export const Source = PropTypes.shape(BaseSource);

export const SourcesTree = PropTypes.arrayOf(Source);

const BaseTag = {
  id: PropTypes.number.isRequired,
  uid: PropTypes.string,
  parent_id: PropTypes.number,
  pattern: PropTypes.string,
  label: PropTypes.string.isRequired,
};

BaseTag.children = PropTypes.arrayOf(PropTypes.shape(BaseTag));
export const Tag = PropTypes.shape(BaseTag);

export const TagsTree = PropTypes.arrayOf(Tag);

export const Metadata = PropTypes.shape({
  content_type: PropTypes.string.isRequired,
  auto_name: PropTypes.string,
  manual_name: PropTypes.string,
  final_name: PropTypes.string,
  capture_date: PropTypes.string,
  film_date: PropTypes.string,
  week_date: PropTypes.string,
  lecturer: PropTypes.string,
  language: PropTypes.string,
  has_translation: PropTypes.bool,
  require_test: PropTypes.bool,
  number: PropTypes.number,
  part: PropTypes.number,
  episode: PropTypes.string,
  collection_uid: PropTypes.string,
  artifact_type: PropTypes.string,
  part_type: PropTypes.number,
  sources: PropTypes.arrayOf(PropTypes.string),
  tags: PropTypes.arrayOf(PropTypes.string),
  major: PropTypes.shape({
    type: PropTypes.oneOf(['source', 'tag']),
    idx: PropTypes.number,
  }),
  label_id: PropTypes.string,
});
