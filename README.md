New Project - Based on Cleverbuild (https://github.com/clevertech/cleverbuild)
===========

[![Coverage Status](https://coveralls.io/repos/clevertech/Waivecar/badge.svg?branch=development)](https://coveralls.io/r/clevertech/Waivecar?branch=development)

This project is deployed by TravisCI when pushing on development, staging or master branches.


### Pre-commit hook
This project  provides a Git **pre-commit hook**, which allow you to run fast tests and code analysis at each commit.
To enable the hook on your system go to the repository root directory and exec:

```bash
$ ln -s ../../deployment/build/hooks/pre-commit .git/hooks/pre-commit
```

To skip the pre-commit hook: `git commit --no-verify` (use at your own risk).

