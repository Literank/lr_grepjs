import fs from 'fs'
import path from 'path'
import * as readline from 'readline'

interface Options {
  ignoreCase: boolean
  invertMatch: boolean
}

type MatchItem = [number, string]

export type MatchResult = Record<string, MatchItem[]>

export async function grep (pattern: string, filePath: string, options: Options): Promise<MatchResult> {
  const { ignoreCase, invertMatch } = options
  const lines = filePath === '' ? await _readStdinLines() : await _readFileLines(filePath)
  const regexFlags = ignoreCase ? 'gi' : 'g'
  const regex = new RegExp(pattern, regexFlags)
  let matchingLines: MatchItem[]
  if (invertMatch) {
    matchingLines = _filterLines(regex, lines, false)
  } else {
    matchingLines = _filterLines(regex, lines, true)
  }
  return { [filePath]: matchingLines }
}

export async function grepMulti (pattern: string, filePaths: string[], options: Options): Promise<MatchResult> {
  if (filePaths.length === 0) {
    return await grep(pattern, '', options)
  }
  const results: MatchResult = {}
  for (const filePath of filePaths) {
    const result = await grep(pattern, filePath, options)
    for (const k in result) {
      results[k] = result[k]
    }
  }
  return results
}

export async function grepRecursiveMulti (pattern: string, dirPaths: string[], options: Options): Promise<MatchResult> {
  const results: MatchResult = {}
  for (const dirPath of dirPaths) {
    const result = await grepRecursive(pattern, dirPath, options)
    for (const k in result) {
      results[k] = result[k]
    }
  }
  return results
}

export async function grepRecursive (pattern: string, dirPath: string, options: Options): Promise<MatchResult> {
  let results = {}
  try {
    const files = await fs.promises.readdir(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const isSubDir = (await fs.promises.stat(filePath)).isDirectory()
      const result = !isSubDir
        ? await grep(pattern, filePath, options)
        : await grepRecursive(pattern, filePath, options)
      results = { ...results, ...result }
    }
  } catch (err) {
    console.error(err)
  }
  return results
}

export function grepCount (result: MatchResult): number {
  return Object.values(result).reduce(
    (count, lines) => count + lines.length,
    0
  )
}

function _filterLines (regexPattern: RegExp, lines: string[], flag: boolean): MatchItem[] {
  const candidates: MatchItem[] = lines.map((line, index) => [index + 1, line.trim()])
  return candidates
    .filter(([_, line]) => regexPattern.test(line) === flag)
}

async function _readFileLines (filePath: string): Promise<string[]> {
  try {
    const isDir = (await fs.promises.stat(filePath)).isDirectory()
    if (isDir) { // ignore dir
      return []
    }
    // Read the file asynchronously
    const data = await fs.promises.readFile(filePath, 'utf8')
    return data.split('\n')
  } catch (error: any) {
    console.error('Error reading the file:', error.message)
  }
  return []
}

async function _readStdinLines (): Promise<string[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  })

  return await new Promise((resolve) => {
    const lines: string[] = []
    rl.on('line', (line) => {
      lines.push(line)
    })

    rl.on('close', () => {
      resolve(lines)
    })
  })
}
