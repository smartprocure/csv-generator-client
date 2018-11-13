import _ from 'lodash/fp'

// Escape quotes and quote cell
let quote = _.flow(
  _.replace(/"/g, '""'),
  x => `"${x}"`
)

// Quote if needed
let transformCell = addQuotes => (addQuotes ? quote : _.identity)

// Takes settings object and an array of arrays
let getData = ({ separator, addQuotes }, dataArray) => {
  let transformRow = _.flow(
    _.map(transformCell(addQuotes)),
    _.join(separator)
  )

  return _.flow(
    _.map(transformRow),
    data => data.join('\r\n'),
    data =>
      typeof window !== 'undefined' && window.navigator.msSaveBlob
        ? data
        : btoa(unescape(encodeURIComponent(data)))
  )(dataArray)
}

// Convert array of objects to array of arrays and add columns
let convertData = (data, columnKeys) => {
  // Column names
  let columns = _.map(_.startCase, columnKeys)
  // Extract data from object
  let transformRow = row => _.map(key => _.get(key, row), columnKeys)
  let rows = _.map(transformRow, data)
  // Concatenate columns and rows
  return _.concat([columns], rows)
}

// Extract keys from first row
let extractKeysFromFirstRow = _.flow(
  _.first,
  _.keys
)

let checkInputs = ({ autoDetectColumns }, fileName, dataArray) => {
  // Check filename
  if (_.isNil(fileName)) {
    throw 'A file name is required'
  }

  // Check shape of data
  if (autoDetectColumns) {
    if (!_.isArray(dataArray) || !_.every(_.isPlainObject, dataArray))
      throw 'An array of objects is required.'
  } else if (!_.isArray(dataArray) || !_.every(_.isArray, dataArray)) {
    throw 'An array of arrays is required.'
  }
}

let initSettings = _.defaults({
  separator: ',',
  addQuotes: false,
  autoDetectColumns: false,
})

let initData = (settings, dataArray) => {
  let { autoDetectColumns, columnKeys } = settings

  if (autoDetectColumns) {
    // Extract column keys from first row if not passed explicitly
    if (!_.isArray(columnKeys)) columnKeys = extractKeysFromFirstRow(dataArray)

    // Convert array of objects to array of arrays and add columns
    dataArray = convertData(dataArray, columnKeys)
  }

  return dataArray
}

let getDownloadLink = (settings, dataArray) => {
  let _dataArray = initData(settings, dataArray)
  let type = 'data:text/csv;charset=utf-8'
  if (typeof btoa === 'function') {
    type += ';base64'
  }
  return `${type},${getData(settings, _dataArray)}`
}

let ieDownload = (settings, fileName, dataArray) => {
  let _dataArray = initData(settings, dataArray)
  let blob = new Blob(
    [decodeURIComponent(encodeURI(getData(settings, _dataArray)))],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )
  window.navigator.msSaveBlob(blob, fileName)
}

let getLinkElementInternal = (settings, fileName, dataArray) => {
  let linkElement = document.createElement('a')
  linkElement.target = '_blank'

  // IE
  if (window.navigator.msSaveBlob) {
    linkElement.href = '#'
    linkElement.onclick = () => {
      ieDownload(settings, fileName, dataArray)
    }
  } else {
    linkElement.href = getDownloadLink(settings, dataArray)
    linkElement.download = fileName
  }
  return linkElement
}

export const getLinkElement = ({ settings, fileName, dataArray }) => {
  // Initialize settings
  let _settings = initSettings(settings)
  // Check inputs
  checkInputs(_settings, fileName, dataArray)

  return getLinkElementInternal(_settings, fileName, dataArray)
}

export const download = ({ settings, fileName, dataArray }) => {
  // Initialize settings
  let _settings = initSettings(settings)
  // Check inputs
  checkInputs(_settings, fileName, dataArray)

  // IE
  if (window.navigator.msSaveBlob) {
    ieDownload(_settings, fileName, dataArray)
  } else {
    let linkElement = getLinkElementInternal(_settings, fileName, dataArray)
    linkElement.style.display = 'none'
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
  }
}

// Exporting internals for unit testing.
export const __internals__ = {
  checkInputs,
  convertData,
  extractKeysFromFirstRow,
  getData,
  getDownloadLink,
  ieDownload,
  initData,
  initSettings,
  quote,
  transformCell,
}
