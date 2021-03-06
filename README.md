## apachelp
Prepend the Apache license preamble into the file. Inspired by [echarts](https://github.com/apache/echarts).

## install
With [npm](https://npmjs.org/) do:
```sh
npm install apachelp -D
``` 
or yarn:
```sh
yarn add apachelp -D
```

## usage
cli
```sh
apachelp --org [apache] --verbose --path [file|directory] --nosilent
```

## args
- org

Assign organization.
For Example: `Licensed to the [org] under one...`

- verbose

The pass file output terminal.

- path

Assign file or directory files for insert the Apache license preamble.

- ignore

Read `process.cwd()` assign ignore file, default file is `.headerignore`.

- nosilent

Throw an error when exists no preamble license file.