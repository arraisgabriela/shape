import { propTypes, defaultProps } from './iconProps'

const AddCollectionIcon = ({ color, width, height }) => (
  <svg width={width} height={height} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M53 98.72777c0 1.10457-.89543 2-2 2s-2-.89543-2-2V69c0-3.3137 2.6863-6 6-6h76.91543c3.3137 0 6 2.6863 6 6v55.9754c0 3.31372-2.6863 6-6 6H79.97828c-1.10457 0-2-.89542-2-2 0-1.10456.89543-2 2-2h51.93715c1.10457 0 2-.89542 2-2V69c0-1.10457-.89543-2-2-2H55c-1.10457 0-2 .89543-2 2v29.72777z" fill={color} />
    <path d="M63 66.41732h-4V59c0-3.3137 2.6863-6 6-6h76.91543c3.3137 0 6 2.6863 6 6v55.9754c0 3.31372-2.6863 6-6 6h-6.84867v-4h6.84867c1.10457 0 2-.89542 2-2V59c0-1.10457-.89543-2-2-2H65c-1.10457 0-2 .89543-2 2v7.41732z" fill={color} />
    <path d="M73 56.15847h-4V49c0-3.3137 2.6863-6 6-6h76.91543c3.3137 0 6 2.6863 6 6v55.9754c0 3.31372-2.6863 6-6 6h-6.7886v-4h6.7886c1.10457 0 2-.89542 2-2V49c0-1.10457-.89543-2-2-2H75c-1.10457 0-2 .89543-2 2v7.15847zm-18.74519 55.11104c0-1.10457.89543-2 2-2s2 .89543 2 2v22.03352c0 1.10457-.89543 2-2 2s-2-.89543-2-2v-22.03352z" fill={color} />
    <path d="M67.40633 120.42103c1.10457 0 2 .89543 2 2s-.89543 2-2 2H45.3728c-1.10457 0-2-.89543-2-2s.89543-2 2-2h22.03352z" fill={color} />
  </svg>
)

AddCollectionIcon.propTypes = { ...propTypes }
AddCollectionIcon.defaultProps = { ...defaultProps }

export default AddCollectionIcon
