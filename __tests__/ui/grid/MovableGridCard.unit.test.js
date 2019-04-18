import _ from 'lodash'
import MovableGridCard from '~/ui/grid/MovableGridCard'
import expectTreeToMatchSnapshot from '#/helpers/expectTreeToMatchSnapshot'

import {
  fakeItemCard,
  fakeTextItem,
  fakePosition,
  fakeCollection,
} from '#/mocks/data'

const props = {
  card: fakeItemCard,
  position: fakePosition,
  record: fakeTextItem,
  parent: fakeCollection,
  onDrag: jest.fn(),
  onResize: jest.fn(),
  onDragOrResizeStop: jest.fn(),
  routeTo: jest.fn(),
  menuOpen: false,
  canEditCollection: false,
  isUserCollection: false,
  isSharedCollection: false,
  hoveringOverLeft: false,
  hoveringOverRight: false,
  isBoardCollection: false,
  holdingOver: false,
  dragOffset: { x: 0, y: 0 },
}

let wrapper, instance
describe('MovableGridCard', () => {
  it('renders snapshot', () => {
    expectTreeToMatchSnapshot(wrapper)
  })

  it('renders a placeholder card if cardType is "placeholder"', () => {
    props.cardType = 'placeholder'
    wrapper = shallow(<MovableGridCard {...props} />)
    expect(wrapper.find('GridCardPlaceholder').exists()).toBeTruthy()
  })

  it('renders a blank card creation tool if cardType is "blank"', () => {
    props.cardType = 'blank'
    wrapper = shallow(<MovableGridCard {...props} />)
    expect(wrapper.find('GridCardBlank').exists()).toBeTruthy()
  })

  it('renders an empty card if cardType is "empty"', () => {
    props.cardType = 'empty'
    props.card.position = { x: 0 }
    wrapper = shallow(<MovableGridCard {...props} />)
    expect(wrapper.find('PositionedGridCard').exists()).toBeTruthy()
    expect(wrapper.find('GridCardEmpty').exists()).toBeTruthy()
  })

  describe('as viewer, with grid cards for items and collections', () => {
    beforeEach(() => {
      props.cardType = 'items'
      wrapper = shallow(<MovableGridCard {...props} />)
    })

    it('renders a "Rnd" Resize-n-Draggable component', () => {
      expect(wrapper.find('Rnd').exists()).toBeTruthy()
    })

    it('passes position props to Rnd component', () => {
      expect(wrapper.find('Rnd').props().size).toEqual(
        _.pick(fakePosition, ['width', 'height'])
      )
      expect(wrapper.find('Rnd').props().enableResizing.bottomRight).toBeFalsy()
      expect(wrapper.find('Rnd').props().disableDragging).toBeTruthy()
    })

    it('passes ResizeIcon to Rnd component', () => {
      const ep = wrapper.find('Rnd').props().extendsProps
      const handleComponentWrapper = shallow(<ep.handleComponent.bottomRight />)
      expect(handleComponentWrapper.find('ResizeIcon').exists()).toBeTruthy()
    })

    it('renders a GridCard component', () => {
      expect(wrapper.find('GridCard').props().card).toBe(fakeItemCard)
      expect(wrapper.find('GridCard').props().cardType).toBe('items')
      expect(wrapper.find('GridCard').props().record).toBe(fakeTextItem)
    })
  })

  describe('as editor, with grid cards for items and collections', () => {
    beforeEach(() => {
      props.cardType = 'items'
      props.canEditCollection = true
      wrapper = shallow(<MovableGridCard {...props} />)
    })

    it('passes position props to Rnd component', () => {
      expect(wrapper.find('Rnd').props().size).toEqual(
        _.pick(fakePosition, ['width', 'height'])
      )
      expect(
        wrapper.find('Rnd').props().enableResizing.bottomRight
      ).toBeTruthy()
      expect(wrapper.find('Rnd').props().disableDragging).toBeFalsy()
    })
  })

  describe('when hoveringOverRight', () => {
    beforeEach(() => {
      props.hoveringOverRight = true
      wrapper = shallow(<MovableGridCard {...props} />)
    })

    it('passes hoveringOver to GridCard', () => {
      expect(wrapper.find('GridCard').props().hoveringOver).toBe(true)
    })
  })

  describe('when scrollElement is provided', () => {
    beforeEach(() => {
      props.scrollElement = { scrollBy: jest.fn() }
      wrapper = shallow(<MovableGridCard {...props} />)
      instance = wrapper.instance()
      instance.scrolling = true
    })

    describe('scrollRight', () => {
      it('calls scrollBy on scrollElement', () => {
        instance.scrollRight()
        expect(props.scrollElement.scrollBy).toHaveBeenCalledWith(2, 0)
      })
    })

    describe('scrollLeft', () => {
      it('calls scrollBy on scrollElement', () => {
        instance.scrollLeft()
        expect(props.scrollElement.scrollBy).toHaveBeenCalledWith(-2, 0)
      })
    })
  })
})
