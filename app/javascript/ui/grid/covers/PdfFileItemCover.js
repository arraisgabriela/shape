import { observer, PropTypes as MobxPropTypes } from 'mobx-react'
import styled from 'styled-components'
import CornerIcon from '~/ui/icons/CornerIcon'
import { GridCardIconWithName, StyledFileCover } from '~/ui/grid/shared'
import FileIcon from '~/ui/grid/covers/FileIcon'
import { uiStore } from '~/stores'

const clipPath = orientation => {
  const { gridSettings } = uiStore
  const { gridW, gridH } = gridSettings
  return orientation === 'landscape'
    ? `polygon(0 0,0 100%,100% 100%,100% ${gridW / 6.08}px,${gridH / 1.02}px 0)`
    : `polygon(0 0,0 100%,100% 100%,100% ${gridW / 5.96}px,${gridH / 1.17}px 0)`
}

export const ImageContainer = styled.div`
  border-radius: 12px;
  clip-path: ${props => clipPath(props.orientation)};
  overflow: hidden;
  position: relative;
  transform: rotate(-8deg) translateX(${props => props.x})
    translateY(${props => props.y}) translateZ(0);
  transform-origin: 0 0;
  width: ${props => (props.orientation === 'portrait' ? 85 : 95)}%;
  img {
    width: 100%;
  }
`
ImageContainer.displayName = 'StyledImageContainer'

const CornerContainer = styled.div`
  color: gray;
  height: 54px;
  position: absolute;
  ${props => {
    if (uiStore.gridSettings.layoutSize === 3) {
      return `
        right: -3px;
        top: -6px;
        width: 48px;
      `
    }
    return `
      right: 0;
      top: -3px;
      width: 54px;
    `
  }}
`

@observer
class PdfFileItemCover extends React.Component {
  calculateCoverTranslation = () => {
    const { item } = this.props
    const { dimensions } = item.filestack_file.docinfo
    const { gridW, gridH } = uiStore.gridSettings
    let coverX = gridW * 0.01
    let coverY = gridH * 0.2
    let orientation = 'portrait'
    const ratio = dimensions.width / dimensions.height
    // if the image is more square/wide...
    if (ratio > 0.8) {
      const shrinkRatio = dimensions.width / (gridW * 0.95)
      const height = dimensions.height / shrinkRatio
      orientation = 'landscape'
      coverX = gridW * -0.05
      coverY = gridH * 1.1 - height
    }
    return { coverX, coverY, orientation }
  }

  handleClick = ev => {
    ev.preventDefault()
    const { item } = this.props
    const { filestack_file } = item
    window.open(filestack_file.url, '_blank')
  }

  render() {
    const { item } = this.props
    const { filestack_file, pdfCoverUrl } = item
    const { coverX, coverY, orientation } = this.calculateCoverTranslation()
    return (
      <StyledFileCover onClick={this.handleClick}>
        <ImageContainer
          x={`${coverX}px`}
          y={`${coverY}px`}
          orientation={orientation}
        >
          <CornerContainer>
            <CornerIcon />
          </CornerContainer>
          <img src={pdfCoverUrl} alt="Pdf cover" />
        </ImageContainer>
        <div className="fileInfo">
          <GridCardIconWithName
            text={filestack_file.filename}
            icon={<FileIcon mimeType={item.filestack_file.mimetype} />}
          />
        </div>
      </StyledFileCover>
    )
  }
}

PdfFileItemCover.propTypes = {
  item: MobxPropTypes.objectOrObservableObject.isRequired,
}

export default PdfFileItemCover
