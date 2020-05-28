import PropTypes from 'prop-types'
import styled from 'styled-components'
// import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

import Box from '~shared/components/atoms/Box'
// import TeamsTab from './TeamsTab'
// import OrganizationTab from './OrganizationTab'
import v from '~/utils/variables'
import {
  contentVersionsStore,
  industrySubcategoriesStore,
  organizationsStore,
  supportedLanguagesStore,
  businessUnitsStore,
} from 'c-delta-organization-settings'
import Loader from '~/ui/layout/Loader'
import { runInAction, observable, action } from 'mobx'
import { observer, inject, PropTypes as MobxPropTypes } from 'mobx-react'
import DropdownSelect from './DropdownSelect'
import OrganizationRoles from './OrganizationRoles'
import Languages from './Languages'
import BusinessUnitActionMenu from './BusinessUnitActionMenu'
import AddTeamButton from './AddTeamButton'
import { Row } from '~/ui/global/styled/layout'
import InfoIconXs from '~/ui/icons/InfoIconXs'
import { Label } from '~/ui/global/styled/forms'
import { DisplayText } from '~/ui/global/styled/typography'
import HoverableDescriptionIcon from '~/ui/global/HoverableDescriptionIcon'

const StyledIconWrapper = styled.span`
  margin-left: 8px;
  display: inline-block;
  vertical-align: middle;
  width: ${props => (props.width ? props.width : 10)}px;
`

