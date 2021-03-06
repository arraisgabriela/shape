import PropTypes from 'prop-types'
import styled from 'styled-components'
import MuiDialog from '@material-ui/core/Dialog'

import Loader from '~/ui/layout/Loader'
import v from '~/utils/variables'
import ICONS, { iconNames } from '~/ui/icons/dialogIcons'

const { CloseIcon } = ICONS

const StyledDialog = styled(MuiDialog)`
  .modal__paper {
    background-color: ${props => props.variant.backgroundColor};
    color: ${props => props.variant.color};
    border-radius: 6px;
    opacity: 0.95;
    width: 100%;
    &-sm {
      max-width: 425px;
    }
    &-md {
      max-width: 560px;
    }
  }
`
const ModalCloseButton = styled.button`
  cursor: pointer;
  display: block;
  right: 14px;
  position: absolute;
  top: 12px;
  width: 12px;
`
ModalCloseButton.displayName = 'ModalCloseButton'

const CenteredPaddedContent = styled.div`
  padding: 30px ${props => props.paddingSides}px;
  text-align: center;
`

const IconHolder = styled.span`
  display: block;
  margin: 30px auto;
  width: 84px;
`

const ImageHolder = styled.span`
  display: inline-block;
  margin-top: 25px;
`

const PromptText = styled.span`
  & p {
    font-weight: ${v.weights.book};
    font-size: ${props => props.fontSize}rem;
    font-family: ${v.fonts.sans};
    margin-bottom: 40px;
    padding: 0;
  }
`

class Dialog extends React.PureComponent {
  handleClose = ev => {
    ev.preventDefault()
    const { closeable, onClose } = this.props
    if (!closeable) return
    onClose && onClose()
  }

  get icon() {
    const { iconName, iconImageOverride, overrideWithLoader } = this.props
    if (overrideWithLoader) {
      return <Loader containerHeight="220px" />
    }
    if (iconImageOverride) {
      return (
        <ImageHolder>
          <img
            style={{ width: '450px', marginLeft: '-25px' }}
            src={iconImageOverride}
            alt=""
          />
        </ImageHolder>
      )
    }
    const icon = ICONS[`${iconName}Icon`]
    const iconEl = icon ? React.createElement(icon) : ''
    if (iconEl) return <IconHolder>{iconEl}</IconHolder>
    return null
  }

  get variantColor() {
    const { backgroundColor } = this.props
    switch (backgroundColor) {
      case v.colors.primaryLight:
        return v.colors.secondaryDark
      case v.colors.white:
        return v.colors.black
      default:
        return v.colors.white
    }
  }

  render() {
    const {
      children,
      closeable,
      backgroundColor,
      onClose,
      open,
      maxWidth,
    } = this.props
    const variant = {
      backgroundColor,
      color: this.variantColor,
    }
    return (
      <StyledDialog
        open={open}
        classes={{
          paper: 'modal__paper',
          paperWidthSm: 'modal__paper-sm',
          paperWidthMd: 'modal__paper-md',
        }}
        onClose={this.handleClose}
        onBackdropClick={this.handleClose}
        aria-labelledby="Confirmation"
        BackdropProps={{ invisible: true }}
        maxWidth={maxWidth}
        // using suggestion here: https://git.io/fpUnP
        variant={variant}
      >
        {closeable && onClose && (
          <ModalCloseButton onClick={this.handleClose}>
            <CloseIcon />
          </ModalCloseButton>
        )}
        <CenteredPaddedContent paddingSides={maxWidth === 'md' ? 50 : 20}>
          {this.icon}
          <PromptText
            data-cy="DialogPrompt"
            fontSize={maxWidth === 'md' ? 1.5 : 1.25}
          >
            {children}
          </PromptText>
        </CenteredPaddedContent>
      </StyledDialog>
    )
  }
}

Dialog.propTypes = {
  iconName: PropTypes.oneOf(iconNames),
  iconImageOverride: PropTypes.string,
  children: PropTypes.node,
  open: PropTypes.bool.isRequired,
  closeable: PropTypes.bool,
  onClose: PropTypes.func,
  maxWidth: PropTypes.string,
  backgroundColor: PropTypes.oneOf(Object.values(v.colors)),
  overrideWithLoader: PropTypes.bool,
}
Dialog.defaultProps = {
  iconName: 'Alert',
  children: null,
  maxWidth: 'xs', // 'xs' == 360px
  iconImageOverride: null,
  backgroundColor: v.colors.commonDark,
  closeable: true,
  onClose: null,
  overrideWithLoader: false,
}
// all propTypes except required `children` node, to be used by Information/ConfirmationModal
const { ...childPropTypes } = Dialog.propTypes
Dialog.childPropTypes = childPropTypes

export default Dialog
