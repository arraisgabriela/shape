import { observable, action } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import MuiAvatar from '@material-ui/core/Avatar'
import styled from 'styled-components'

import { routingStore } from '~/stores'
import Tooltip from '~/ui/global/Tooltip'
import v from '~/utils/variables'

const StyledAvatar = styled(MuiAvatar)`
  &.avatar {
    width: ${props => props.size}px;
    margin-right: 5px;
    height: ${props => props.size}px;
    cursor: ${props => props.cursor};
    ${props =>
      props.responsive &&
      `
      @media only screen and (max-width: ${v.responsive.smallBreakpoint}px) {
        width: ${props.size * 0.8}px;
        height: ${props.size * 0.8}px;
      }
    `};
  }
  &.bordered {
    box-shadow: 0 0 0 1px;
    /* box-shadow will use the color property by default */
    color: ${v.colors.commonLight};
  }
  &.outlined {
    /* thicker outline */
    box-shadow: 0 0 0 4px;
    /* box-shadow will use the color property by default */
    color: ${props => props.color};
  }
  /* not the cleanest way to do this but it works; see note above about color */
  &.outline-Blue {
    color: ${v.colors.collaboratorPrimaryBlue};
  }
  &.outline-Yellow {
    color: ${v.colors.collaboratorPrimaryYellow};
  }
  &.outline-Purple {
    color: ${v.colors.collaboratorPrimaryPurple};
  }
  &.outline-Olive {
    color: ${v.colors.collaboratorPrimaryOlive};
  }
  &.outline-Salmon {
    color: ${v.colors.collaboratorPrimarySalmon};
  }
  &.outline-IcyBlue {
    color: ${v.colors.collaboratorPrimaryIcyBlue};
  }
  &.outline-Lavender {
    color: ${v.colors.collaboratorPrimaryLavender};
  }
  &.outline-Obsidian {
    color: ${v.colors.collaboratorPrimaryObsidian};
  }
  &.outline-Slate {
    color: ${v.colors.collaboratorPrimarySlate};
  }
  &.outline-Grey {
    color: ${v.colors.collaboratorPrimaryGrey};
  }
`

/*
 * An avatar with an small, circular image, mainly used to show users and groups
 *
 * @component
 */
@observer
class Avatar extends React.Component {
  @observable
  error = false

  @action
  setError(val) {
    this.error = val
  }

  get url() {
    if (this.error) {
      return Avatar.defaultProps.url
    }
    return this.props.url
  }

  onError = () => {
    this.setError(true)
  }

  handleClick = () => {
    const { linkToCollectionId } = this.props
    if (!linkToCollectionId) return false
    return routingStore.routeTo('collections', linkToCollectionId)
  }

  render() {
    const {
      className,
      displayName,
      size,
      title,
      linkToCollectionId,
      responsive,
      clickable,
      color,
    } = this.props

    const renderAvatar = (
      <StyledAvatar
        alt={title}
        size={size}
        className={`avatar ${className}`}
        src={this.url}
        imgProps={{ onError: this.onError }}
        onClick={this.handleClick}
        cursor={
          linkToCollectionId || displayName || clickable ? 'pointer' : 'initial'
        }
        responsive={responsive ? 1 : 0}
        color={color}
      />
    )
    let content = renderAvatar
    if (displayName) {
      content = (
        <Tooltip
          classes={{ tooltip: 'Tooltip' }}
          title={title}
          placement="bottom"
        >
          {renderAvatar}
        </Tooltip>
      )
    }
    return content
  }
}

export const AvatarPropTypes = {
  /**
   * The title or text for the avatar, mainly appears in the tooltip
   */
  title: PropTypes.string,
  /** The url for the image of the avatar */
  url: PropTypes.string,
  /** The size of the avatar in px */
  size: PropTypes.number,
  /** Any classnames for the component */
  className: PropTypes.string,
  /** Whether to display the title in a tooltip or not */
  displayName: PropTypes.bool,
  /**
   * A collection ID that will be used to route to on click. If not passed
   * through, clicking the avatar will do nothing.
   */
  linkToCollectionId: PropTypes.string,
  /**
   * Whether the avatar should include responsive behavior such as adjusting
   * it's size when mobile.
   */
  responsive: PropTypes.bool,
  /**
   * If the avatar is clickable and has the clickable cursor behavior
   */
  clickable: PropTypes.bool,
  /**
   * Adds a colored border to the avatar if a valid hex code is passed through
   */
  color: PropTypes.string,
}

Avatar.propTypes = AvatarPropTypes
Avatar.defaultProps = {
  url:
    'https://d3none3dlnlrde.cloudfront.net/assets/users/avatars/missing/square.jpg',
  size: 32,
  className: '',
  title: 'Avatar',
  displayName: false,
  linkToCollectionId: null,
  responsive: true,
  clickable: false,
  color: v.colors.commonLight,
}

export default Avatar
