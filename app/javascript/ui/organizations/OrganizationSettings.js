import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'

import { Heading3 } from '~/ui/global/styled/typography'
import TagEditor from '~/ui/pages/shared/TagEditor'

@inject('apiStore', 'routingStore')
@observer
class OrganizationSettings extends React.Component {
  componentDidMount() {
    // kick out if you're not an org admin (i.e. primary_group admin)
    if (!this.organization.primary_group.can_edit) {
      this.props.routingStore.routeTo('homepage')
    }
  }

  get organization() {
    const { apiStore } = this.props
    return apiStore.currentUserOrganization
  }

  render() {
    return (
      <div>
        <Heading3>Official Domains</Heading3>
        <p>
          Any new people added to {this.organization.name} without these email
          domains will be considered guests.
        </p>

        <TagEditor
          canEdit
          validate="domain"
          placeholder="Please enter domains with the following format: domain.com"
          record={this.organization}
          tagField="domain_whitelist"
          tagColor="white"
        />
      </div>
    )
  }
}

OrganizationSettings.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  routingStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default OrganizationSettings
