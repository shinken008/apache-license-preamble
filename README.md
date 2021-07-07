## alp
Insert the Apache license preamble into the file. Inspired by [echarts](https://github.com/apache/echarts).

## install
With [npm](https://npmjs.org/) do:
```sh
npm install minimist
```

## usage
cli
```sh
alp --org [apache] --verbose --path [file|directory]
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
Read `process.cwd()` ignore file, default file is `.headerignore`.
