import _ from 'lodash/fp'

export const getClientInstance = function ({ separator = ',', addQuotes = false } = {}) {
  if (addQuotes) {
    separator = `"${separator}"`
  }

  let getData = _.flow(
    _.map(row => row.join(separator)),
    data => data.join('\r\n'),
    data => {
      if (window.navigator.msSaveOrOpenBlob) {
        return data
      } else if (typeof btoa === 'function') {
        data = btoa(data)
      } else {
        data = encodeURIComponent(data)
      }
      return data
    }
  )

  let getDownloadLink = (dataArray) => {
    let type = 'data:text/csv;charset=utf-8'
    if (typeof btoa === 'function') {
      type += ';base64'
    }
    return type + ',' + getData(dataArray)
  }

  let getLinkElement = (fileName, dataArray) => {
    let linkElement = document.createElement('a')
    linkElement.href = getDownloadLink(dataArray)
    linkElement.download = fileName
    return linkElement
  }

  this.download = (fileName, dataArray) => {
    if (_.isNull(fileName)) {
      throw 'A file name is required'
    }

    if (!_.isArray(dataArray)) {
      throw 'An data array is required.'
    }
    
    if (window.navigator.msSaveBlob) {
      let blob = new Blob([decodeURIComponent(encodeURI(getData(dataArray)))], {
        type: 'text/csv;charset=utf-8;',
      })
      window.navigator.msSaveBlob(blob, fileName)
    } else {
      let linkElement = getLinkElement(fileName, dataArray)
      linkElement.style.display = 'none'
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)
    }
  }
}
