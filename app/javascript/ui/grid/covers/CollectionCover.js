import _ from 'lodash'
import PropTypes from 'prop-types'
import { inject, observer, PropTypes as MobxPropTypes } from 'mobx-react'
import { action, observable } from 'mobx'
import styled from 'styled-components'
import Dotdotdot from 'react-dotdotdot'

import FilestackUpload from '~/utils/FilestackUpload'
import v from '~/utils/variables'
import PlainLink from '~/ui/global/PlainLink'
import { CardHeading } from '~/ui/global/styled/typography'
import TextItemCover from '~/ui/grid/covers/TextItemCover'
import CarouselCover from '~/ui/grid/covers/CarouselCover'
import Button from '~/ui/global/Button'
import { ReviewButton } from '~/ui/global/challenge/shared'
import { RoundPill } from '~/ui/global/styled/forms'
import { routingStore } from '~/stores'
import CollectionCoverTitle, {
  IconHolder,
} from '~/ui/grid/covers/CollectionCoverTitle'
import CollectionIcon from '~/ui/icons/CollectionIcon'
import CollectionDateRange from '~/ui/grid/CollectionDateRange'
import DateProgressBar from '~/ui/global/DateProgressBar'
import CollectionTypeSelector from '~/ui/global/CollectionTypeSelector'

const LaunchButton = styled(Button)`
  font-size: 0.9rem;
  padding: 0 1rem;
  width: auto;
  background-color: ${v.colors.alert};
  &:hover {
    background-color: ${v.colors.tertiaryMedium};
  }
`
LaunchButton.displayName = 'LaunchButton'

const CardButtonWrapper = styled.div`
  margin-left: calc(50% - ${v.buttonSizes.header.width / 2}px);
  padding-bottom: 4px;
`
CardButtonWrapper.displayName = 'CardButtonWrapper'

export const StyledCollectionCover = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.backgroundColor};
  color: white;
  position: relative;
  ${props =>
    props.url &&
    `
    background-image: url(${props.url});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: white;
  `};
`
StyledCollectionCover.displayName = 'StyledCollectionCover'

const pad = 16
const calcSectionWidth = props => {
  if (props.width === 4) {
    return `${props.gridW * 2 - props.gutter * 2}px`
  } else if (props.width === 3) {
    return `${props.gridW * 1.6 - props.gutter * 1.6}px`
  } else if (props.width > 1) {
    return `${props.gridW - props.gutter * 3}px`
  }
  return `calc(100% - ${props.gutter * 3}px)`
}

const calcSectionHeight = props => {
  const { isTextItem, height, useTextBackground, gutter } = props
  if (isTextItem) return 'auto'
  if (useTextBackground) return '50%'
  let reduceBy
  if (height > 1) {
    reduceBy = `${pad + gutter / 2}px`
  } else {
    reduceBy = `${pad}px`
  }
  return `calc(50% - ${reduceBy})`
}

const calcTopAndBottom = props => {
  const { useTextBackground, isTextItem, height, gutter } = props
  if (useTextBackground) {
    return {
      top: {
        top: 0,
        bottom: 'auto',
      },
      bottom: {
        bottom: 0,
      },
    }
  }
  return {
    top: {
      top: `${isTextItem ? 'auto' : gutter / 2 + pad}px`,
      bottom: isTextItem ? '13px' : 'auto',
    },
    bottom: {
      bottom: `${height === 1 ? 4 : pad}px`,
    },
  }
}

const CoverIconWrapper = styled.div`
  position: relative; /* Need a style rule for it to work */
`
CoverIconWrapper.displayName = 'CoverIconWrapper'

const StyledCardContent = styled.div`
  .top,
  .bottom {
    color: ${props => (props.color ? props.color : 'white')};
    font-family: ${v.fonts.sans};
    font-size: 1rem;
    letter-spacing: 0;
    line-height: 1.375rem;

    position: absolute;
    right: 1.5rem;
    width: ${props => calcSectionWidth(props)};
    height: ${props => calcSectionHeight(props)};

    /* Text style for the text and media covers */
    h1 {
      color: ${props => props.color || v.colors.white};
      ${props => props.useTextBackground && 'padding: 0; margin-bottom: 0;'}
    }

    &.text-item {
      a {
        color: ${v.colors.ctaPrimary};
        text-decoration: none;
      }
    }
  }
  .top {
    top: ${props => calcTopAndBottom(props).top.top};
    bottom: ${props => calcTopAndBottom(props).top.bottom};
  }
  .bottom {
    bottom: ${props => calcTopAndBottom(props).bottom.bottom};
  }

  ${props =>
    props.width > 1 &&
    `
    top: 33%;
    left: 40%;
    padding-right: 2rem;
  `};

  ${CoverIconWrapper} {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => v.defaultGridSettings.gridH * props.height}px;
    color: ${v.colors.commonMedium};
    overflow: hidden;
    .icon {
      left: -20%;
      ${props =>
        props.height > 1
          ? `
        height: 70%;
        width: 70%;
        top: 15%;
      `
          : `height: 130%; width: 130%; top: -15%`}
    }
  }
