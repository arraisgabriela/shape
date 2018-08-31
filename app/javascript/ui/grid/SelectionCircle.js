import PropTypes from 'prop-types'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'

import v from '~/utils/variables'

const StyledSelectionCircle = styled.div`
  display: inline-block;
  vertical-align: top;
  width: 14px;
  height: 14px;
  border-radius: 14px;
  border: 1px solid ${v.colors.gray};
  margin: 5px;
  &.selected {
    border-color: ${v.colors.gray};
    background-color: ${v.colors.gray};
  }
`
StyledSelectionCircle.displayName = 'StyledSelectionCircle'

@inject('uiStore')
@observer
class SelectionCircle extends React.Component {
  toggleSelected = () => {
    const { cardId, uiStore } = this.props
    uiStore.toggleSelectedCardId(cardId)
  }

  get isSelected() {
    const { cardId, uiStore } = this.props
    return uiStore.isSelected(cardId)
  }

  render() {
    return (
      <StyledSelectionCircle
        className={this.isSelected ? 'selected' : 'show-on-hover'}
        onClick={this.toggleSelected}
        role="button"
      />
    )
  }
}

SelectionCircle.propTypes = {
  cardId: PropTypes.string.isRequired,
}
SelectionCircle.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}
// to override the long 'injected-xxx' name
SelectionCircle.displayName = 'SelectionCircle'

export default SelectionCircle
