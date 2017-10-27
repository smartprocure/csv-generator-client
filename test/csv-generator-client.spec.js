import _ from 'lodash'
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

  it('allow empty arrays', () => {
    let expected = {
      separator: ',',
      fileName: 'items.csv',
      dataArray: [],
    }

    expect(csv.initSettings({}, 'items.csv', [])).to.deep.equal(expected)
  })

  it('require a two dimensional data array', () => {
    expect(_.bind(csv.initSettings, null, {}, 'items.csv', dataArray[0])).to.throw('A two dimensional data array is required')
  })

  it('require a file name', () => {
    expect(_.bind(csv.initSettings, null, {}, null, dataArray)).to.throw('A file name is required')
    expect(_.bind(csv.initSettings, null, {}, undefined, dataArray)).to.throw('A file name is required')    
  })

  it('initialize with custom settings', () => {
    let expected = {
      separator: '"|"',
      fileName: 'items.csv',
      dataArray
    }

    expect(
      csv.initSettings(
        { separator: '|', addQuotes: true },
        'items.csv',
        dataArray
      )
    ).to.deep.equal(expected)
  })

  it('get download link', () => {
    expect(csv.getDownloadLink('|', dataArray)).to.equal('data:text/csv;charset=utf-8;base64,MXwyfDMNCjR8NXw2fDc=')
  })
})
