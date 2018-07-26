'use strict'

const spinner = require('./').create(/* see api docs for options */).start()
process.on('SIGINT', () => spinner.stop()) // keep going until ctrl+c
