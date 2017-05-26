#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
. $DIR/common.sh

nvmcheck

ionic build ios
ionic run ios
