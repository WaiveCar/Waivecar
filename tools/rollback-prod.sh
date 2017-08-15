#!/bin/bash
set -x
for i in `seq 1 2`; do
  ssh waive-prod$i "sudo ./copy-js-over.sh rollback"
done
