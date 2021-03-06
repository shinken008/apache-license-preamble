const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const preamble = require('./preamble')
const args = require('./args')

// In the `.headerignore`, each line is a pattern in RegExp.

const excludesPath = path.join(__dirname, '../.headerignore')
const excludesCustomPath = path.join(process.cwd(), args.ignore || '.headerignore')

function run () {
  const updatedFiles = []
  const passFiles = []
  const pendingFiles = []
  const emptyFiles = []

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
      updatedFiles.push(absolutePath)
    } else {
      emptyFiles.push(absolutePath)
    }
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
    if (args.nosilent) {
      console.log('\n--------------------')
      console.log(chalk.red('No license header file exists: '))
      console.log('--------------------')
      updatedFiles.forEach(function (path) {
        console.log(chalk.red(path))
      })
      console.log('\n')
      process.exit(1)
    } else {
      updatedFiles.forEach(function (path) {
        console.log(chalk.green(path))
      })
    }
  } else {
    console.log('Nothing.')
  }

  console.log('\n')
  console.log('----------------')
  console.log(' Empty files: ')
  console.log('----------------')

  if (emptyFiles.length) {
    emptyFiles.forEach(function (path) {
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
