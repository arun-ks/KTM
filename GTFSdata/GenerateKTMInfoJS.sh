#!/bin/bash

if [[ "$1" == "REFRESH" ]] ; then 
   echo REFRESH MODE : Get new GTFS file from api.data.gov.my
   GTFSZipFileName=GTFS_`date "+%Y%m%d"`.zip
   curl --location -X GET https://api.data.gov.my/gtfs-static/ktmb  > $GTFSZipFileName
   unzip -o $GTFSZipFileName
fi

GenerateJs () {
      LineName=$1
      HtmlFileWithStationNames=$2
      OutputJsFileName=$3
	    
      #Get RouteId for Line 
      RouteId=`grep "${LineName}" "routes.txt"  |cut -d, -f2`
      #Get list of trips for the RouteId
      grep -e trip_id -e $RouteId "trips.txt" |  cut -d, -f3 | sort   > __ListOfTripsInRoute.txt
      #Get Routes for the Trips of RouteId
      grep -Fwf __ListOfTripsInRoute.txt "stop_times.txt"             > __StopTimesOfTripsInRoute.txt      
      
      # Get HardCoded Mapping of stop_id to stationName from index.html file
      #stopNamesFile=__StationIdToNamesMapping.txt
      grep  'stationId:.*location:' $HtmlFileWithStationNames  | sed "s/[\':]/,/g" | cut -d, -f2,5 | awk -F, '{print $2","$1;}' > __StationIdToNamesMapping.txt       

      mv $OutputJsFileName ${OutputJsFileName}.`date "+%Y%m%d"`.bak
      echo "var GTFSDataExtractDate = '"` date "+%d-%b,%Y"`"';" > $OutputJsFileName
      echo ""                                                  >> $OutputJsFileName
      echo "let KTMTrains = ["                                 >> $OutputJsFileName
      
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
           
               printf("    { vehicleId: %d, typeOfDay: \"%s\", stationId: %s, stationName: \"%s\"%-*s, arrivalTime: \"%s\", departureTime: \"%s\", distanceTravelled: %-7s }, \n",
                  vehicleId, typeOfDay, stationId, stationName, 21 - length(stationName), "", arrivalTime, departureTime, $6);
           }
           ' __StopTimesOfTripsInRoute.txt >> $OutputJsFileName
      
      echo " " >> $OutputJsFileName
      echo '    { vehicleId: 9999, typeOfDay: "na"     , stationId: 00000, stationName: "na "                  , arrivalTime: "na"   , departureTime: "na"   , distanceTravelled: 0       } ' >> $OutputJsFileName
      echo "];" >> $OutputJsFileName
      
      echo " " >> $OutputJsFileName
      echo 'KTMTrains.forEach(train => train.direction   = (train.vehicleId % 2 ) ? "down" : "up");' >> $OutputJsFileName
      echo 'KTMTrains.forEach(train => train.vehicleType = (train.vehicleId > 2600 ) ? "LS" : "");'  >> $OutputJsFileName


      echo " " >> $OutputJsFileName
      grep 'vehicleId:.*arrivalTime.*departureTime'  $OutputJsFileName | awk -F '[,}]'  '
          BEGIN {
            print "let KTMTrainsSummary = ["
          }
          function getValuePart(t) {
            split(t, a, ":")
            if (length(a) == 3) {
              return a[2] ":" a[3]
            } else {
              return a[2]
            }
          }
          {
            vehicleId = getValuePart($1)
            typeOfDay = getValuePart($2)
            arrivalTime = getValuePart($5)
          
            key = vehicleId "|" typeOfDay
          
            if (!(key in minTime) || arrivalTime < minTime[key]) {
              minTime[key] = arrivalTime
              minStation[key] =  getValuePart($4)
            }
          
            if (!(key in maxTime) || arrivalTime > maxTimeVal[key]) {
              maxTime[key] = arrivalTime
              maxTimeVal[key] = arrivalTime
              maxStation[key] =  getValuePart($4)
              maxDistance[key] =  getValuePart($7)
            }
          }
          END {
            first = 1
            for (k in minTime) {
              split(k, parts, "|")
              id = parts[1]
              type = parts[2]
              if (!first) {
                print ","
              }
              first = 0
              printf "    { vehicleId:%s, typeOfDay:%s, stationNameStart:%s, arrivalTimeStart:%s, stationNameEnd:%s, arrivalTimeEnd:%s, distanceTravelled:%s }",   id, type, minStation[k], minTime[k], maxStation[k], maxTime[k], maxDistance[k]
            }
            print "\n];"
          }' >> $OutputJsFileName
      
      echo " " >> $OutputJsFileName
      echo 'KTMTrainsSummary.forEach(train => train.direction   = (train.vehicleId % 2 ) ? "down" : "up");' >> $OutputJsFileName
      
      echo "File created : "$OutputJsFileName" with "`cat __StopTimesOfTripsInRoute.txt | wc -l`" records."
      
      #rm __StationIdToNamesMapping.txt __ListOfTripsInRoute.txt __StopTimesOfTripsInRoute.txt 
      
      echo -e "\n\nDifferences between the files $OutputJsFileName and ${OutputJsFileName}.`date "+%Y%m%d"`.bak\n"
      sdiff -s -w 300 $OutputJsFileName ${OutputJsFileName}.`date "+%Y%m%d"`.bak
}      

GenerateJs "Port Klang Line" ../index_PortKlang.html KTMInfo_PortKlang.js
GenerateJs "Seremban Line"   ../index.html           KTMInfo.js


