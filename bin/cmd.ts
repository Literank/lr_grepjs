#!/usr/bin/env node

import yargs from 'yargs'

import { grep, grepCount, grepRecursive } from '../lib/grep.js'
import type { MatchResult } from '../lib/grep.js'

// Parse command-line options
const argv = await yargs(process.argv.slice(2))
  .locale('en')
  .usage('Usage: $0 [options] <pattern> [<file>]')
  .option('c', {
    alias: 'count',
    describe: 'Only a count of selected lines is written to standard output.',
    type: 'boolean',
    default: false
  })
  .option('h', {
    alias: 'help',
    describe: 'Print a brief help message.',
    type: 'boolean',
    default: false
  })
  .option('i', {
    alias: 'ignore-case',
    describe:
      'Perform case insensitive matching. By default, it is case sensitive.',
    type: 'boolean',
    default: false
  })
  .option('n', {
    alias: 'line-number',
    describe:
      'Each output line is preceded by its relative line number in the file, starting at line 1. The line number counter is reset for each file processed. This option is ignored if -c is specified.',
    type: 'boolean',
    default: false
  })
  .option('r', {
    alias: 'recursive',
    describe: 'Recursively search subdirectories listed.',
    type: 'boolean',
    default: false
  })
  .option('v', {
    alias: 'invert-match',
    describe:
      'Selected lines are those not matching any of the specified patterns.',
    type: 'boolean',
    default: false
  })
  .demandCommand(1, 'Please provide pattern to search for.').argv

const pattern = argv._[0] as string
const filePath = argv._[1] !== undefined ? argv._[1] as string : ''

if (argv.help as boolean) {
  // Print help message and exit
  console.log(argv.help)
  process.exit(0)
}

const options = {
  ignoreCase: argv['ignore-case'] as boolean,
  invertMatch: argv['invert-match'] as boolean
}
const result = (argv.recursive as boolean && filePath !== '')
  ? grepRecursive(pattern, filePath, options)
  : grep(pattern, filePath, options)

result
  .then((result) => {
    if (argv.count as boolean) {
      console.log(grepCount(result))
    } else {
      printResult(result, argv['line-number'] as boolean)
    }
  })
  .catch((error) => {
    console.error('Error:', error.message)
  })

function printResult (result: MatchResult, showLineNumber: boolean): void {
  let currentFile = null
  const fileCount = Object.keys(result).length

  for (const [filePath, lines] of Object.entries(result)) {
    for (const [lineNumber, line] of lines) {
      if (fileCount > 1 && filePath !== currentFile) {
        currentFile = filePath
        console.log(`\n${filePath}:`)
      }
      if (showLineNumber) {
        console.log(`${lineNumber}: ${line}`)
      } else {
        console.log(line)
      }
    }
  }
}
