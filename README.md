# csv-generator-client
Library to generate downloadable csv files from client side data. 

# Installing
`npm install csv-generator-client`

This package requires `lodash/fp`, so make sure that's available in your app.

# Usage
```
import * as generator from 'csv-generator-client'
let settings = {separator: '|', addQuotes: true}
generator.download({settings, fileName, dataArray})

Or

var generator = require('csv-generator-client')
// In this case the default settings are used.
generator.download({fileName: fileName, dataArray: dataArray})

```
# API

### getLinkElement
`getLinkElement({settings: settings, fileName: fileName, dataArray: dataArray})` Where settings is an object and default settings are  `{ separator: ',', addQuotes: false }`, `fileName` is required and `dataArray` is required to be of type `Array`.

### download
`download({settings: settings, fileName: fileName, dataArray: dataArray})` Where settings is an object and default settings are  `{ separator: ',', addQuotes: false }`, `fileName` is required and `dataArray` is required to be of type `Array`.


# Credits
This implementation is based on [csv-repository-client](https://github.com/AlexLibs/client-side-csv-generator) by [AlexLibs](https://github.com/AlexLibs)
