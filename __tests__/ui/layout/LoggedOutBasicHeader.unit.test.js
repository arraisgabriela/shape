import LoggedOutBasicHeader from '~/ui/layout/LoggedOutBasicHeader'

import { fakeOrganization } from '#/mocks/data'

let props, wrapper, rerender

describe('LoggedOutBasicHeader', () => {
  beforeEach(() => {
    props = {
      organization: null,
    }
    rerender = () => {
      wrapper = shallow(<LoggedOutBasicHeader {...props} />)
    }
    rerender()
  })

  it('renders logo', () => {
    expect(wrapper.find('Logo').exists()).toEqual(true)
  })

  it('shows login', () => {
    const loginLink = wrapper.find('StyledLoginLink a')
    expect(loginLink.exists()).toEqual(true)
    expect(loginLink.props().href).toEqual('/login')
  })

  it('does not show org avatar if no organization', () => {
    expect(wrapper.find('.organization-avatar').exists()).toEqual(false)
  })

  describe('with org menu true', () => {
    beforeEach(() => {
      props = {
        organization: fakeOrganization,
      }
      rerender()
    })

    it('shows org avatar', () => {
      expect(wrapper.find('.organization-avatar').exists()).toEqual(true)
    })
  })
})
