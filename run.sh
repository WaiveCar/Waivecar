#!/bin/bash
[ -e ~/bin/nvmsh ] && source ~/bin/nvmsh
ENV=development
[ -e .env ] && source .env
NODE_ENV=$ENV npm run local
