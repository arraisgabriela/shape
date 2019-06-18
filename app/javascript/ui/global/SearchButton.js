import PropTypes from 'prop-types'
import { action, observable, runInAction } from 'mobx'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import v from '~/utils/variables'
import SearchIcon from '~/ui/icons/SearchIcon'
import CloseIcon from '~/ui/icons/CloseIcon'

const StyledSearchButton = styled.div`
  border-radius: 20px;
  background: ${props => props.background};
  position: relative;
  min-width: 32px;
  max-width: ${props => (props.open ? '250px' : '32px')};
  width: 100%;
  height: 32px;
  text-align: center;
  display: flex;
  align-items: center;
  transition: all 0.5s ease-in-out;

  @media only screen and (max-width: ${v.responsive.smallBreakpoint}px) {
    /* encourage input width to take up the full screen minus our 16px viewport gutters */
    max-width: ${props => (props.open ? 'calc(100vw - 32px)' : '0px')};
    width: 100vw;
  }

  input {
    flex: 1 1 auto;
    font-size: 1rem;
    background: none;
    outline: none;
    border: none;
    margin-right: ${props => (props.open ? '30px' : '0px')};
    transition: all 0.5s ease-in-out;
    width: 100%;
    &::placeholder {
      color: ${v.colors.commonDark};
    }
  }

  .icon {
    display: inline;
  }

  .search {
    color: ${v.colors.black};
    flex: 0 0 auto;
    padding: 0px 4px;
    svg {
      display: inline-block;
      height: 22px;
      margin-bottom: -7px;
      margin-left: 5px;
      padding-top: 4px;
      width: 22px;
    }
  }

  .close {
    position: absolute;
    right: 10px;
    bottom: 4px;
    color: ${v.colors.commonDark};
    visibility: ${props => (props.open ? 'visible' : 'hidden')};
    opacity: ${props => (props.open ? '1' : '0')};
    transition: opacity 0.5s linear 0.5s;
    &:hover {
      color: black;
    }
    svg {
      display: inline;
      padding-top: 4px;
      height: 14px;
      width: 14px;
    }
  }
`
StyledSearchButton.displayName = 'StyledSearchButton'

@observer
class SearchButton extends React.Component {
  @observable
  open = false

  componentDidMount() {
    runInAction(() => {
      this.open = this.defaultOpen
    })
  }

  @action
  updateOpen = val => {
    this.open = val
    this.props.onOpen(val)
  }

  handleOpen = val => () => this.updateOpen(val)

  handleTextChange = ev => {
    this.props.onChange(ev.target.value)
  }

  handleClose = ev => {
    if (this.open) {
      this.updateOpen(false)
    }
    this.clearSearch()
  }

  clearSearch = () => {
    const { onClear } = this.props
    onClear && onClear()
  }

  render() {
    const { value, background } = this.props
    const { open } = this
    console.log('search button', open)
    return (
      <StyledSearchButton open={open} background={background}>
        <button className="search" onClick={this.handleOpen(true)}>
          <SearchIcon />
        </button>
        <input
          ref={input => {
            this.searchInput = input
          }}
          type="text"
          placeholder="search..."
          value={value}
          onChange={this.handleTextChange}
        />
        <button open={open} onClick={this.handleClose} className="close">
          <CloseIcon />
        </button>
      </StyledSearchButton>
    )
  }
}

SearchButton.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onOpen: PropTypes.func,
  defaultOpen: PropTypes.bool,
  background: PropTypes.string,
}

SearchButton.defaultProps = {
  defaultOpen: false,
  background: v.colors.commonLightest,
  onOpen: () => {},
}

export default SearchButton
