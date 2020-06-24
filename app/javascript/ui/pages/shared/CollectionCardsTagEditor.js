import _ from 'lodash'
import PropTypes from 'prop-types'
import { toJS, computed, action } from 'mobx'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'

import TagEditor from './TagEditor'

export const formatRecordTags = records => {
  // TODO: check uniqueness and sort
  const recordTags = _.flatMap(records, r => {
    const { tags } = r
    return toJS(tags)
  })
  return recordTags
}

@inject('apiStore')
@observer
class CollectionCardsTagEditor extends React.Component {
  componentDidMount() {
    this.initializeSelectedRecordsTags()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cardIds.length != this.props.cardIds.length) {
      this.initializeSelectedRecordsTags()
    }
  }

  async initializeSelectedRecordsTags() {
    const { records } = this.props

    // attach userTags to record
    await Promise.all(
      _.map(records, async r => {
        return await r.initializeTags()
      })
    )
  }

  @computed
  get selectedRecordTags() {
    const { records } = this.props
    return (!_.isEmpty(records) && formatRecordTags(records)) || []
  }

  // NOTE: this is used to bulk-update and cache bust tags for selected cards
  _apiAddRemoveTag = (action, data) => {
    const { cardIds, apiStore } = this.props
    const { label, type } = data
    apiStore.request(`collection_cards/${action}_tag`, 'PATCH', {
      card_ids: cardIds,
      tag: label,
      type,
    })
  }

  @action
  addTag = ({ label, type }) => {
    const { records } = this.props
    // update frontend model tags observable to rerender TagEditor
    _.each(records, r => {
      r.tags.push({ label, type })
    })
    this._apiAddRemoveTag('add', { label, type })
  }

  @action
  removeTag = ({ label, type }) => {
    const { records } = this.props
    // update frontend model tags observable to rerender TagEditor
    _.each(records, r => {
      _.remove(r.tags, t => {
        return t.label === label && t.type === type
      })
    })
    this._apiAddRemoveTag('remove', { label, type })
  }

  render() {
    const {
      canEdit,
      placeholder,
      tagColor,
      suggestions,
      handleInputChange,
    } = this.props
    return (
      <TagEditor
        recordTags={this.selectedRecordTags}
        afterAddTag={this.addTag}
        afterRemoveTag={this.removeTag}
        canEdit={canEdit}
        placeholder={placeholder}
        tagColor={tagColor}
        suggestions={suggestions}
        handleInputChange={handleInputChange}
      />
    )
  }
}

CollectionCardsTagEditor.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

CollectionCardsTagEditor.propTypes = {
  records: PropTypes.arrayOf(MobxPropTypes.objectOrObservableObject).isRequired,
  cardIds: PropTypes.array.isRequired,
  canEdit: PropTypes.bool,
  placeholder: PropTypes.string,
  tagColor: PropTypes.string,
  suggestions: MobxPropTypes.arrayOrObservableArray.isRequired,
  handleInputChange: PropTypes.func.isRequired,
}

CollectionCardsTagEditor.defaultProps = {
  canEdit: false,
  tagColor: null,
  placeholder: null,
}

CollectionCardsTagEditor.displayName = 'CollectionCardsTagEditor'

export default CollectionCardsTagEditor
