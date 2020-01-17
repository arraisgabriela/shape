import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { action, observable, runInAction } from 'mobx'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { routingStore } from '~/stores'
import LinkIconSm from '~/ui/icons/LinkIconSm'
import {
  StyledMenu,
  StyledMenuButton,
  StyledMenuItem,
  StyledMenuWrapper,
} from '~/ui/global/PopoutMenu'
import Tooltip from '~/ui/global/Tooltip'
import v from '~/utils/variables'
import WithDropTarget from '~/ui/global/WithDropTarget'

const StyledBreadcrumbCaret = styled.div`
  display: inline-block;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  top: 0px;
  position: relative;
  vertical-align: top;
`

const StyledBreadcrumbItem = styled.div`
  display: inline-block;
  ${props =>
    props.currentlyDraggedOn &&
    `
    background: ${v.colors.primaryLight};
  `};
  a {
    color: ${props => (props.isLast ? v.colors.black : v.colors.commonDark)};
    text-decoration: none;
    display: inline-block;
    transition: ${v.transition};
    &:hover {
      cursor: pointer;
      color: ${v.colors.primaryDarkest};
    }
  }
`
StyledBreadcrumbItem.displayName = 'StyledBreadcrumbItem'

const StyledRestoreButton = styled.button`
  height: 15px;
  width: 15px;
  margin-right: 5px;
  display: inline-block;
  position: relative;
  top: 1px;
  background-color: ${v.colors.primaryMediumDark};
  color: ${v.colors.white};
  border-radius: 50%;
`
StyledRestoreButton.displayName = 'StyledRestoreButton'

const DiveButton = styled.button`
  height: 40px;
  margin-bottom: -10px;
  margin-left: auto;
  margin-top: -10px;
  width: 35px;
`

const NEST_AMOUNT_Y_PX = 44
const MENU_WIDTH = 230
const HOVER_TIMEOUT_MS = 150

@observer
// also export unwrapped component for unit test
export class BreadcrumbItem extends React.Component {
  @observable
  breadcrumbDropDownRecords = []
  @observable
  dropdownOpen = false
  @observable
  menuItemOpenId = null
  hoverTimer = null
  nestedMenuTimer = null
  nestedMenuY = 0
  nestedMenuX = 0

  fetchBreadcrumbRecords = async itemId => {
    const breadcrumbRecordsReq = await axios.get(
      `/api/v1/collections/${itemId}/collection_cards/breadcrumb_records`
    )
    runInAction(() => {
      this.breadcrumbDropDownRecords = breadcrumbRecordsReq.data
      this.menuItemOpenId = itemId
    })
  }

  @action
  closeDropdown = () => {
    // this.breadcrumbDropDownRecords = []
    this.hoverTimer = null
    this.dropdownOpen = false
    this.menuItemOpenId = null
    this.nestedMenuX = 0
    this.nestedMenuY = 0
  }

  @action
  closeNestedMenu() {
    this.breadcrumbDropDownRecords = []
    this.menuItemOpenId = null
    this.nestedMenuY = 0
  }

  @action
  onBreadcrumbHoverOver = () => {
    this.dropdownOpen = true
    clearTimeout(this.hoverTimer)
  }

  onBreadcrumbHoverOut = async ev => {
    this.hoverTimer = setTimeout(this.closeDropdown, HOVER_TIMEOUT_MS)
  }

  onDropdownHoverOver = () => {
    // Keep the dropdown open in the same was as hovering over a breadcrumb
    this.onBreadcrumbHoverOver()
  }

  onBreadcrumbClick = item => {
    routingStore.routeTo('collections', item.id)
  }

  onDropdownHoverOut = async ev => {
    this.hoverTimer = setTimeout(this.closeDropdown, HOVER_TIMEOUT_MS)
  }

  onDiveClick = (item, level, ev) => {
    this.nestedMenuX = level === 1 ? MENU_WIDTH : 0
    if (!item.nested) {
      this.nestedMenuY = 0
    } else {
      this.nestedMenuY = item.nested * NEST_AMOUNT_Y_PX
    }
    this.fetchBreadcrumbRecords(item.id)
  }

  @action
  onNestedMenuHoverOver = () => {
    this.dropdownOpen = true
    clearTimeout(this.hoverTimer)
    clearTimeout(this.nestedMenuTimer)
  }

  onNestedMenuHoverOut = () => {
    this.nestedMenuTimer = setTimeout(
      this.closeNestedMenu,
      HOVER_TIMEOUT_MS + 50
    )
    this.hoverTimer = setTimeout(this.closeDropdown, HOVER_TIMEOUT_MS)
  }

