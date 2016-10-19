#!/bin/bash
source ~/bin/nvmsh
ENV=development
[ -e .env ] && source .env
NODE_ENV=$ENF npm run local
