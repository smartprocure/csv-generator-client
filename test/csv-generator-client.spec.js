import _ from 'lodash'
import chai from 'chai'
import * as csv from '../src/'

chai.expect()
const expect = chai.expect

let dataArray = [[1, 2, 3], [4, 5, 6, 7]]
let _btoa = s => Buffer.from(s).toString('base64')
let _window = {navigator : {msSaveBlob: function () {return arguments} }}
let isNotRunningIE = () => (typeof btoa === 'undefined' && (typeof window === 'undefined')) || 
(typeof btoa === 'undefined' && (typeof window !== 'undefined') && navigator.navigator && !navigator.navigator.msSaveOrOpenBlob)

describe('CSV generator', () => {

  afterEach(() =>  {
    if (typeof global !== 'undefined') {
      delete global.btoa
      delete global.window
      delete global.Blob 
    }
  })

  it('generate data with btoa', () => {
    if (typeof global !== 'undefined') {
      global.btoa = _btoa
    }

    if (typeof btoa !== 'undefined') {
      expect(csv.getData('|', dataArray)).to.equal('MXwyfDMNCjR8NXw2fDc=')
    }
  })

  it('save data with msSaveBlob', () => {
    if (typeof global !== 'undefined') {
      global.window = _window
    }

    if (typeof window !== 'undefined') {
      expect(csv.getData('|', dataArray)).to.equal('1|2|3\r\n4|5|6|7')
    }
  })

  it('generate data with encodeURIComponent', () => {
    if (isNotRunningIE()) {
      expect(csv.getData('|', dataArray)).to.equal('1%7C2%7C3%0D%0A4%7C5%7C6%7C7')
    }
  })

  it('get download link with btoa', () => {    
    if (typeof global !== 'undefined') {
      global.btoa = _btoa
    }

    if (typeof btoa !== 'undefined') {
      expect(csv.getDownloadLink('|', dataArray)).to.equal('data:text/csv;charset=utf-8;base64,MXwyfDMNCjR8NXw2fDc=')
    }
  })

  it('get download link without btoa', () => {
    if (isNotRunningIE()) {
      expect(csv.getDownloadLink('|', dataArray)).to.equal('data:text/csv;charset=utf-8,1%7C2%7C3%0D%0A4%7C5%7C6%7C7')
    }
  })

  it('IE download', () => {    
    if (typeof global !== 'undefined') {
      global.window = _window
      global.Blob = () => {}
    }

    if (window.navigator.msSaveBlob) {
      expect(_.bind(csv.ieDownload, null, ',', 'items.csv', dataArray)).to.not.throw()
    }
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
})