  renderDropdown() {
    const { item } = this.props
    if (!this.dropdownOpen) return null
    let menuItems = [item]
    if (item.subItems) {
      menuItems = [...menuItems, ...item.subItems]
    }
    return (
      <StyledMenuWrapper style={{ marginTop: '0px', left: '-20px' }}>
        <StyledMenu
          width={MENU_WIDTH}
          onMouseOver={this.onDropdownHoverOver}
          onMouseOut={this.onDropdownHoverOut}
        >
          {(!this.menuItemOpenId || this.nestedMenuX !== 0) &&
            menuItems.map(menuItem => (
              <StyledMenuItem key={menuItem.name}>
                <StyledMenuButton
                  onClick={() => this.onBreadcrumbClick(menuItem)}
                  nested={menuItem.nested}
                >
                  {menuItem.name}
                </StyledMenuButton>
                {menuItem.has_children && (
                  <DiveButton onClick={ev => this.onDiveClick(menuItem, 1, ev)}>
                    <StyledBreadcrumbCaret>&#62;</StyledBreadcrumbCaret>
                  </DiveButton>
                )}
              </StyledMenuItem>
            ))}
        </StyledMenu>
        {this.menuItemOpenId && (
          <StyledMenuWrapper
            offsetPosition={{ x: this.nestedMenuX, y: this.nestedMenuY }}
          >
            <StyledMenu
              width={230}
              onMouseOver={this.onNestedMenuHoverOver}
              onMouseOut={this.onNestedMenuHoverOut}
            >
              {this.breadcrumbDropDownRecords.map(menuItem => (
                <StyledMenuItem key={menuItem.name}>
                  <StyledMenuButton onClick={() => this.onItemClick(menuItem)}>
                    {menuItem.name}
                  </StyledMenuButton>
                  {menuItem.has_children && (
                    <DiveButton
                      onClick={ev => this.onDiveClick(menuItem, 2, ev)}
                    >
                      <StyledBreadcrumbCaret>&#62;</StyledBreadcrumbCaret>
                    </DiveButton>
                  )}
                </StyledMenuItem>
              ))}
            </StyledMenu>
          </StyledMenuWrapper>
        )}
      </StyledMenuWrapper>
    )
  }

  render() {
    const { item, index, numItems, restoreBreadcrumb } = this.props
    const isLast = index === numItems - 1
    let path
    if (item.id === 'homepage') {
      path = routingStore.pathTo('homepage')
    } else {
      path = routingStore.pathTo(item.type, item.id)
    }
    const { currentlyDraggedOn } = this.props
    const showDrag =
      currentlyDraggedOn &&
      currentlyDraggedOn.item.identifier === item.identifier
    return (
      <Fragment key={path}>
        <StyledBreadcrumbItem
          data-cy="Breadcrumb"
          ref={this.props.forwardedRef}
          currentlyDraggedOn={!!showDrag}
          isLast={isLast}
          onMouseOver={this.onBreadcrumbHoverOver}
          onMouseOut={this.onBreadcrumbHoverOut}
        >
          {item.link && (
            <Tooltip
              title={`switch to ${item.name}'s actual location`}
              placement="top"
            >
              <StyledRestoreButton onClick={restoreBreadcrumb}>
                <LinkIconSm />
              </StyledRestoreButton>
            </Tooltip>
          )}
          {item.ellipses || item.truncatedName ? (
            <Link to={path}>{item.truncatedName}…</Link>
          ) : (
            <Link to={path}>{item.name}</Link>
          )}
        </StyledBreadcrumbItem>
        {this.renderDropdown()}
        {!isLast && <StyledBreadcrumbCaret>&#62;</StyledBreadcrumbCaret>}
      </Fragment>
    )
  }
}

BreadcrumbItem.propTypes = {
  item: MobxPropTypes.objectOrObservableObject.isRequired,
  index: PropTypes.number.isRequired,
  numItems: PropTypes.number.isRequired,
  forwardedRef: PropTypes.oneOfType([PropTypes.element, PropTypes.object]),
  currentlyDraggedOn: MobxPropTypes.objectOrObservableObject,
  restoreBreadcrumb: PropTypes.func.isRequired,
}

BreadcrumbItem.defaultProps = {
  forwardedRef: React.createRef(),
  currentlyDraggedOn: null,
}
BreadcrumbItem.displayName = 'BreadcrumbItem'

export default WithDropTarget(BreadcrumbItem)
