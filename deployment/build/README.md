TravisCI build and deploy
===========

Commit build and testing are performed on [TravisCI](http://docs.travis-ci.com/). Main entry point for this is the file `.travis.yml`, 
which describes the build process. 

TL;DR: Choose your branching model, then go to the Quick Start section.

## Branching models
You can adopt the branching model event if you don't require all the listed branched. For example, for the "Web project" type, you can use either:
* master (PROD environment)
* master+development (PROD+DEV environments)
* master+staging+development (PROD+STAG+DEV environments)

However you make it, though, `staging` should be branched from `master`, and `development` from either `master`, or `staging` (if it exists, or when it's created).

The branching model is set in `.travis.yml` (https://github.com/clevertech/cleverbuild) by setting the `BRANCHING_MODEL` variable.

Please set the following variables common to all models in `.travis.yml`. In standard configuration, you have to set only the `PACKAGE_NAME` variable.
* `PACKAGE_NAME`, usually the same as the repo name.
* `REMOTE_USER`, the user which as ssh access to target server for deploy. On dedicated server use `travis`, on shared servers, use the same as `PACKAGE_NAME`.
* `INIT_SCRIPT`, the init script on the target server. Default: `/etc/init.d/node-${PACKAGE_NAME}`.
* `REMOTE_DIR`, the dir on the target server which contains the application. Default: `/opt/${PACKAGE_NAME}`.
* `REMOTE_HOST_DEV`, the dev server hostname. Default: `${PACKAGE_NAME}-dev.clevertech.biz`.
* `REMOTE_HOST_STAG`, the dev server hostname. Default: `${PACKAGE_NAME}-stag.clevertech.biz`.
* `REMOTE_HOST_PRD`, the dev server hostname. Default: `${PACKAGE_NAME}-prod.clevertech.biz`.

### Dummy - no deploy 
* `BRANCHING_MODEL=NO_DEPLOY`

### Web projects / Mobile projects
* Set `BRANCHING_MODEL=WEB`
* Build and deploy the following branches:
  * `development` -> DEV 
  * `staging` -> STAG
  * `master` -> PROD
* Build the following branches (not yet implemented)
  * `ios/development` -> Dev iOS App
  * `ios/master` -> Prod iOS App
  * `android/development` -> Dev Android App
  * `android/master` -> Prod Android App

### Web projects with distinct API/APP (like Famo.us)
* Composed of a static APP component + a dynamic API component
* Set `BRANCHING_MODEL=API_APP`
* Build and deploy the following branches:
  * `api/development` -> DEV/api
  * `api/staging` -> STAG/api
  * `api/master` -> PROD/api
  * `development` -> DEV
  * `staging` -> STAG
  * `master` -> PROD


## Quick Start
- Install the Travis CLI
- Edit `.travis.yml`:
  - Set PACKAGE_NAME to your repository name
  - Set BRANCHING_MODEL to the chosen branching model
- Enable the repository on Travis:
  - Go to [Travis](https://magnum.travis-ci.com/)
  - Log in with your GitHub account
  - Click on the plus sign (+) on the left bar
  - Click on "Clevertech" on the left bar
  - (If necessary) click on "Sync now"
  - Find your repository on the list and put the swtich on "On"

### Build
- Set up your build requisites. The default configuration provides `redis` and `mongodb`. If you need more, edit `services` section in `.travis.yml` according to the [documentation](http://docs.travis-ci.com/user/database-setup/).

### Test 
- Edit `build/commit_test`:
  - Drop the line `echo Doing nothing!`
  - Substite it with your test command, e.g.: `npm test`

### Code Analysis
**TODO**

### Deployment with TravisCI (could be automated more...)
* If your server name are not in the standard form (e.g., `${PACKAGE_NAME}-dev.clevertech.biz`), modify `.travis.yml` ccordingly.
* Get `id_rsa` and `id_rsa pub` for travis user (they should have been put S3 bucket `clever-deploy-keys/travis/$PROJECT_NAME$` by project creation script) and put them in `deployment/build/ssh`.
* Obtain travis ruby gem here: https://github.com/travis-ci/travis.rb , add a repository to travis by logging in to https://magnum.travis-ci.com, clicking small "+" icon above the list of repositories and enabling repo of your choice, then  run `travis encrypt-file deployment/build/ssh/id_rsa deployment/build/ssh/id_rsa.enc --add`
* Add `- chmod 400 deployment/build/ssh/id_rsa` after `openssl aes...` on `before_install` section of `.travis.yml`
* `rm deployment/build/ssh/id_rsa` (Do not put the private key in the repo!)
* `git add deployment/build/ssh/id_rsa.enc`
* `git add deployment/build/ssh/id_rsa.pub`

### Manual Deployment
In case if TravisCI is down or slow and you need your code on server ASAP you can use manual deploy script:
* Make sure your VPN connection is UP
* cd your_project_dir
* make sure you are on right branch (development, staging or master)
* run: `deployment/build/scripts/deploy_manual /path/to/server/ssh_privatekey`

### Slack Notifications
(To do this you need Admin access to Slack and the Travis CLI utils. Ask DevOps to do that for you)
* Go to your Slack channel
* Click on the channel name on the top and select "Add a service integration"
* Select "Travis CI"
* Confirm the channel name
* Click "Add Travis CI integration"
* Follow the instructions and encrypt credentials

### That's it!
- Configure the Ansible script and run them (they need the  `id_rsa pub` file retrieved in previous steps)
- Commit all to the repository (can be a branch or a pull request)
- Wait a couple of minutes to allow for Travis first initialization
- Follow the build process on [Travis](https://magnum.travis-ci.com/)


## Pre-commit hook
Cleverbuild provides a Git **pre-commit hook**, which allow you to run fast tests and code analysis at each commit.
To enable the hook on your system go to the repository root directory and exec:

```bash
$ ln -s ../../deployment/build/hooks/pre-commit .git/hooks/pre-commit
```

To skip the pre-commit hook: `git commit --no-verify` (use at your own risk).

## Build Process Explained
A complete build and deploy run is composed by the following steps:

- `commit_dependencies`
- `commit_build` 
- `commit_analysis`
- `commit_test`
- `deploy`
- `deploy_remote`

Entry points for build and deploy phases are scripts (not necessarily Bash scripts, you can make a node.js, python, whatever script executable).  Scripts should return an **exit value** which is interpreted as success (0) or failure (!=0). Script standard output and standard error are piped to the build report. 


---

`commit_dependencies`
Install dependencies. Accepts a `--fast` parameter for rapid execution.
Builds that are deployed on server are always run without `--fast` to ensure repeatability.

**Default**: 
- With `--fast`, runs npm install
- Without `--fast`, removes the `node_modules` directory and runs npm install

---

`commit_build` 
For minifcation, code generation, etc.

**Default**:
- Does nothing

---

`commit_analysis`
For code analysis.

**Default**:
- Does nothing

---

`commit_test`
Runs tests.

Accepts a `--fast` parameter for rapid execution. Fast tests should run under 30 seconds. Non-fast tests can take whatever it takes. 
Notes:
- If the test creates a server, it must create a transient instance of the server on a random TCP port.
- If the test uses a database, it must create a test database (dropping an existing one) and put on it fixture data, that is, a set of objects that should be in the database.
- Tests should be safe to be executed also on production servers.

**Default**:
- Does nothing

---

`deploy`
(To be completed)
The script produces a compressed archive that contains the complete project, dependencies included.

---

`deploy_remote`
(To be completed)
Remove the existing version, decompress the new version and restart the application.



## Deployment on sharednode
* Fill out `REMOTE_USER`, `REMOTE_HOST`, `REMOTE_DIR` and `INIT_SCRIPT` in `.travis.yml`.
* `ssh-keygen -t rsa -C "$PUT_REMOTE_USER_HERE$@sharednode" -f deployment/build/ssh/id_rsa`.
* Obtain travis ruby gem here: https://github.com/travis-ci/travis.rb , add a repository to travis by logging in to https://magnum.travis-ci.com, clicking small "+" icon above the list of repositories and enabling repo of your choice, then  run `travis encrypt-file deployment/build/ssh/id_rsa deployment/build/ssh/id_rsa.enc --add`
* Make sure path to ssh keys in "openssl aes..." line is correct, i.e. : deployment/build/ssh/id_rsa.enc and deployment/build/ssh/id_rsa
* Add `- chmod 400 deployment/build/ssh/id_rsa` after `openssl aes...` on `before_install` section of `.travis.yml`
* `git add deployment/build/ssh/id_rsa.enc`
* Copy `id_rsa` and `id_rsa.pub` into S3 bucket `clever-deploy-keys/travis/sharednode/$YOUR_PROJECT_NAME$`
* Delete `id_rsa`. Do not put id_rsa in the repo!
* Add `id_rsa.pub` to the repo

* On sharednode:
  * `adduser $PUT_REMOTE_USER_HERE$`
  * `cd /home/$PUT_REMOTE_USER_HERE$`
  * `mkdir .ssh`
  * Copy the contents of `id_rsa.pub` in file `.ssh/authorized_keys`
  * Fix init script so that the REMOTE_USER can run it
  * Change remote dir ownership to `REMOTE_USER:REMOTE_USER`
  * Change `/var/run/$APP_NAME$.pid` and `/var/log/node/$APP_NAME$.log` ownership to `REMOTE_USER:REMOTE_USER`
  * Put in `etc/sudoers` something like:
  ```
  Cmnd_Alias FOREVER = /usr/bin/forever
  Defaults!FOREVER always_set_home
  $REMOTE_USER$ ALL=($REMOTE_USER$:$REMOTE_USER$) ALL
  ```