function TabPanel(props) {
  const { children, value, tabName } = props

  return (
    <div
      style={{ background: v.colors.tabsBackground }}
      component="div"
      role="tabpanel"
      hidden={value !== tabName}
      id={`simple-tabpanel-${tabName}`}
      aria-labelledby={`simple-tab-${tabName}`}
    >
      {value === tabName && <Box p={3}>{children}</Box>}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  tabName: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}
// TODO: Figure out how to get makeStyles to work
// const useStyles = makeStyles({
//   root: {
//     flexGrow: 1,
//     backgroundColor: v.colors.cDeltaBlue,
//   },
// })

@inject('apiStore', 'routingStore')
@observer
class CreativeDifferenceTabs extends React.Component {
  @observable
  industrySubcategories = []
  @observable
  contentVersions = []
  @observable
  organization = null
  @observable
  isLoading = false
  @observable
  isError = false
  @observable
  tabValue = ''
  @observable
  roles = []
  @observable
  supportedLanguages = []
  @observable
  businessUnits = []

  constructor(props) {
    super(props)

    runInAction(() => {
      this.tabValue = props.tab || 'organization'
    })

    props.apiStore.fetch(
      'groups',
      props.apiStore.currentUserOrganization.primary_group.id,
      true
    )
  }

  async componentDidMount() {
    const orgModel = new organizationsStore.model()
    const orgModelInstance = new orgModel({
      id: 4, // TODO: how to fetch actual id
    })
    // fetch data here
    const responses = await Promise.all([
      industrySubcategoriesStore.fetch(),
      contentVersionsStore.fetch(),
      orgModelInstance.fetch(),
      supportedLanguagesStore.fetch(),
      businessUnitsStore.fetch(),
    ])

    runInAction(() => {
      this.industrySubcategories = responses[0]
      this.contentVersions = responses[1]
      this.organization = responses[2]
      this.supportedLanguages = responses[3]
      this.businessUnits = responses[4]
    })
  }

  @action
  setTabValue(val) {
    this.tabValue = val
  }

  @action
  setLoading(value) {
    this.isLoading = value
  }

  @action
  setError(value) {
    this.isError = value
  }

  handleChange = (event, newValue) => {
    // event.preventDefault()
    console.log(event, newValue)
    this.setTabValue(newValue)
    this.props.routingStore.goToPath(`/org-settings/${newValue}`)
  }

  updateOrg = async orgParams => {
    try {
      this.setLoading(true)
      const orgModel = new organizationsStore.model()
      const orgModelInstance = new orgModel({
        id: this.organization.id,
      })
      const data = {
        organization: orgParams,
      }
      console.log('sending data for org: ', data)
      const promise = orgModelInstance.save(data, {
        optimistic: false,
      })
      const result = await promise
      runInAction(() => {
        this.organization = result
      })
      this.setLoading(false)
    } catch (err) {
      console.log('org update failed: ', err)
      this.setError(true)
    }
  }

  // TODO: Add to Teams dropdown props below, fix function signature
  updateBusinessUnit = async (businessUnit, params) => {
    try {
      this.setLoading(true)
      const model = new businessUnitsStore.model()
      const modelInstance = new model({
        id: businessUnit.id,
      })
      const data = {
        business_unit: params,
      }
      console.log('sending data for business unit: ', data)
      const promise = modelInstance.save(data, {
        optimistic: false,
      })
      const result = await promise
      console.log('BU update result: ', result)
      runInAction(async () => {
        // fetch all the business units after an update
        this.businessUnits = await businessUnitsStore.fetch()
        // TODO: Just update one BU so we don't have to refetch all the BUs?
      })
      this.setLoading(false)
    } catch (err) {
      console.log('BU update failed: ', err)
      this.setError(true)
    }
  }

  createBusinessUnit = async e => {
    e.preventDefault()
    console.log('creating new BU')
    try {
      const businessUnitParams = {
        business_unit: {
          name: 'New BU Here',
        },
      }
      console.log(businessUnitParams)
      const result = await businessUnitsStore.create(businessUnitParams)
      console.log(result)
    } catch (err) {
      console.log('error creating new BU: ', err)
    }
  }

  cloneBusinessUnit = async businessUnit => {
    try {
      this.setLoading(true)
      const model = new businessUnitsStore.model()
      const modelInstance = new model({
        id: businessUnit.id,
      })
      console.log('cloning: ', businessUnit.id)

      const promise = modelInstance.rpc('clone', {
        optimistic: false,
      })
      const result = await promise
      console.log('BU clone result: ', result)
      const allBusinessUnits = await businessUnitsStore.fetch()
      runInAction(async () => {
        // fetch all the business units after an update
        this.businessUnits = allBusinessUnits
        // TODO: Just update one BU so we don't have to refetch all the BUs?
      })
      this.setLoading(false)
    } catch (err) {
      console.log('error is: ', err)
    }
  }

  removeBusinessUnit = async businessUnit => {
    // TODO: This is supposed to archive from frontend but keep in backend
    try {
      this.setLoading(true)
      const model = new businessUnitsStore.model()
      const modelInstance = new model({
        id: businessUnit.id,
      })
      console.log('removing: ', businessUnit.id)

      const promise = modelInstance.destroy({
        optimistic: false,
      })
      const result = await promise
      console.log('BU destroy result: ', result)
      const allBusinessUnits = await businessUnitsStore.fetch()
      runInAction(async () => {
        // fetch all the business units after an update
        this.businessUnits = allBusinessUnits
        // TODO: Just update one BU so we don't have to refetch all the BUs?
      })
      this.setLoading(false)
    } catch (err) {
      console.log('error is: ', err)
    }
  }

  render() {
    const { orgName, tab, apiStore } = this.props
    const {
      industrySubcategories,
      contentVersions,
      supportedLanguages,
      businessUnits,
      organization,
      isError,
      isLoading,
      tabValue,
      handleChange,
      updateOrg,
      createBusinessUnit,
    } = this

    console.log('C∆ Tabs render: ', organization, supportedLanguages)

    return (
      <div
        style={
          {
            // height: '1200px',
            // background:
            //   'url(https://www.startrek.com/sites/default/files/styles/content_full/public/images/2019-07/c82b013313066e0702d58dc70db033ca.jpg?itok=9-M5ggoe)',
          }
        }
      >
        {isError && <div>Something went wrong... </div>}
        {isLoading ? <Loader /> : ''}
        <React.Fragment>
          <AppBar
            position="static"
            style={{
              flexGrow: 1,
              backgroundColor: v.colors.cDeltaBlue,
              color: v.colors.black,
            }}
          >
            <Tabs
              value={tab}
              onChange={handleChange}
              aria-label="simple tabs example"
            >
              {/* TODO: How to inject icon into this? CSS before content? */}
              {/* TODO: Change underline for selected tab from Material-UI default */}
              <Tab
                value={'organization'}
                label={`C∆ ${orgName} Settings`}
                {...a11yProps(0)}
              />
              <Tab
                value={'teams'}
                label={`C∆ ${orgName} Teams`}
                {...a11yProps(1)}
              />
            </Tabs>
          </AppBar>
          <TabPanel value={tabValue} tabName="organization">
            {organization && (
              <React.Fragment>
                <DropdownSelect
                  label={'Industry'}
                  record={organization}
                  options={industrySubcategories}
                  updateRecord={updateOrg}
                  fieldToUpdate={'industry_subcategory_id'}
                />
                <DropdownSelect
                  label={'Content Version'}
                  toolTip={
                    'Content Versions provide alternative wording to content that are more suitable for certain kinds of teams or organizations. We suggest leaving the default if you are unsure.'
                  }
                  record={organization}
                  options={contentVersions}
                  updateRecord={updateOrg}
                  fieldToUpdate={'default_content_version_id'}
                />
                <OrganizationRoles
                  roles={apiStore.currentUserOrganization.primary_group.roles}
                  canEdit={
                    apiStore.currentUserOrganization.primary_group.can_edit
                  }
                />
                <Languages
                  orgLanguages={organization.supported_languages}
                  supportedLanguages={supportedLanguages}
                  updateRecord={updateOrg}
                />
              </React.Fragment>
            )}
          </TabPanel>
          <TabPanel value={tabValue} tabName="teams">
            <React.Fragment>
              {/* Replace this with styled component */}
              <div
                style={{
                  color: v.colors.cDeltaBlue,
                  marginBottom: '23px',
                  marginTop: '20px',
                }}
              >
                {/* TODO: Use InfoIconXs with custom StyledIconWrapper; style the text  */}
                <StyledIconWrapper width={'16'} style={{ marginRight: '9px' }}>
                  <InfoIconXs />
                </StyledIconWrapper>
                <span>
                  In Creative Difference, a team is a group of individuals
                  working together towards a common output. Examples of this are
                  business units, segments, squads, etc.
                </span>
              </div>
              {/* Table Headers */}
              <Row>
                <Label
                  style={{
                    fontSize: '13px',
                    marginBottom: '11px',
                    marginRight: '20px',
                    width: '170px',
                  }}
                  id={'name-label'}
                >
                  Team
                  {/* Make Add Team button its own component? */}
                  <AddTeamButton createBusinessUnit={createBusinessUnit} />
                </Label>
                <Label
                  style={{
                    fontSize: '13px',
                    marginBottom: '11px',
                    marginRight: '20px',
                    width: '244px',
                    height: '32px',
                    marginTop: 'auto',
                  }}
                  id={`industry-select-label`}
                >
                  Industry
                </Label>
                <Label
                  style={{
                    fontSize: '13px',
                    marginRight: '20px',
                    marginBottom: '11px',
                    width: '244px',
                    height: '32px',
                    marginTop: 'auto',
                  }}
                  id={`content-version-select-label`}
                >
                  Content Version
                  <HoverableDescriptionIcon
                    description={
                      'Content Versions provide alternative wording to content that are more suitable for certain kinds of teams or organizations. We suggest leaving the default if you are unsure.'
                    }
                    width={16}
                  />
                </Label>
                <Label
                  style={{
                    fontSize: '13px',
                    marginRight: '20px',
                    marginBottom: '11px',
                    width: '244px',
                    height: '32px',
                    marginTop: 'auto',
                  }}
                  id={`vertical-horizontal-select-label`}
                >
                  Vertical or Horizontal
                  <HoverableDescriptionIcon
                    description={
                      "Select 'Vertical' for any market-facing team or organizational unit. Select 'Horizontal' for any internally-facing teams, departments, or other organizational groups."
                    }
                    width={16}
                  />
                </Label>
                <div
                  style={{
                    fontSize: '13px',
                    width: '42px',
                    marginRight: '20px',
                    height: '32px',
                    marginTop: 'auto',
                  }}
                >
                  {/* No header here */}
                </div>
                <Label
                  style={{
                    fontSize: '13px',
                    width: '72px',
                    marginRight: '20px',
                    height: '32px',
                    marginTop: 'auto',
                    marginBottom: '11px',
                  }}
                >
                  Admins
                </Label>
                <Label
                  style={{
                    fontSize: '13px',
                    width: '80px',
                    height: '32px',
                    marginTop: 'auto',
                    marginBottom: '11px',
                  }}
                >
                  Members
                </Label>
              </Row>
              {businessUnits.map(businessUnit => (
                <Row>
                  <form
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div
                      style={{
                        width: '170px',
                        marginRight: '20px',
                      }}
                    >
                      <DisplayText>{businessUnit.name}</DisplayText>
                    </div>
                    <div
                      style={{
                        marginRight: '20px',
                      }}
                    >
                      <DropdownSelect
                        label={'Industry'}
                        record={organization}
                        options={industrySubcategories}
                        updateRecord={updateOrg}
                        fieldToUpdate={'industry_subcategory_id'}
                      />
                    </div>
                    <div
                      style={{
                        marginRight: '20px',
                      }}
                    >
                      <DropdownSelect
                        label={'Content Version'}
                        toolTip={
                          'Content Versions provide alternative wording to content that are more suitable for certain kinds of teams or organizations. We suggest leaving the default if you are unsure.'
                        }
                        record={organization}
                        options={contentVersions}
                        updateRecord={updateOrg}
                        fieldToUpdate={'default_content_version_id'}
                      />
                    </div>
                    <div
                      style={{
                        marginRight: '20px',
                      }}
                    >
                      <DropdownSelect
                        label={'Vertical or Horizontal'}
                        toolTip={
                          "Select 'Vertical' for any market-facing team or organizational unit. Select 'Horizontal' for any internally-facing teams, departments, or other organizational groups."
                        }
                        record={businessUnit}
                        options={[
                          { name: 'Vertical', id: 'Vertical' },
                          { name: 'Horizontal', id: 'Horizontal' },
                        ]}
                        updateRecord={updateOrg}
                        fieldToUpdate={'structure'}
                      />
                    </div>
                    <div
                      style={{
                        width: '42px',
                        marginTop: '2px',
                      }}
                    >
                      <BusinessUnitActionMenu
                        name={businessUnit.name}
                        handleClone={() => this.cloneBusinessUnit(businessUnit)}
                        handleRemove={() =>
                          this.removeBusinessUnit(businessUnit)
                        }
                      />
                    </div>
                    {/* Admins */}
                    <div
                      style={{
                        width: '80px',
                        marginTop: '-10px',
                      }}
                    >
                      <OrganizationRoles
                        roles={
                          apiStore.currentUserOrganization.primary_group.roles
                        }
                        canEdit={
                          apiStore.currentUserOrganization.primary_group
                            .can_edit
                        }
                      />
                    </div>
                    {/* Members */}
                    <div
                      style={{
                        width: '80px',
                        marginTop: '-10px',
                      }}
                    >
                      <OrganizationRoles
                        roles={
                          apiStore.currentUserOrganization.primary_group.roles
                        }
                        canEdit={
                          apiStore.currentUserOrganization.primary_group
                            .can_edit
                        }
                      />
                    </div>
                  </form>
                </Row>
              ))}
              <div>
                <AddTeamButton handleClick={createBusinessUnit} />
              </div>
            </React.Fragment>
          </TabPanel>
        </React.Fragment>
      </div>
    )
  }
}

CreativeDifferenceTabs.propTypes = {
  orgName: PropTypes.string,
  tab: PropTypes.oneOf(['teams', 'organization']),
}

CreativeDifferenceTabs.wrappedComponent.propTypes = {
  apiStore: MobxPropTypes.objectOrObservableObject.isRequired,
  routingStore: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default CreativeDifferenceTabs
