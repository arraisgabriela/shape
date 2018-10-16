import _ from 'lodash'
import PropTypes from 'prop-types'
import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
// import TextareaAutosize from 'react-autosize-textarea'
import styled, { css } from 'styled-components'

import ReturnArrowIcon from '~/ui/icons/ReturnArrowIcon'
import v from '~/utils/variables'
import DescriptionQuestion from './DescriptionQuestion'
import { QuestionText, TextResponseHolder, TextInput } from './shared'

const QuestionSpacing = css`
  border-bottom-color: ${props =>
    props.editing ? v.colors.commonMedium : v.colors.primaryMedium};
  border-bottom-style: solid;
  border-bottom-width: 4px;
`

const QuestionSpacingContainer = styled.div`
  ${QuestionSpacing};
`

const QuestionTextWithSpacing = QuestionText.extend`
  ${QuestionSpacing};
`
QuestionTextWithSpacing.displayName = 'QuestionTextWithSpacing'

const TextEnterButton = styled.button`
  opacity: ${props => (props.focused ? 1 : 0)};
  transition: opacity 0.3s;
  color: ${v.colors.primaryDark};
  vertical-align: super;
  position: absolute;
  right: 18px;
  top: 14px;
  width: 18px;
  height: 18px;
`

const QuestionEntryForm = styled.form`
  background: ${v.colors.commonLightest};
`
QuestionEntryForm.displayName = 'QuestionEntryForm'

@observer
class OpenQuestion extends React.Component {
  constructor(props) {
    super(props)
    this.save = _.debounce(this._save, 1000)
    this.state = {
      response: '',
      focused: false,
    }
  }

  _save = () => {
    const { item } = this.props
    item.save()
  }

  handleResponse = ev => {
    this.setState({
      response: ev.target.value,
    })
  }

  handleSubmit = ev => {
    const { editing, onAnswer } = this.props
    ev.preventDefault()
    if (editing) return
    onAnswer({ text: this.state.response })
  }

  renderQuestion() {
    const { editing, item, canEdit } = this.props
    let content
    if (editing) {
      content = (
        <QuestionSpacingContainer editing={editing}>
          <DescriptionQuestion
            item={item}
            maxLength={100}
            placeholder="Write question here…"
            canEdit={canEdit}
          />
        </QuestionSpacingContainer>
      )
    } else {
      content = (
        <QuestionTextWithSpacing>{item.content}</QuestionTextWithSpacing>
      )
    }
    return content
  }

  render() {
    const { editing } = this.props
    return (
      <div style={{ width: '100%' }}>
        {this.renderQuestion()}
        <QuestionEntryForm onSubmit={this.handleSubmit}>
          <TextResponseHolder>
            <TextInput
              onFocus={() => this.setState({ focused: true })}
              onChange={this.handleResponse}
              onBlur={() => this.setState({ focused: false })}
              value={this.state.response}
              color={v.colors.primaryDark}
              placeholder="write response here"
              disabled={editing}
            />
            <TextEnterButton focused={this.state.focused}>
              <ReturnArrowIcon />
            </TextEnterButton>
          </TextResponseHolder>
        </QuestionEntryForm>
      </div>
    )
  }
}

OpenQuestion.propTypes = {
  item: MobxPropTypes.objectOrObservableObject.isRequired,
  editing: PropTypes.bool,
  onAnswer: PropTypes.func,
  canEdit: PropTypes.bool,
}
OpenQuestion.defaultProps = {
  editing: false,
  onAnswer: () => null,
  canEdit: false,
}

export default OpenQuestion
