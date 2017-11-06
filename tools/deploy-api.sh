#!/bin/bash
set -x
cd api
git pull
sudo tools/deploy.sh
