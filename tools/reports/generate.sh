#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

path=$HOME/tmp/carreq
year_month=$1
scope=$2

# This is run on a personal server (cjm)
appImpressions() {
  mkdir -p $path
  cd $path
  [ -e accum ] && rm accum
  
  for i in 1 2; do
    cur=$path/s$i
    mkdir -p $cur
    rsync -azvr -f '+ car*' -f '- *' waive-prod$i:/var/log/outgoing/ $cur
    cat $cur/carsrequest.txt $cur/carsrequest.txt.1 | grep $year_month >> accum
    gunzip -c $cur/cars*gz | grep $year_month >> accum
  done

  sort -n accum -o accum
  # we have two computations, a naive one which is simply the line-count
  naive=`wc -l accum`

  # and one that tries to take funky multiple requests from the app into consideration.
  # To do this we filter out when a user does requests within the same 10 second interval
  # and yes, we ignore the edge cases when the 10 second interval crosses a tens place
  # in the timestamp
  

  # within the same second
  generous=`cat accum | sed -E s'/\.[0-9]{3}Z//' | sort -n | uniq | wc -l`

  # within the same 10 seconds
  conservative=`cat accum | sed -E s'/[0-9]\.[0-9]{3}Z//' | sort -n | uniq | wc -l`
}

base=https://api.waivecar.com/report/$year_month/report
if [ -z "$scope" ]; then 
  appImpressions
  echo "naive: $naive"
  echo "generous: $generous"
  echo "conservative: $conservative"
else
  base="${base}?scope=$scope"
fi
echo "Making heatmap"
$DIR/makepoints.sh $year_month $scope
report="$path/report-$scope${year_month}.json"
echo "Putting monthly report in $report"
curl -s $base > $report

