import { action, runInAction, observable } from 'mobx'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'
import { FormSpacer, TextButton } from '~/ui/global/styled/forms'
import { Row, RowItemRight } from '~/ui/global/styled/layout'
import { Heading3, DisplayText } from '~/ui/global/styled/typography'
import Modal from '~/ui/global/modals/Modal'
import GroupModify from '~/ui/groups/GroupModify'
import RolesMenu from '~/ui/roles/RolesMenu'
import Loader from '~/ui/layout/Loader'
import ArchiveIcon from '~/ui/icons/ArchiveIcon'

const RemoveIconHolder = styled.button`
  width: 16px;
`

@inject('apiStore', 'uiStore')
@observer
class OrganizationMenu extends React.Component {
  @observable editOrganizationOpen = false
  @observable modifyGroupOpen = false
  @observable editGroup = {}
  @observable modifyGroupRoles = false
  @observable isLoading = false

  componentDidMount() {
    const { apiStore, userGroups } = this.props
    const groupReqs = userGroups.map(group => this.fetchRoles(group))
    Promise.all(groupReqs)
      .then(responses => {
        const roles = responses.map(res => res.data)
        apiStore.add(roles, 'roles')
      })
      .catch((err) => console.warn(err))
  }

  @action onModifyGroupRoles(group) {
    this.editOrganizationOpen = false
    this.editGroup = group
    this.modifyGroupRoles = true
  }

  @action onGroupSave = async (editedGroup) => {
    const { apiStore } = this.props
    const newGroup = !this.editGroup.id
    this.modifyGroupOpen = false
    this.editGroup = {}
    if (newGroup) {
      this.onModifyGroupRoles(editedGroup)
      this.isLoading = true
      const res = await this.fetchRoles(editedGroup)
      // because this is after async/await
      runInAction(() => { this.isLoading = false })
      apiStore.sync(res)
    }
  }

  @action onOrganizationSave = () => {
    this.editOrganizationOpen = false
    this.modifyGroupOpen = false
    this.modifyGroupRoles = false
  }

  @action changeModifyGroup(group) {
    this.modifyGroupOpen = true
    this.editGroup = group
  }

  @action handleOrganizationClick = () => {
    if (!this.editOrganization) {
      this.editOrganizationOpen = true
    }
  }

  @action handleGroupAddClick = (ev) => {
    this.modifyGroupOpen = true
  }

  @action handleBack = () => {
    this.editOrganizationOpen = false
    this.modifyGroupOpen = false
    this.modifyGroupRoles = false
    this.isLoading = false
    this.editGroup = {}
  }

  fetchRoles = (group) => {
    const { apiStore } = this.props
    return apiStore.request(`groups/${group.id}/roles`, 'GET')
  }

  onRolesSave = (res) => {
    const { apiStore } = this.props
    apiStore.sync(res)
  }

  currentUserRoleCheck(roles) {
    // If the current user is an admin in the group they can edit
    const { apiStore } = this.props
    const { currentUser } = apiStore
    const userRole = roles.find(role => role.users
      .find(user => user.id === currentUser.id))
    if (!userRole) return false
    return userRole.canEdit()
  }

  removeGroup = async (group) => {
    try {
      const { apiStore } = this.props
      await group.API_archive()
      if (group.containsUser(apiStore.currentUserId)) {
        window.location.reload()
      }
      apiStore.fetch('users', apiStore.currentUserId, true)
    } catch (err) {
      console.warn('Unable to archive group', err)
    }
  }

  handleGroupClick = group => () => {
    this.changeModifyGroup(group)
  }

  handleGroupRemove = group => async () => {
    const { uiStore } = this.props
    uiStore.confirm({
      prompt: `Are you sure you want to archive ${group.name}?`,
      confirmText: 'Archive',
      iconName: 'Archive',
      onConfirm: () => this.removeGroup(group),
    })
  }

  handleGroupRolesClick = group => () => {
    this.onModifyGroupRoles(group)
  }

  handleClose = (ev) => {
    const { uiStore } = this.props
    uiStore.update('organizationMenuOpen', false)
    // delay so that you don't see it switch as the modal fades out
    setTimeout(() => {
      // reset the state
      this.handleBack()
    }, 500)
  }

  renderEditOrganization() {
    const { organization } = this.props
    return (
      <GroupModify
        group={organization.primary_group}
        onGroupRoles={this.handleGroupRolesClick(organization.primary_group)}
        onSave={this.onOrganizationSave}
      />
    )
  }

  renderEditGroup() {
    return (
      <GroupModify
        group={this.editGroup}
        onGroupRoles={this.handleGroupRolesClick(this.editGroup)}
        onSave={this.onGroupSave}
      />
    )
  }

  renderEditRoles() {
    const { apiStore } = this.props
    // Some roles in the Api store don't have a resource included
    const roles = apiStore.findAll('roles').filter((role) =>
      role.resource && role.resource.id === this.editGroup.id)
    return (
      <RolesMenu
        canEdit={this.currentUserRoleCheck(roles)}
        ownerId={this.editGroup.id}
        ownerType="groups"
        title="Members:"
        addCallout="Add people:"
        roles={roles}
        onSave={this.onRolesSave}
      />)
  }

  renderBase() {
    const { organization, userGroups } = this.props
    const primaryGroup = organization.primary_group
    return (
      <div>
        <Row>
          <RowItemRight>
            <TextButton onClick={this.handleGroupAddClick}>
              + New Group
            </TextButton>
          </RowItemRight>
        </Row>
        <Heading3>
          Your Organization
        </Heading3>
        <Row>
          <button className="orgEdit" onClick={this.handleOrganizationClick}>
            <DisplayText>{ primaryGroup.name }</DisplayText>
          </button>
        </Row>
        <FormSpacer />
        <Heading3>
          Your Groups
        </Heading3>
        { userGroups.map((group) =>
          (!group.is_primary &&
          <Row key={group.id}>
            <button
              className="groupEdit"
              onClick={this.handleGroupClick(group)}
            >
              <DisplayText>{group.name}</DisplayText>
            </button>
            <RemoveIconHolder onClick={this.handleGroupRemove(group)}>
              <ArchiveIcon />
            </RemoveIconHolder>
          </Row>))
        }
      </div>
    )
  }

  render() {
    // TODO build nested modal functionality out in separate component
    const { uiStore } = this.props
    let content = this.renderBase()
    let title = 'People & Groups'
    let onBack
    if (this.editOrganizationOpen) {
      content = this.renderEditOrganization()
      title = 'Your Organization'
      onBack = this.handleBack
    } else if (this.modifyGroupRoles) {
      if (this.isLoading) {
        content = <Loader height="350px" fadeIn="none" />
      } else {
        content = this.renderEditRoles()
      }
      onBack = this.handleBack
      title = this.editGroup.name
    } else if (this.modifyGroupOpen) {
      content = this.renderEditGroup()
      title = this.editGroup.id ? this.editGroup.name : 'New Group'
      onBack = this.handleBack
    }
    return (
      <Modal
        title={title}
        onClose={this.handleClose}
        onBack={onBack}
        open={uiStore.organizationMenuOpen}
      >
        { content }
      </Modal>
    )
  }
}

OrganizationMenu.propTypes = {
  organization: MobxPropTypes.objectOrObservableObject.isRequired,
  userGroups: MobxPropTypes.arrayOrObservableArray.isRequired,
}
OrganizationMenu.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default OrganizationMenu
