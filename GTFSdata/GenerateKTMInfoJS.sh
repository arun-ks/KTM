#!/bin/bash

OutputJsFileName=KTMInfo.js

if [[ "$1" == "REFRESH" ]] ; then 
   echo REFRESH MODE : Get new GTFS file from api.data.gov.my
   GTFSZipFileName=GTFS_`date "+%Y%m%d"`.zip
   curl --location -X GET https://api.data.gov.my/gtfs-static/ktmb  > $GTFSZipFileName
   unzip -o $GTFSZipFileName
fi

#Get Route_ID for Seremban Line 
RouteId=`grep "Seremban Line" "routes.txt"  |cut -d, -f2`
#Get list of trips for the RouteId
grep -e trip_id -e $RouteId "trips.txt" |  cut -d, -f3 | sort   > __ListOfTripsInRoute.txt
#Get Routes for the Trips of RouteId
grep -Fwf __ListOfTripsInRoute.txt "stop_times.txt"             > __StopTimesOfTripsInRoute.txt


# Get HardCoded Mapping of stop_id to stationName from index.html file
stopNamesFile=__StationIdToNamesMapping.txt
grep  'stationId:.*location:' ../index.html  | sed "s/[\':]/,/g" | cut -d, -f2,5 | awk -F, '{print $2","$1;}' > __StationIdToNamesMapping.txt


mv $OutputJsFileName ${OutputJsFileName}.`date "+%Y%m%d"`.bak
echo "var GTFSDataExtractDate = '"` date "+%d-%b,%Y"`"';" > $OutputJsFileName
echo ""                                                  >> $OutputJsFileName
echo "KTMTrains = ["                                     >> $OutputJsFileName

awk -F, -v OFS=',' -v stopNamesFile="__StationIdToNamesMapping.txt" '
BEGIN {
    # Load stopNames into an array
    while ((getline line < stopNamesFile) > 0) {
        split(line, parts, ",");
        stopMap[parts[1]] = parts[2];
    }
    close(stopNamesFile);
}
NR > 1 {
    # Extract fields
    split($1, tripParts, "_");
    vehicleId = tripParts[2];
    typeOfDay = tripParts[1];

    stationId = $4;
    stationName = (stationId in stopMap) ? stopMap[stationId] : "Unknown";

    arrivalTime = substr($2, 1, 5);
    departureTime = substr($3, 1, 5);

    # Print formatted JavaScript object
    printf("            { vehicleId: %d, typeOfDay: \"%s\", stationId: %s, stationName: \"%s\"%-*s, arrivalTime: \"%s\", departureTime: \"%s\", distanceTravelled: %-7s },\n",
       vehicleId, typeOfDay, stationId, stationName, 21 - length(stationName), "", arrivalTime, departureTime, $6);
}
' __StopTimesOfTripsInRoute.txt >> $OutputJsFileName

echo " " >> $OutputJsFileName
echo '            { vehicleId: 9999, typeOfDay: "na"     , stationId: 00000, stationName: "na "                  , arrivalTime: "na"   , departureTime: "na"   , distanceTravelled: 0       } ' >> $OutputJsFileName
echo "];" >> $OutputJsFileName


rm __StationIdToNamesMapping.txt
rm __ListOfTripsInRoute.txt __StopTimesOfTripsInRoute.txt 

echo "File created : " $OutputJsFileName
#head $OutputJsFileName

