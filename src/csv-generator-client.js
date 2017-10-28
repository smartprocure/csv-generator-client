import _ from 'lodash/fp'

// This is exported for unit testing.
export const getData = (separator, dataArray) =>
  _.flow(
    _.map(row => row.join(separator)),
    data => data.join('\r\n'),
    data => {
      if ((typeof window !== 'undefined') && window.navigator.msSaveBlob) {
        return data
      } else if (typeof btoa === 'function') {
        data = btoa(data)
      } else {
        data = encodeURIComponent(data)
      }
      return data
    }
  )(dataArray)

// This is exported for unit testing.
export const initSettings = (
  { separator = ',', addQuotes = false } = {},
  fileName,
  dataArray
) => {
  if (addQuotes) {
    separator = `"${separator}"`
  }

  if (_.isNil(fileName)) {
    throw 'A file name is required'
  }  
  if (!_.isArray(dataArray) || (!_.every(a => _.isArray(a), dataArray))) {
    throw 'A two dimensional data array is required.'
  }

  return { separator, fileName, dataArray }
}

// This is exported for unit testing.
export const getDownloadLink = (separator, dataArray) => {
  let type = 'data:text/csv;charset=utf-8'
  if (typeof btoa === 'function') {
    type += ';base64'
  }
  return `${type},${getData(separator, dataArray)}`
}

// This is exported for unit testing.
export const ieDownload = (separator, fileName, dataArray) => {
  let blob = new Blob(
    [decodeURIComponent(encodeURI(getData(separator, dataArray)))],
    {
      type: 'text/csv;charset=utf-8;',
    }
  )
  window.navigator.msSaveBlob(blob, fileName)
}

export const getLinkElement = ({ settings, fileName, dataArray }) => {
  let { separator } = initSettings(settings, fileName, dataArray)
  let linkElement = document.createElement('a')
  if (window.navigator.msSaveBlob) {
    linkElement.href = '#'
    linkElement.onclick = () => {
      ieDownload(separator, fileName, dataArray)
    }
  } else {
    linkElement.href = getDownloadLink(separator, dataArray)
    linkElement.download = fileName
  }
  return linkElement
}

export const download = function({ settings, fileName, dataArray }) {
  let { separator } = initSettings(settings, fileName, dataArray)
  if (window.navigator.msSaveBlob) {
    ieDownload(separator, fileName, dataArray)
  } else {
    let linkElement = getLinkElement({ settings, fileName, dataArray })
    linkElement.style.display = 'none'
    document.body.appendChild(linkElement)
    linkElement.click()
    document.body.removeChild(linkElement)
  }
}
