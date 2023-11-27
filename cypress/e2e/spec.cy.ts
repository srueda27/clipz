describe('My First Test', () => {
  it('Sanity test', () => {
    cy.visit('/')
    cy.contains('#header a.text-3xl', 'Clipz')
  })
})
