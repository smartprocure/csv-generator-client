import _ from 'lodash'
import chai from 'chai'
import * as csv from '../src/'

chai.expect()
const expect = chai.expect

let isNative = fn => /\{\s*\[native code\]\s*\}/.test(`${  fn}`)
let dataArray = [[1, 2, 3], [4, 5, 6, 7]]
let _btoa =
  typeof Buffer !== 'undefined' && typeof btoa === 'undefined'
    ? s => Buffer.from(s).toString('base64')
    : typeof btoa !== 'undefined' ? btoa : undefined
let _window = {
  navigator: {
    msSaveBlob: (...args) => args,
  },
}
let isNotRunningIE = () =>
  (typeof btoa === 'undefined' && typeof window === 'undefined') ||
  (typeof btoa === 'undefined' &&
    typeof window !== 'undefined' &&
    !window.navigator.msSaveBlob)

describe('CSV generator', () => {
  afterEach(() => {
    if (typeof global !== 'undefined') {
      if (typeof window !== 'undefined' && !global.window.System) {
        delete global.window
      }

      if (typeof btoa !== 'undefined' && !isNative(btoa)) {
        delete global.btoa
      }

      delete global.Blob
    }
  })

  it('generate data with btoa', () => {
    if (typeof global !== 'undefined' && isNotRunningIE()) {
      global.btoa = _btoa
    }

    if (typeof btoa !== 'undefined') {
      expect(csv.__internals__.getData('|', dataArray)).to.equal(
        'MXwyfDMNCjR8NXw2fDc='
      )
    }
  })

  it('save data with msSaveBlob', () => {
    if (typeof window === 'undefined') {
      global.window = _window
    }

    if (typeof window !== 'undefined' && window.navigator.msSaveBlob) {
      expect(csv.__internals__.getData('|', dataArray)).to.equal(
        '1|2|3\r\n4|5|6|7'
      )
    }
  })

  it('generate data with encodeURIComponent', () => {
    if (isNotRunningIE()) {
      expect(csv.__internals__.getData('|', dataArray)).to.equal(
        '1%7C2%7C3%0D%0A4%7C5%7C6%7C7'
      )
    }
  })

  it('get download link with btoa', () => {
    if (typeof global !== 'undefined' && isNotRunningIE()) {
      global.btoa = _btoa

      if (typeof window === 'undefined') {
        global.window = { navigator: {} }
      }
    }

    if (typeof btoa !== 'undefined') {
      expect(csv.__internals__.getDownloadLink('|', dataArray)).to.equal(
        'data:text/csv;charset=utf-8;base64,MXwyfDMNCjR8NXw2fDc='
      )
    }
  })

  it('get download link without btoa', () => {
    if (typeof global !== 'undefined' && isNotRunningIE()) {
      if (typeof window === 'undefined') {
        global.window = { navigator: {} }
      }
    }
    if (isNotRunningIE()) {
      expect(csv.__internals__.getDownloadLink('|', dataArray)).to.equal(
        'data:text/csv;charset=utf-8,1%7C2%7C3%0D%0A4%7C5%7C6%7C7'
      )
    }
  })

  it('IE download', () => {
    if (typeof window === 'undefined' && typeof Blob === 'undefined') {
      global.window = _window
      global.Blob = () => {}
    }

    if (window.navigator.msSaveBlob) {
      expect(
        _.bind(csv.__internals__.ieDownload, null, ',', 'items.csv', dataArray)
      ).to.not.throw()
    }
  })

  it('initialize with default settings', () => {
    let expected = {
      separator: ',',
      fileName: 'items.csv',
      dataArray,
    }

    expect(
      csv.__internals__.initSettings({}, 'items.csv', dataArray)
    ).to.deep.equal(expected)
  })

  it('allow empty arrays', () => {
    let expected = {
      separator: ',',
      fileName: 'items.csv',
      dataArray: [],
    }

    expect(csv.__internals__.initSettings({}, 'items.csv', [])).to.deep.equal(
      expected
    )
  })

  it('require a two dimensional data array', () => {
    expect(
      _.bind(
        csv.__internals__.initSettings,
        null,
        {},
        'items.csv',
        dataArray[0]
      )
    ).to.throw('A two dimensional data array is required')
  })

  it('require a file name', () => {
    expect(
      _.bind(csv.__internals__.initSettings, null, {}, null, dataArray)
    ).to.throw('A file name is required')
    expect(
      _.bind(csv.__internals__.initSettings, null, {}, undefined, dataArray)
    ).to.throw('A file name is required')
  })

  it('initialize with custom settings', () => {
    let expected = {
      separator: '"|"',
      fileName: 'items.csv',
      dataArray,
    }

    expect(
      csv.__internals__.initSettings(
        { separator: '|', addQuotes: true },
        'items.csv',
        dataArray
      )
    ).to.deep.equal(expected)
  })

  it('download csv', () => {
    if (typeof window !== 'undefined') {
      expect(
        _.bind(csv.download, null, { fileName: 'test.csv', dataArray })
      ).to.not.throw()
    }
  })

  it('get link element csv', () => {
    if (typeof window !== 'undefined') {
      let element = csv.getLinkElement({ fileName: 'test.csv', dataArray })

      let hrefResult =
        typeof btoa === 'undefined'
          ? 'data:text/csv;charset=utf-8,1%2C2%2C3%0D%0A4%2C5%2C6%2C7'
          : 'data:text/csv;charset=utf-8;base64,MSwyLDMNCjQsNSw2LDc='
      expect(element.download, 'test.csv')
      expect(element.href).to.equal(hrefResult)
    }
  })
})
