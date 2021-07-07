const minimist = require('minimist')

const args = minimist(process.argv.slice(2), {
  alias: {
    help: ['h'],
  },
  boolean: ['verbose']
})

module.exports = args
