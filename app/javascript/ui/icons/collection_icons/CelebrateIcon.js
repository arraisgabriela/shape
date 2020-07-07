import PropTypes from 'prop-types'
import Icon from '~/ui/icons/Icon'

const CelebrateIcon = ({ size }) => (
  <Icon fill>
    {size === 'lg' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <path d="M13.302 13.273a.653.653 0 00-1.016.276L7.592 25.94a.648.648 0 00.944.786l11.48-6.931a.654.654 0 00.071-1.064l-6.785-5.458zm-.118 1.576l1.958 1.576.77 4.33-1.737 1.049-1.278-6.202.287-.753zm-1.738 8.603l-.549-2.564 1.143-3.017.957 4.645-1.551.936zm-1.399-.322l.221 1.033-.794.48.573-1.513zm7.059-3.095l-.422-2.37 1.864 1.499-1.442.871zM16.12 12.057a.651.651 0 00.806-.443l.891-3.064a.65.65 0 00-1.248-.364l-.891 3.064a.65.65 0 00.442.807zM24.021 14.457l-3.108.723a.65.65 0 10.294 1.265l3.108-.723a.65.65 0 10-.294-1.265zM18.653 13.702a.65.65 0 00.918-.047l3.525-3.904a.649.649 0 10-.965-.871l-3.525 3.904a.649.649 0 00.047.918zM25.552 7.628l.076-.072a.65.65 0 00-.362-1.113l-.105-.015-.046-.095c-.217-.449-.953-.449-1.17 0l-.046.095-.104.015a.648.648 0 00-.362 1.112l.076.073-.019.104a.653.653 0 00.258.642c.202.146.47.162.689.047l.093-.051.093.051a.656.656 0 00.689-.047.651.651 0 00.258-.642l-.018-.104zM17.156 6.931a.646.646 0 00.625.077.647.647 0 00.892-.647.65.65 0 00-.341-1.049c-.235-.375-.865-.375-1.101 0a.649.649 0 00-.34 1.048.645.645 0 00.265.571zM27.508 14.119a.654.654 0 00-.46-.431c-.235-.377-.867-.377-1.103 0a.651.651 0 00-.34 1.049.648.648 0 00.891.646.642.642 0 00.625-.077.65.65 0 00.266-.57.646.646 0 00.121-.617z" />
      </svg>
    )}
    {size === 'xxl' && (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
        <path d="M209.5 214.6l-48.9-39.3-.1-.1-34.9-28.1c-1.2-1-2.9-1.3-4.4-.9-1.5.4-2.8 1.6-3.4 3.1L59.7 302.4c-.8 2-.2 4.2 1.5 5.6.9.8 2.1 1.2 3.2 1.2.9 0 1.8-.2 2.6-.7l34.3-20.7c.3-.1.6-.3.8-.5l32.6-19.7c.5-.2.9-.4 1.2-.8l35-21.1c.3-.1.5-.3.7-.4l37.3-22.5c1.4-.8 2.3-2.3 2.4-3.9.2-1.7-.5-3.3-1.8-4.3zm-84.8-55.4l28.4 22.8 10.1 56.7-26.9 16.3-16.9-81.7 5.3-14.1zm-22.2 116.2l-7.9-36.7 18.2-47.9 14.4 69.7-24.7 14.9zm-14.4-19.5l5.4 25-19.2 11.6 13.8-36.6zm84.2-22.7l-7.4-41.6 32.7 26.3-25.3 15.3zM163.2 126.7c.5.1.9.2 1.4.2 2.2 0 4.2-1.4 4.8-3.6l11-37.9c.8-2.7-.8-5.4-3.4-6.2-2.6-.8-5.4.8-6.2 3.4l-11 37.9c-.8 2.7.8 5.4 3.4 6.2zM260.8 162.3l-38.4 8.9c-2.7.6-4.4 3.3-3.7 6 .5 2.3 2.6 3.9 4.9 3.9.4 0 .8 0 1.1-.1l38.4-8.9c2.7-.6 4.4-3.3 3.7-6-.7-2.7-3.3-4.4-6-3.8zM199.1 149c1.4 0 2.7-.6 3.7-1.6l43.6-48.2c1.9-2 1.7-5.2-.4-7.1-2-1.9-5.2-1.7-7.1.4l-43.6 48.2c-1.9 2-1.7 5.2.4 7.1 1 .8 2.2 1.2 3.4 1.2zM275.1 63.3l-2.9-.4-1.3-2.7c-.8-1.7-2.6-2.8-4.5-2.8s-3.6 1.1-4.5 2.8l-1.2 2.6-3 .4c-1.9.3-3.5 1.6-4.1 3.4-.6 1.8-.1 3.8 1.3 5.1l2.1 2-.5 2.8c-.3 1.9.4 3.8 2 5 1.6 1.1 3.6 1.2 5.3.3l2.5-1.4L269 82c.7.4 1.6.6 2.4.6 1 0 2.1-.3 2.9-1 1.6-1.1 2.3-3 2-4.9l-.5-2.9 2.1-2c1.4-1.3 1.9-3.3 1.3-5.1-.6-1.9-2.2-3.2-4.1-3.4zM175.1 58.1l-.1.8c-.3 1.9.5 3.8 2 5 1.6 1.1 3.7 1.2 5.3.3l.5-.3.5.3c.8.4 1.6.6 2.5.6 1 0 2-.3 2.9-.9 1.6-1.1 2.4-3 2-5l-.1-.8.6-.6c1.4-1.3 1.9-3.4 1.3-5.2-.6-1.8-2.2-3.1-4.2-3.4l-.7-.1-.3-.6c-.8-1.7-2.6-2.8-4.5-2.8s-3.7 1.1-4.5 2.8l-.3.6-.6.1c-1.9.2-3.5 1.5-4.1 3.3-.6 1.8-.2 3.8 1.2 5.2l.6.7zM300.3 156c-.6-1.8-2.2-3.1-4.2-3.4l-.7-.1-.3-.6c-.8-1.7-2.6-2.8-4.5-2.8s-3.7 1.1-4.5 2.8l-.3.6-.6.1c-1.9.2-3.5 1.5-4.1 3.3-.6 1.8-.2 3.8 1.2 5.2l.6.6-.1.8c-.3 1.9.4 3.8 2 4.9.9.6 1.9 1 2.9 1 .8 0 1.6-.2 2.4-.6l.6-.3.6.3c1.7.9 3.7.8 5.3-.4 1.5-1.1 2.3-3 2-4.9l-.1-.8.6-.6c1.4-1.2 1.9-3.3 1.2-5.1z" />
      </svg>
    )}
  </Icon>
)

CelebrateIcon.propTypes = {
  size: PropTypes.string,
}

CelebrateIcon.defaultProps = {
  size: 'lg',
}

export default CelebrateIcon