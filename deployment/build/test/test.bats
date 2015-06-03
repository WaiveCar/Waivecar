DIR=${BATS_TEST_DIRNAME}

# Mockups
setup() {
    $DIR/mockup/clean_mockups
    PATH="$DIR/mockup:$PATH"
    PACKAGE_NAME=test
}

teardown() {
    $DIR/mockup/clean_mockups
}

# Tests
@test "commit_package: wrong args (1)" {
   run $DIR/../scripts/commit_package
   [ "$status" -ne 0 ]
}

@test "commit_package: wrong args (2)" {
   run $DIR/../scripts/commit_package --commit XXX
   [ "$status" -ne 0 ]
}

@test "commit_package: wrong args (3)" {
   run $DIR/../scripts/commit_package --name YYY
   [ "$status" -ne 0 ]
}

@test "deploy: cleverbuild package: should not be deployed" {
    export PACKAGE_NAME=cleverbuild    
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
}

@test "deploy: WEB / Secondary branch should not be deployed" {
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=XXX
    export TRAVIS_PULL_REQUEST=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
}

@test "deploy: WEB / Pull request should not be deployed" {
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=master
    export TRAVIS_PULL_REQUEST=true
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
}

@test "deploy: WEB / Master should be deployed" {
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=master
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_PROD=remote_host_prod
    export REMOTE_DIR_WEB=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod STRICT_VERSION_CHECK=false BRANCHING_MODEL=WEB TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod rm /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_prod:/tmp" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_prod:/tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: WEB / Staging should be deployed" {
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=staging
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_STAG=remote_host_prod
    export REMOTE_DIR_WEB=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod STRICT_VERSION_CHECK=false BRANCHING_MODEL=WEB TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod rm /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_prod:/tmp" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_prod:/tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: WEB / Development should be deployed" {
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR_WEB=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod STRICT_VERSION_CHECK=false BRANCHING_MODEL=WEB TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod rm /tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_prod:/tmp" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_prod:/tmp/package_name_travis_commit.deploy_remote" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy_remote: WEB / STRICT_VERSION_CHECK is set and node version differ: no deploy" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export STRICT_VERSION_CHECK=true
    export TRAVIS_NODE_VERSION=0.11.35
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 1 ]
    [ ! -e /tmp/mockup_npm ]
    [ ! -e /tmp/mockup_find ]
    [ ! -e /tmp/mockup_tar ]
    [ ! -e /tmp/mockup_init_script ]
}

@test "deploy_remote: WEB / Target node version is unstable and patch number is different from Travis one: npm rebuild should happen" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.11.45
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    cp /tmp/mockup_find /tmp/PPP
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: WEB / Target node version is unstable and node versions are equal: npm rebuild should not happen" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.11.34
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_npm ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    cp /tmp/mockup_find /tmp/PPP
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}


@test "deploy_remote: WEB / Target node version major is not equal to Travis node version major: npm rebuild should happen" {
    echo -n "v1.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: WEB / Target node version minor is not equal to Travis node version minor: npm rebuild should happen" {
    echo -n "v0.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.8.45
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: WEB / Node versions are ok. Npm rebuild should not happen" {
    echo -n "v0.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=WEB
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.34
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_npm ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP / Secondary branch should not be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=XXX
    export TRAVIS_PULL_REQUEST=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
}

@test "deploy: API_APP (app) / Pull request should not be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=master
    export TRAVIS_PULL_REQUEST=true
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
}

@test "deploy: API_APP (api) / api/master should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/master
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_PROD=remote_host_prod
    export REMOTE_DIR_API=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=api TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod rm /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_prod:/tmp/package_name_api_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_prod:/tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP (api) / api/staging should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/staging
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_STAG=remote_host_stag
    export REMOTE_DIR_API=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_stag STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=api TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_stag rm /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_stag:/tmp/package_name_api_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_stag:/tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP (api) / api/dev should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_dev
    export REMOTE_DIR_API=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_dev STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=api TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_dev rm /tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_dev:/tmp/package_name_api_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_dev:/tmp/package_name_travis_commit.deploy_remote_api" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP (app) / master should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=master
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_PROD=remote_host_prod
    export REMOTE_DIR_APP=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=app TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_prod rm /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_prod:/tmp/package_name_app_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_prod:/tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP (app) / staging should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=staging
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_STAG=remote_host_stag
    export REMOTE_DIR_APP=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_stag STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=app TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_stag rm /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_stag:/tmp/package_name_app_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_stag:/tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy: API_APP (app) / dev should be deployed" {
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_dev
    export REMOTE_DIR_APP=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export STRICT_VERSION_CHECK=false
    run $DIR/../scripts/deploy
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_dev STRICT_VERSION_CHECK=false BRANCHING_MODEL=API_APP BRANCHING_MODULE=app TRAVIS_NODE_VERSION=0.10.45 INIT_SCRIPT=init_script PACKAGE_NAME=package_name TRAVIS_COMMIT=travis_commit REMOTE_DIR=remote_dir /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run  grep "\-i deployment/build/ssh/id_rsa remote_user@remote_host_dev rm /tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_ssh
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/artifacts/package_name_travis_commit.tgz remote_user@remote_host_dev:/tmp/package_name_app_travis_commit.tgz" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
    run grep "\-i deployment/build/ssh/id_rsa deployment/build/scripts/deploy_remote remote_user@remote_host_dev:/tmp/package_name_travis_commit.deploy_remote_app" /tmp/mockup_scp 
    [ "$status" -eq 0 ]
}

