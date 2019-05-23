/* global Then */

Then('I should see a collection card named {string}', name => {
  cy.locateWith('CollectionCover', name)
    .last()
    .should('be.visible')
})

Then('I should see {string} in a {string}', (text, el) => {
  cy.locateDataOrClassWith(el, text).should('be.visible')
})

Then('I should see the value {string} in a {string}', (text, el) => {
  cy.locateDataOrClass(el).should('have.value', text)
})

Then('I should see a {string} in the first card', el => {
  cy.get('[data-cy="GridCard"][data-order="0"]')
    .locateDataOrClass(el)
    .should('be.visible')
})

Then('I should see the element {string}', el => {
  cy.locate(el).should('be.visible')
})

Then('I should have an element named {string}', el => {
  cy.locateDataOrClass(el).should('exist')
})

Then('I should see a {string}', selector => {
  cy.locateDataOrClass(selector).should('be.visible')
})

Then('I should not see a {string}', selector => {
  cy.locateDataOrClass(selector).should('not.exist')
})

Then('I should see {int} {string}', (num, el) => {
  cy.locateDataOrClass(el)
    .its('length')
    .should('eq', num)
})

Then('I should see {int} for the single data value', num => {
  const dataValue = cy.get('[data-cy="DataReport-count"]')
  dataValue.should('contain', num)
})

Then('I should see the single data value', () => {
  const dataValue = cy.get('[data-cy="DataReport-count"]')
  dataValue.should('exist')
})

Then('I should see an svg on the report item', () => {
  cy.get('[data-cy="ChartContainer"] svg')
    .first()
    .should('exist')
})

Then('I should see the {string} modal', modalTitle => {
  cy.get(`[role="dialog"][aria-labelledby="${modalTitle}"]`)
    .first()
    .should('exist')
})

Then('I should see the {word} of {int} cards as {word}', (pos, count, size) => {
  // size e.g. "2x1" so we split on 'x'
  const sizes = size.split('x')
  const [width, height] = sizes
  const order = pos === 'last' ? count - 1 : 0
  const cardEl = cy.get(`[data-cy="GridCard"][data-order="${order}"]`)
  cardEl.should('have.attr', 'data-width', width)
  cardEl.should('have.attr', 'data-height', height)
})

Then('the URL should match the captured URL', () => {
  cy.get('@url').then(url => {
    // we should be back on the previous url
    cy.url()
      .as('url')
      .should('eq', url)
  })
})

Then('I should see {string} in the URL', slug => {
  cy.url()
    .as('url')
    .should('match', new RegExp(slug))
})

Then('I should see {string} deselected', selector => {
  cy.locateDataOrClass(selector)
    .first()
    .should('have.css', 'opacity', '0.2')
})

Then(
  'I should see a question with {string} and {int} emojis',
  (selector, count) => {
    cy.locateDataOrClass(selector)
      .children()
      .should('have.length', count)
  }
)
