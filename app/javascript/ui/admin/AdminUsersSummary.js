import PropTypes from 'prop-types'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { sortBy } from 'lodash'

import Avatar from '~/ui/global/Avatar'
import AvatarGroup, { MAX_AVATARS_TO_SHOW } from '~/ui/global/AvatarGroup'
import Tooltip from '~/ui/global/Tooltip'
import { AddButton } from '~/ui/global/styled/buttons'

@inject('apiStore')
@observer
class AdminUsersSummary extends React.Component {
  state = {
    adminUsers: [],
  }

  async componentDidMount() {
    const res = await this.fetchUsers()
    this.setState({ adminUsers: res.data })
  }

  fetchUsers() {
    const { apiStore } = this.props
    return apiStore.request('users/shape_admins')
  }

  renderUsers() {
    let users = sortBy(this.state.adminUsers, ['first_name'])
    users = users.slice(0, MAX_AVATARS_TO_SHOW)

    return users.map(user => {
      return (
        <Avatar
          className="admin"
          key={`${user.internalType}_${user.id}`}
          title={user.nameWithHints || user.name}
          url={user.pic_url_square || user.filestack_file_url}
          displayName
        />
      )
    })
  }

  render() {
    const adminCount = this.state.adminUsers.length

    return (
      <React.Fragment>
        <AvatarGroup
          avatarCount={adminCount}
          placeholderTitle="...and more admins"
        >
          {this.renderUsers()}
        </AvatarGroup>
        <Tooltip title="Invite Shape Admin Users">
          <AddButton onClick={this.props.handleClick}>+</AddButton>
        </Tooltip>
      </React.Fragment>
    )
  }
}

AdminUsersSummary.propTypes = {
  handleClick: PropTypes.func.isRequired,
}

AdminUsersSummary.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default AdminUsersSummary