`
StyledCardContent.displayName = 'StyledCardContent'

const PositionedCardHeading = styled(CardHeading)`
  bottom: 0;
  position: absolute;
`

export const TextWithBackground = styled.span`
  display: inline;
  background-color: ${v.colors.white};
  box-decoration-break: clone; /* This makes it so the left and right padding is equal when the lines break */
  padding: 0.3rem 0.3rem 0.2rem 0.3rem;
  line-height: inherit;
`

@inject('uiStore', 'apiStore')
@observer
class CollectionCover extends React.Component {
  @observable
  hasEmptyCarousel = false

  get backgroundColor() {
    const { collection } = this.props
    if (collection.isSpecialCollection) return v.colors.offset
    // If image is present, have white background (for transparent images)
    if (this.coverImageUrl) return v.colors.white
    // Otherwise default color
    return v.colors.collectionCover
  }

  openMoveMenuForTemplate = async e => {
    const { collection } = this.props
    collection.toggleTemplateHelper()
  }

  get hasCollectionScore() {
    const { uiStore, inSubmissionsCollection } = this.props
    // scores only apply to cards within a SubmissionsCollection
    if (!inSubmissionsCollection) return false
    const order = uiStore.collectionCardSortOrder
    return order === 'total' || order.indexOf('question_') > -1
  }

  get collectionScore() {
    const { collection, uiStore } = this.props
    const order = uiStore.collectionCardSortOrder
    // don't display score for ordering like 'updated_at'
    if (!this.hasCollectionScore) return ''

    const orderName = order.question_title
    const score = collection.test_scores[order]
    return (
      <RoundPill>
        Result: {orderName}: <strong>{score}%</strong>
      </RoundPill>
    )
  }

  get hasLaunchTestButton() {
    const { collection } = this.props
    // TODO: Distinguish tests with test design from FSRC as FSRC shouldn't show the test buttons from the cover
    if (!collection.collection_to_test_id) {
      // FIXME: hide button since there's an issue when launching tests from the cover when no audience has been selected
      // so this only works for in-collection tests
      return false
    }
    return (
      // This button only appears for tests inside submissions
      collection.is_inside_a_submission &&
      collection.launchableTestId &&
      // if it's live you have the option to close
      // otherwise it must be launchable to see a launch or re-open button
      (collection.isLiveTest || collection.launchable)
    )
  }

  get launchTestButton() {
    const { collection, uiStore } = this.props
    if (!this.hasLaunchTestButton) return ''
    let launchCollection = collection.launchTest
    let buttonText = 'Start Feedback'
    if (collection.isLiveTest) {
      buttonText = 'Stop Feedback'
      launchCollection = collection.closeTest
    } else if (collection.isClosedTest) {
      buttonText = 'Re-open Feedback'
      launchCollection = collection.reopenTest
    }

    return (
      <LaunchButton
        className="cancelGridClick"
        onClick={launchCollection}
        disabled={uiStore.launchButtonLoading}
      >
        {buttonText}
      </LaunchButton>
    )
  }

  get hasUseTemplateButton() {
    const { collection } = this.props
    return collection.isUsableTemplate
  }

  get numberOfLinesForDescription() {
    const { uiStore } = this.props
    // these buttons take up space so we reduce # of lines
    const reduced = this.hasUseTemplateButton || this.hasCollectionScore
    if (reduced) {
      // in smaller layout you can really only fit 1 line
      if (uiStore.gridSettings.layoutSize === 3) {
        return 1
      }
      return 2
    }
    return 3
  }

  get useTemplateButton() {
    return (
      <CardButtonWrapper>
        <Button
          minWidth={v.buttonSizes.header.width}
          size="sm"
          onClick={this.openMoveMenuForTemplate}
          data-cy="CollectionCoverFormButton"
          className="CollectionCoverFormButton"
          colorScheme={v.colors.white}
          outline
        >
          Use Template
        </Button>
      </CardButtonWrapper>
    )
  }

  get coverImageUrl() {
    const { cover } = this.props.collection
    if (cover.image_handle) {
      return FilestackUpload.imageUrl({
        handle: cover.image_handle,
      })
    }
    return cover.image_url
  }

  @action
  setEmptyCarousel = () => {
    this.hasEmptyCarousel = true
  }

  handleClick = e => {
    // TODO is this being used?
    const { searchResult, dragging, uiStore, collection } = this.props
    const { movingCardIds } = uiStore
    const movingCard =
      movingCardIds &&
      _.includes(
        movingCardIds,
        collection.parent_collection_card &&
          collection.parent_collection_card.id
      )
    const makingSelection =
      (e.metaKey || e.ctrlKey || e.shiftKey) && uiStore.selectedCardIds.length
    if (dragging || makingSelection || movingCard) {
      e.preventDefault()
      return false
    }

    if (collection.can_view || searchResult) return true

    // User does not have permission to see collection
    e.preventDefault()
    e.stopPropagation()
    uiStore.showPermissionsAlert()
    return false
  }

  get requiresOverlay() {
    const { collection } = this.props
    const { cover } = collection

    return !!(cover && cover.image_url)
  }

  get useTextBackground() {
    const {
      collection: { tag_list },
    } = this.props
    return tag_list && tag_list.includes('case study')
  }

  render() {
    const {
      height,
      width,
      collection,
      searchResult,
      uiStore,
      textItem,
      cardId,
      fontColor,
      inSubmissionsCollection,
      isReviewable,
    } = this.props
    const {
      subtitle,
      collection_type,
      icon,
      show_icon_on_cover,
      submission_reviewer_status,
    } = collection

    const { gridW, gutter } = uiStore.gridSettings
    // Don't show collection/foamcore for selector since that will be shown in lower left of card
    const collIcon = collection_type !== 'collection' &&
      collection_type !== 'foamcore' && (
        <CollectionIcon type={collection_type} />
      )

    return (
      <StyledCollectionCover
        data-cy="CollectionCover"
        url={this.coverImageUrl}
        isSpecialCollection={collection.isSpecialCollection}
        backgroundColor={this.backgroundColor}
      >
        {collection.isCarousel && !this.hasEmptyCarousel ? (
          <CarouselCover
            collection={collection}
            // trigger a reload
            updatedAt={collection.updated_at}
            dragging={false}
            onEmptyCarousel={this.setEmptyCarousel}
          />
        ) : (
          <StyledCardContent
            height={height}
            width={width}
            gutter={gutter}
            gridW={gridW}
            isTextItem={!!textItem}
            color={fontColor}
            useTextBackground={this.useTextBackground}
          >
            <div className={this.requiresOverlay ? 'overlay' : ''} />
            {show_icon_on_cover && (
              <CoverIconWrapper>
                <CollectionIcon type={icon} size="xxl" />
              </CoverIconWrapper>
            )}
            {collection.isPhaseOrProject &&
              collection.start_date &&
              collection.end_date && (
                <DateProgressBar
                  startDate={collection.start_date}
                  endDate={collection.end_date}
                />
              )}
            {textItem ? (
              <div className="top text-item">
                <TextItemCover
                  item={textItem}
                  height={height}
                  dragging={false}
                  cardId={cardId}
                  handleClick={this.handleClick}
                  searchResult={searchResult}
                  hideReadMore
                  uneditable
                  isTransparent={true}
                />
              </div>
            ) : (
              <div>
                <div className="top">
                  <PositionedCardHeading>
                    <Dotdotdot clamp={height > 1 ? 6 : 3}>
                      <PlainLink
                        style={{ marginRight: '5px' }}
                        className="no-select cancelGridClick"
                        onClick={this.handleClick}
                        to={routingStore.pathTo('collections', collection.id)}
                        data-cy="collection-cover-link"
                        color={fontColor}
                      >
                        <CollectionCoverTitle
                          collection={collection}
                          useTextBackground={this.useTextBackground}
                        />
                      </PlainLink>
                      {collIcon && (
                        <CollectionTypeSelector
                          location={'CollectionCover'}
                          collection={collection}
                        >
                          <IconHolder>{collIcon}</IconHolder>
                        </CollectionTypeSelector>
                      )}
                    </Dotdotdot>
                    {this.button}
                  </PositionedCardHeading>
                </div>
                <div className="bottom">
                  {collection.isPhaseOrProject && (
                    <CollectionDateRange collection={collection} />
                  )}
                  {this.launchTestButton}
                  {inSubmissionsCollection &&
                    isReviewable &&
                    submission_reviewer_status && (
                      <ReviewButton
                        reviewerStatus={submission_reviewer_status}
                        onClick={() => {
                          routingStore.routeTo(
                            'tests',
                            collection.launchableTestId
                          )
                        }}
                      />
                    )}
                  {this.collectionScore}
                  {this.hasUseTemplateButton && this.useTemplateButton}
                  {!this.hasLaunchTestButton && subtitle && (
                    <Dotdotdot clamp={this.numberOfLinesForDescription}>
                      {this.useTextBackground ? (
                        <TextWithBackground>{subtitle}</TextWithBackground>
                      ) : (
                        subtitle
                      )}
                    </Dotdotdot>
                  )}
                </div>
              </div>
            )}
          </StyledCardContent>
        )}
      </StyledCollectionCover>
    )
  }
}

CollectionCover.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  collection: MobxPropTypes.objectOrObservableObject.isRequired,
  cardId: PropTypes.string.isRequired,
  inSubmissionsCollection: PropTypes.bool,
  dragging: PropTypes.bool,
  searchResult: PropTypes.bool,
  textItem: MobxPropTypes.objectOrObservableObject,
  fontColor: PropTypes.string,
  isReviewable: PropTypes.bool,
}
CollectionCover.wrappedComponent.propTypes = {
  uiStore: MobxPropTypes.objectOrObservableObject.isRequired,
}
CollectionCover.defaultProps = {
  width: 1,
  height: 1,
  inSubmissionsCollection: false,
  dragging: false,
  searchResult: false,
  textItem: null,
  fontColor: v.colors.white,
  isReviewable: false,
}

CollectionCover.displayName = 'CollectionCover'

export default CollectionCover
