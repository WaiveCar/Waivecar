#!/bin/bash
[ -e app/scripts/vendors.js ] && rm app/scripts/vendors.js
[ -e ~/bin/nvmsh ] && source ~/bin/nvmsh
ENV=development
[ -e .env ] && source .env
NODE_ENV=$ENV npm run local
