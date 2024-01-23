import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { grep, grepRecursive, grepCount, MatchResult } from '../lib/grep';

const mkdtemp = promisify(fs.mkdtemp);
const writeFile = promisify(fs.writeFile);

let tmpDir: string;

beforeAll(async () => {
  // Set up resources before all tests
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'grep-test-'));
});

afterAll(() => {
  // Teardown resources after all tests
  // For example, you can delete the temporary directory
  fs.rmSync(tmpDir, { recursive: true });
});

beforeEach(() => {
  // Set up resources before each test
  // This can be useful for scenarios where each test needs a clean state
});

afterEach(() => {
  // Teardown resources after each test
});

describe('grep', () => {
  it('should match lines in a file', async () => {
    const filePath = path.join(tmpDir, 'single-file.txt');
    await writeFile(filePath, 'This is an example line\nThis line should not match');

    const pattern = 'example';
    const options = { ignoreCase: false, invertMatch: false };

    const result = await grep(pattern, filePath, options);

    expect(result[filePath]).toEqual([[1, 'This is an example line']]);
  });

  it('should handle invertMatch correctly', async () => {
    const filePath = path.join(tmpDir, 'single-file.txt');
    await writeFile(filePath, 'This is an example line\nThis line should not match');

    const pattern = 'example';
    const options = { ignoreCase: false, invertMatch: true };

    const result = await grep(pattern, filePath, options);

    expect(result[filePath]).toEqual([[2, 'This line should not match']]);
  });
});

describe('grepRecursive', () => {
  it('should match lines in files recursively', async () => {
    const dirPath = path.join(tmpDir, 'nested-directory');
    const filePath1 = path.join(dirPath, 'file1.txt');
    const filePath2 = path.join(dirPath, 'subdir', 'file2.txt');

    await fs.promises.mkdir(path.join(dirPath, 'subdir'), { recursive: true });
    await writeFile(filePath1, 'This is an example line');
    await writeFile(filePath2, 'Another example line');

    const pattern = 'example';
    const options = { ignoreCase: false, invertMatch: false };

    const result = await grepRecursive(pattern, dirPath, options);

    expect(result).toEqual({
      [filePath1]: [[1, 'This is an example line']],
      [filePath2]: [[1, 'Another example line']],
    });
  });

  it('should handle invertMatch correctly in recursive search', async () => {
    const dirPath = path.join(tmpDir, 'nested-directory');
    const filePath1 = path.join(dirPath, 'file1.txt');
    const filePath2 = path.join(dirPath, 'subdir', 'file2.txt');

    await fs.promises.mkdir(path.join(dirPath, 'subdir'), { recursive: true });
    await writeFile(filePath1, 'This is an example line');
    await writeFile(filePath2, 'This line should not match');

    const pattern = 'example';
    const options = { ignoreCase: false, invertMatch: true };

    const result = await grepRecursive(pattern, dirPath, options);

    expect(result).toEqual({
      [filePath1]: [],
      [filePath2]: [[1, 'This line should not match']],
    });
  });
});

describe('grepCount', () => {
  it('should count the total number of matches in the result', () => {
    const result: MatchResult = {
      'file1.txt': [[1, 'Match line 1'], [3, 'Match line 3']],
      'file2.txt': [[2, 'Match line 2']],
    };

    const count = grepCount(result);

    expect(count).toBe(3);
  });
});
