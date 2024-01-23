# lr_grepjs

Example project: grep-like CLI app implemented in Node.js.

## Install

```bash
make install
```

## Usage

```txt
Usage: grepjs [options] <pattern> [<file>]

Options:
      --version       Show version number                              [boolean]
  -c, --count         Only a count of selected lines is written to standard outp
                      ut.                             [boolean] [default: false]
  -h, --help          Show help                       [boolean] [default: false]
  -i, --ignore-case   Perform case insensitive matching. By default, it is case
                      sensitive.                      [boolean] [default: false]
  -n, --line-number   Each output line is preceded by its relative line number i
                      n the file, starting at line 1. The line number counter is
                       reset for each file processed. This option is ignored if
                      -c is specified.                [boolean] [default: false]
  -r, --recursive     Recursively search subdirectories listed.
                                                      [boolean] [default: false]
  -v, --invert-match  Selected lines are those not matching any of the specified
                       patterns.                      [boolean] [default: false]
```

### Search

```bash
grepjs pattern *txt

cat *txt | grepjs pattern
```

### Recursive Search

```bash
grepjs -r pattern .
```

### Search Multiple Files

```bash
grepjs pattern a.txt b.py c.cpp
```

### Show Line Numbers

```bash
grepjs -n pattern *txt
```

See [project tutorial](https://literank.com/project/11/intro) here.
