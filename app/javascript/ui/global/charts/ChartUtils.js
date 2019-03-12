import PropTypes from 'prop-types'
import { PropTypes as MobxPropTypes } from 'mobx-react'
import moment from 'moment-mini'
import styled from 'styled-components'
import pluralize from 'pluralize'

import v from '~/utils/variables'

export const utcMoment = date => moment(`${date} 00+0000`).utc()

export const datasetPropType = PropTypes.shape({
  measure: PropTypes.string.isRequired,
  description: PropTypes.string,
  chart_type: PropTypes.string.isRequired,
  timeframe: PropTypes.string.isRequired,
  primary: PropTypes.bool.isRequired,
  fill: PropTypes.string,
  max_domain: PropTypes.number,
  single_value: PropTypes.number,
  data: MobxPropTypes.arrayOrObservableArrayOf(
    PropTypes.shape({
      value: PropTypes.number.isRequired,
      date: PropTypes.string.isRequired,
    })
  ),
})

export const primaryFillColorFromDatasets = datasets => {
  if (!datasets) return '#000000'
  const primary = datasets.filter(dataset => dataset.primary)
  return primary ? primary.chartFill : '#000000'
}

export const chartDomainForDatasetValues = ({ values, maxDomain }) => {
  let domain
  if (maxDomain) {
    domain = maxDomain
  } else {
    const vals = values.map(datum => datum.value)
    domain = Math.max(...vals)
  }
  return {
    x: [1, values.length],
    y: [0, domain],
  }
}

export const renderTooltip = ({
  datum,
  isLastDataPoint,
  timeframe,
  measure,
}) => {
  const momentDate = utcMoment(datum.date)
  let timeRange = `${momentDate
    .clone()
    .subtract(1, timeframe)
    .format('MMM D')} - ${momentDate.format('MMM D')}`

  let dayTimeframe = '7 days'
  if (timeframe === 'month') {
    timeRange = `in ${momentDate
      .clone()
      .subtract(1, 'month')
      .format('MMMM')}`
    dayTimeframe = '30 days'
  }
  if (timeframe === 'day') {
    timeRange = `on ${momentDate.format('MMM D')}`
  }
  let text = datum.value
  if (measure) {
    text += ` ${pluralize(measure)}\n`
  }
  text += isLastDataPoint ? `in last ${dayTimeframe}` : timeRange
  return text
}

export const addDuplicateValueIfSingleValue = values => {
  if (values.length === 0 || values.length > 1) return values

  // Copy array so we can modify it
  const valuesWithDupe = [...values]

  // Add a duplicate value
  const duplicateValue = Object.assign({ isDuplicate: true }, valuesWithDupe[0])
  // Set date to 3 months ago
  if (duplicateValue.date) {
    duplicateValue.date = utcMoment(duplicateValue.date)
      .subtract('3', 'months')
      .format('YYYY-MM-DD')
    if (duplicateValue.month) duplicateValue.month = duplicateValue.date
  }
  valuesWithDupe.push(duplicateValue)
  return valuesWithDupe
}

export const AboveChartContainer = styled.div`
  position: absolute;
  z-index: ${v.zIndex.aboveVictoryChart};
`
