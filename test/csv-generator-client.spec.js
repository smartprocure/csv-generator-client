import chai from 'chai'
import * as csv from '../src/'

chai.expect()
const expect = chai.expect

let dataArray = [[1, 2, 3], [4, 5, 6, 7]]

describe('CSV generator', () => {
  it('generate data', () => {
    expect(csv.getData('|', dataArray)).to.equal('MXwyfDMNCjR8NXw2fDc=')
  })

  it('initialize with default settings', () => {
    let expected = {
      separator: ',',
      fileName: 'items.csv',
      dataArray,
    }

    expect(csv.initSettings({}, 'items.csv', dataArray)).to.deep.equal(expected)
  })

  it('initialize with custom settings', () => {
    let expected = {
      separator: '"|"',
      fileName: 'items.csv',
      dataArray,
    }

    expect(
      csv.initSettings(
        { separator: '|', addQuotes: true },
        'items.csv',
        dataArray
      )
    ).to.deep.equal(expected)
  })
})
