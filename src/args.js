const minimist = require('minimist')
const chalk = require('chalk')

const args = minimist(process.argv.slice(2), {
  alias: {
    help: ['h'],
  },
  boolean: ['verbose']
})

if (!args.org) {
  console.log(chalk.red(`args should config --org [Organization]`))
  process.exit(1)
}

module.exports = args