@test "deploy_remote: API_APP (api) / STRICT_VERSION_CHECK is set and node version differ: no deploy" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/dev
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.11.36
    export BRANCHING_MODULE=api
    export STRICT_VERSION_CHECK=true
    run $DIR/../scripts/deploy_remote
    [ ! -e /tmp/mockup_npm ]
    [ ! -e /tmp/mockup_find ]
    [ ! -e /tmp/mockup_tar ]
    [ ! -e /tmp/mockup_init_script ]
}

@test "deploy_remote: API_APP (api) / Target node version is unstable and patch number is different from Travis one: npm rebuild should happen" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/dev
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.11.45
    export BRANCHING_MODULE=api
    run $DIR/../scripts/deploy_remote
    echo $output 
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    cp /tmp/mockup_find /tmp/PPP
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_api_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: API_APP (api) / Target node version is unstable and node versions are equal: npm rebuild should not happen" {
    echo -n "v0.11.34" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/dev
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.11.34
    export BRANCHING_MODULE=api
    run $DIR/../scripts/deploy_remote
    echo $output 
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_npm ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    cp /tmp/mockup_find /tmp/PPP
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_api_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}


@test "deploy_remote: API_APP (api) / Target node version major is not equal to Travis node version major: npm rebuild should happen" {
    echo -n "v1.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=api/dev
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.45
    export BRANCHING_MODULE=api
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_api_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: API_APP (api) / Target node version minor is not equal to Travis node version minor: npm rebuild should happen" {
    echo -n "v0.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.8.45
    export BRANCHING_MODULE=api
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    run grep "^rebuild$" /tmp/mockup_npm
    [ "$status" -eq 0 ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_api_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: API_APP (api) / Node versions are ok. Npm rebuild should not happen" {
    echo -n "v0.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.34
    export BRANCHING_MODULE=api
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_npm ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_api_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    run grep "^restart$" /tmp/mockup_init_script
    [ "$status" -eq 0 ]
}

@test "deploy_remote: API_APP (app)" {
    echo -n "v0.10.45" > /tmp/mockup_node_version
    export BRANCHING_MODEL=API_APP
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=/tmp
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    export TRAVIS_NODE_VERSION=0.10.34
    export BRANCHING_MODULE=app
    run $DIR/../scripts/deploy_remote
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_npm ]
    run grep "^/tmp -mindepth 1 -delete$" /tmp/mockup_find
    [ "$status" -eq 0 ]
    run grep "^-xzf /tmp/package_name_app_travis_commit.tgz -C /tmp$" /tmp/mockup_tar
    [ "$status" -eq 0 ]
    [ ! -e /tmp/mockup_init_script ]
}

@test "deploy: NO_DEPLOY / Development should not be deployed" {
    export BRANCHING_MODEL=NO_DEPLOY
    export TRAVIS_BRANCH=development
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export REMOTE_DIR=remote_dir
    export PACKAGE_NAME=package_name
    export TRAVIS_COMMIT=travis_commit
    export REMOTE_USER=remote_user
    export INIT_SCRIPT=init_script
    run $DIR/../scripts/deploy
    [ ! -e /tmp/mockup_ssh ]
    [ ! -e /tmp/mockup_scp ]
    [ "$status" -eq 0 ]
}

@test "deploy: Unknown branching model, should fail" {
    export TRAVIS_PULL_REQUEST=false
    export REMOTE_HOST_DEV=remote_host_prod
    export BRANCHING_MODEL=XXX
    run $DIR/../scripts/deploy
    [ "$status" -ne 0 ]
}

@test "deploy_remote: Unknown branching model, should fail" {
    export TRAVIS_PULL_REQUEST=false
    export BRANCHING_MODEL=XXX
    run $DIR/../scripts/deploy_remote
    [ "$status" -ne 0 ]
    [ ! -e /tmp/mockup_init_script ]
}
