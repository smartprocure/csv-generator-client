[![npm version](https://badge.fury.io/js/csv-generator-client.svg)](https://badge.fury.io/js/csv-generator-client)
[![CircleCI](https://circleci.com/gh/smartprocure/csv-generator-client.svg?style=svg)](https://circleci.com/gh/smartprocure/csv-generator-client)
[![Coverage Status](https://coveralls.io/repos/github/smartprocure/csv-generator-client/badge.svg?branch=master)](https://coveralls.io/github/smartprocure/csv-generator-client?branch=master)
![dependencies](https://david-dm.org/smartprocure/csv-generator-client.svg)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/4de5e2d3d41d401d887d7db49d3a7e88)](https://www.codacy.com/app/geosp/csv-generator-client_2?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=smartprocure/csv-generator-client&amp;utm_campaign=Badge_Grade)
[![Maintainability](https://api.codeclimate.com/v1/badges/5f3b4045e0b8f003d424/maintainability)](https://codeclimate.com/github/smartprocure/csv-generator-client/maintainability)
[![Greenkeeper badge](https://badges.greenkeeper.io/smartprocure/csv-generator-client.svg)](https://greenkeeper.io/)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/csv-generator-client.svg)](https://saucelabs.com/u/csv-generator-client)

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
