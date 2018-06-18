import _ from 'lodash'
import chai from 'chai'
import * as csv from '../src/'

chai.expect()
const expect = chai.expect

let isNative = fn => /\{\s*\[native code\]\s*\}/.test(`${fn}`)
let settings = { separator: '|' }
let dataArray = [[1, 2, 3], [4, 5, 6, 7]]
let arrayOfObjects = [
  { name: 'Bob "Bobby" Jones', age: 45, favoriteActivity: 'Fishing' },
  { name: 'Joe', age: 40, favoriteActivity: 'Cycling' },
  { name: 'Tom', favoriteActivity: null },
]
let _btoa =
  typeof Buffer !== 'undefined' && typeof btoa === 'undefined'
    ? s => Buffer.from(s, 'utf8').toString('base64')
    : typeof btoa !== 'undefined'
      ? btoa
      : undefined
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

      if (typeof Blob !== 'undefined' && !isNative(Blob)) {
        delete global.Blob
      }
    }
  })

  describe('getDownloadLink', () => {
    it('get download link with btoa', () => {
      if (isNotRunningIE()) {
        if (typeof global !== 'undefined') {
          global.btoa = _btoa

          if (typeof window === 'undefined') {
            global.window = { navigator: {} }
          }
        }

        if (typeof btoa !== 'undefined') {
          expect(
            csv.__internals__.getDownloadLink(settings, dataArray)
          ).to.equal('data:text/csv;charset=utf-8;base64,MXwyfDMNCjR8NXw2fDc=')
        }
      }
    })
  })

  describe('ieDownload', () => {
    it('not throw', () => {
      if (typeof window === 'undefined' && typeof Blob === 'undefined') {
        global.window = _window
        global.Blob = () => {}
      }

      if (window.navigator.msSaveBlob) {
        expect(
          _.bind(
            csv.__internals__.ieDownload,
            null,
            settings,
            'items.csv',
            dataArray
          )
        ).to.not.throw()
      }
    })
  })

  describe('initSettings', () => {
    it('initialize with default settings', () => {
      let expected = {
        separator: ',',
        addQuotes: false,
        autoDetectColumns: false,
      }

      expect(csv.__internals__.initSettings({}, dataArray)).to.deep.equal(
        expected
      )
    })

    it('initialize with custom settings', () => {
      let expected = {
        separator: '|',
        addQuotes: true,
        autoDetectColumns: true,
        columnKeys: ['name', 'age'],
      }

      expect(
        csv.__internals__.initSettings({
          separator: '|',
          addQuotes: true,
          autoDetectColumns: true,
          columnKeys: ['name', 'age'],
        })
      ).to.deep.equal(expected)
    })
  })

  describe('initData', () => {
    it('allow empty arrays', () => {
      expect(csv.__internals__.initData({}, [])).to.deep.equal([])
    })

    it('not change an array of arrays', () => {
      expect(csv.__internals__.initData({}, dataArray)).to.deep.equal(dataArray)
    })

    it('convert an array of objects to array of arrays', () => {
      let expected = [
        ['Name', 'Age'],
        ['Bob "Bobby" Jones', 45],
        ['Joe', 40],
        ['Tom', undefined],
      ]

      expect(
        csv.__internals__.initData(
          {
            separator: ',',
            autoDetectColumns: true,
            columnKeys: ['name', 'age'],
          },
          arrayOfObjects
        )
      ).to.deep.equal(expected)
    })
  })

  describe('checkInputs', () => {
    it('require an array of arrays', () => {
      expect(
        _.bind(
          csv.__internals__.checkInputs,
          null,
          {},
          'items.csv',
          dataArray[0]
        )
      ).to.throw('An array of arrays is required')
    })

    it('require an array of objects', () => {
      expect(
        _.bind(
          csv.__internals__.checkInputs,
          null,
          { autoDetectColumns: true },
          'items.csv',
          dataArray
        )
      ).to.throw('An array of objects is required.')
    })

    it('require a file name', () => {
      expect(
        _.bind(csv.__internals__.checkInputs, null, {}, null, dataArray)
      ).to.throw('A file name is required')
      expect(
        _.bind(csv.__internals__.checkInputs, null, {}, undefined, dataArray)
      ).to.throw('A file name is required')
    })
  })

  describe('download', () => {
    it('not throw', () => {
      if (typeof window !== 'undefined') {
        expect(
          _.bind(csv.download, null, { fileName: 'test.csv', dataArray })
        ).to.not.throw()
      }
    })
  })

  describe('getLinkElement', () => {
    it('have proper filename and href or click handler (IE)', () => {
      if (typeof window !== 'undefined') {
        let element = csv.getLinkElement({ fileName: 'test.csv', dataArray })

        if (isNotRunningIE()) {
          expect(element.download, 'test.csv')
          expect(element.href).to.equal(
            'data:text/csv;charset=utf-8;base64,MSwyLDMNCjQsNSw2LDc='
          )
        } else {
          expect(typeof element.click).to.equal('function')
        }
      }
    })
  })

  describe('getData', () => {
    it('generate data with btoa', () => {
      if (isNotRunningIE()) {
        if (typeof global !== 'undefined') {
          global.btoa = _btoa
        }

        if (typeof btoa !== 'undefined') {
          expect(csv.__internals__.getData(settings, dataArray)).to.equal(
            'MXwyfDMNCjR8NXw2fDc='
          )
        }
      }
    })

    it('save data with msSaveBlob', () => {
      if (typeof window === 'undefined') {
        global.window = _window
      }

      if (typeof window !== 'undefined' && window.navigator.msSaveBlob) {
        expect(csv.__internals__.getData(settings, dataArray)).to.equal(
          '1|2|3\r\n4|5|6|7'
        )

        let columnKeys = csv.__internals__.extractKeysFromFirstRow(
          arrayOfObjects
        )
        let convertedData = csv.__internals__.convertData(
          arrayOfObjects,
          columnKeys
        )

        expect(
          csv.__internals__.getData(
            { autoDetectColumns: true, addQuotes: true },
            convertedData
          )
        ).to.equal(
          `"Name","Age","Favorite Activity"\r\n"Bob ""Bobby"" Jones","45","Fishing"\r\n"Joe","40","Cycling"\r\n"Tom","",""`
        )
      }
    })
  })

  describe('quote', () => {
    it('quote a cell', () => {
      expect(csv.__internals__.quote('Foo bar')).to.equal(`"Foo bar"`)
    })
    it('escape quotes when quoting', () => {
      expect(csv.__internals__.quote('Bob "Bobby" Jones')).to.equal(
        `"Bob ""Bobby"" Jones"`
      )
    })
  })

  describe('extractKeysFromFirstRow', () => {
    it('Extract keys from first object in data array', () => {
      expect(
        csv.__internals__.extractKeysFromFirstRow(arrayOfObjects)
      ).to.deep.equal(['name', 'age', 'favoriteActivity'])
    })
  })

  describe('transformCell', () => {
    it('leave alone', () => {
      expect(csv.__internals__.transformCell(false)('Bob')).to.equal('Bob')
    })
    it('quote data', () => {
      expect(
        csv.__internals__.transformCell(true)(`Bob "Bobby" Jones`)
      ).to.equal(`"Bob ""Bobby"" Jones"`)
    })
  })

  describe('convertData', () => {
    it('Convert array of objects to array of arrays and add columns', () => {
      expect(
        csv.__internals__.convertData(
          arrayOfObjects,
          ['name', 'age', 'favoriteActivity'],
          false
        )
      ).to.deep.equal([
        ['Name', 'Age', 'Favorite Activity'],
        ['Bob "Bobby" Jones', 45, 'Fishing'],
        ['Joe', 40, 'Cycling'],
        ['Tom', undefined, null],
      ])
    })
  })
})
