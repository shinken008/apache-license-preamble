const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const preamble = require('./preamble')
const args = require('./args')

// In the `.headerignore`, each line is a pattern in RegExp.
// all relative path (based on the echarts base directory) is tested.
// The pattern should match the relative path completely.

const excludesPath = path.join(__dirname, '../.headerignore')
const excludesCustomPath = path.join(process.cwd(), args.ignore || '.headerignore')

// const lists = [
//     '../src/**/*.js',
//     '../build/*.js',
//     '../benchmark/src/*.js',
//     '../benchmark/src/gulpfile.js',
//     '../extension-src/**/*.js',
//     '../extension/**/*.js',
//     '../map/js/**/*.js',
//     '../test/build/**/*.js',
//     '../test/node/**/*.js',
//     '../test/ut/core/*.js',
//     '../test/ut/spe/*.js',
//     '../test/ut/ut.js',
//     '../test/*.js',
//     '../theme/*.js',
//     '../theme/tool/**/*.js',
//     '../echarts.all.js',
//     '../echarts.blank.js',
//     '../echarts.common.js',
//     '../echarts.simple.js',
//     '../index.js',
//     '../index.common.js',
//     '../index.simple.js'
// ];

function run () {
  const updatedFiles = []
  const passFiles = []
  const pendingFiles = []

  eachFile(function (absolutePath, fileExt) {
    const fileStr = fs.readFileSync(absolutePath, 'utf-8')

    const existLicense = preamble.extractLicense(fileStr, fileExt)

    if (existLicense) {
      passFiles.push(absolutePath)
      return
    }

    // Conside binary files, only add for files with known ext.
    if (!preamble.hasPreamble(fileExt)) {
      pendingFiles.push(absolutePath)
      return
    }
    const result = preamble.addPreamble(fileStr, fileExt)
    if (result) {
      fs.writeFileSync(absolutePath, result, 'utf-8')
    }
    updatedFiles.push(absolutePath)
  })

  console.log('\n')
  console.log('----------------------------')
  console.log(' Files that exists license: ')
  console.log('----------------------------')
  if (passFiles.length) {
    if (args.verbose) {
      passFiles.forEach(function (path) {
        console.log(chalk.green(path))
      })
    } else {
      console.log(chalk.green(passFiles.length + ' files. (use argument "--verbose" see details)'))
    }
  } else {
    console.log('Nothing.')
  }

  console.log('\n')
  console.log('--------------------')
  console.log(' License added for: ')
  console.log('--------------------')
  if (updatedFiles.length) {
    updatedFiles.forEach(function (path) {
      console.log(chalk.green(path))
    })
  } else {
    console.log('Nothing.')
  }

  console.log('\n')
  console.log('----------------')
  console.log(' Pending files: ')
  console.log('----------------')
  if (pendingFiles.length) {
    pendingFiles.forEach(function (path) {
      console.log(chalk.red(path))
    })
  } else {
    console.log('Nothing.')
  }

  console.log('\nDone.')
}

function eachFile (visit) {
  const excludePatterns = []
  const extReg = /\.([a-zA-Z0-9_-]+)$/

  prepareExcludePatterns()

  const entryPath = args.path || process.cwd()
  travel(entryPath)

  function travel (absolutePath) {
    if (isExclude(absolutePath)) {
      return
    }

    const stat = fs.statSync(absolutePath)

    if (stat.isFile()) {
      visit(absolutePath, getExt(absolutePath))
    } else if (stat.isDirectory()) {
      fs.readdirSync(absolutePath).forEach(function (file) {
        travel(path.join(absolutePath, file))
      })
    }
  }

  function prepareExcludePatterns () {
    const content = fs.readFileSync(excludesPath, { encoding: 'utf-8' })
    content.replace(/\r/g, '\n').split('\n').forEach(function (line) {
      line = line.trim().toLocaleLowerCase()
      if (line && line.charAt(0) !== '#') {
        excludePatterns.push(new RegExp(line))
      }
    })

    let customContent = ''
    if (fs.existsSync(excludesCustomPath)) {
      customContent = fs.readFileSync(excludesCustomPath, { encoding: 'utf-8' })
    }
    customContent.replace(/\r/g, '\n').split('\n').forEach(function (line) {
      line = line.trim().toLocaleLowerCase()
      if (line && line.charAt(0) !== '#') {
        excludePatterns.push(new RegExp(line))
      }
    })
  }

  function isExclude (relativePath) {
    for (let i = 0; i < excludePatterns.length; i++) {
      if (excludePatterns[i].test(relativePath)) {
        return true
      }
    }
  }

  function getExt (path) {
    if (path) {
      const mathResult = path.match(extReg)
      return mathResult && mathResult[1]
    }
  }
}

run()
