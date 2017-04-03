const path = require('path')

describe('myfile.js', () => {
  it('should work', () => {
    const go = () => null
    go.should.have.been.calledOnce
  })
})
