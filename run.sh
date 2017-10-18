#!/bin/bash
[ -e app/scripts/vendors.js ] && rm app/scripts/vendors.js
[ -e ~/bin/nvmsh ] && source ~/bin/nvmsh
nvm use v4.2.6
ENV=development
[ -e .env ] && source .env
NODE_ENV=$ENV npm run local
