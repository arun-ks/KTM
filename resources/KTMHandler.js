const iconDesigns = {
  	'up'   : { viewBox: '0 0 30 30' , dimensionW: 20, dimensionH: 20, colour:'blue'  , svgPathd: 'M15 5 L25 25 L5 25 Z'       },
  	'down' : { viewBox: '0 0 30 30' , dimensionW: 20, dimensionH: 20, colour:'red'   , svgPathd: 'M15 25 L25 5 L5 5 Z'        },
    'both' : { viewBox: '0 0  0  0' , dimensionW:  0, dimensionH:  0, colour:'white' , svgPathd: 'M15 25 Z'                   },  	
  	'na'   : { viewBox: '0 0 30 30' , dimensionW: 20, dimensionH: 20, colour:'green' , svgPathd: 'M5 5 L25 5 L25 25 L5 25 Z'  },
  	'user' : { viewBox: '0 0 30 30' , dimensionW: 20, dimensionH: 20, colour:'green' , svgPathd: 'M12 6 A3 3 0 1 1 18 6 A3 3 0 1 1 12 6 Z  M10 9 L20 9 L20 20 L10 20 Z  M5 10 L10 10 L10 14 L5 14 Z  M20 10 L25 10 L25 14 L20 14 Z M10 20 L14 20 L14 26 L10 26 Z  M16 20 L20 20 L20 26 L16 26 Z'  }
}

function findDeviceTypeBeingUsed() {    // Returns Watch/Mobile/Desktop
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/watch|samsungbrowser/i.test(userAgent.toLowerCase())) { return "Watch";}
    if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) { return "Mobile"; }
    return "Desktop";
}

function initializePageParameters(){
        const urlParams   = new URLSearchParams(window.location.search);

        let filterParamRaw = urlParams.get('filter');
        const filterParam =  (filterParamRaw == null) ?  "both" : filterParamRaw;

        let focusVehicleIdParamRaw = urlParams.get('focusVehicleId');
        const focusVehicleIdParam = ( (focusVehicleIdParamRaw == null) || isNaN(focusVehicleIdParamRaw) ) ? 0 : parseInt(focusVehicleIdParamRaw, 10);
           	
        let baseStationParamRaw = urlParams.get('baseStation');
        const baseStationParam =  ((baseStationParamRaw == null) || !(baseStationParamRaw in KTMStations)) ? BASESTATION_DEFAULT : baseStationParamRaw;
        
        let hideStationNameParamRaw = urlParams.get('hideStationName');
        const hideStationNameParam =  (hideStationNameParamRaw == null || hideStationNameParamRaw == "false") ? false : true;        

        //Force use or baseStation parameter
        let url = new URL(location);
        url.searchParams.set("baseStation", baseStationParam);
        history.pushState({}, "", url);
        
        //Force use or hideStationNameParam parameter  
        url = new URL(location);
        url.searchParams.set("hideStationName", hideStationNameParam);
        history.pushState(null, '', url);     

        console.log(`Page Parameters: filter is ${filterParam}, focusVehicleId is ${focusVehicleIdParam}, baseStation is ${baseStationParam} & hideStationNameParam is ${hideStationNameParam} `);                      

        return { filterParam, focusVehicleIdParam, baseStationParam, hideStationNameParam};
}

function createFilterLink(linkId, filterKey, baseStationParam, iconKey, includeLabel = false) {
    const link = document.getElementById(linkId);
    link.href = `${window.location.pathname}?baseStation=${baseStationParam}&hideStationName=${hideStationNameParam}&filter=${filterKey}`;

    const existingSvg = link.querySelector('svg');
    if (existingSvg) existingSvg.remove();

    const design = iconDesigns[iconKey];
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", design.dimensionW);
    svg.setAttribute("height", design.dimensionH);
    svg.setAttribute("viewBox", design.viewBox);
    svg.setAttribute("fill", design.colour);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", design.svgPathd);
    svg.appendChild(path);

    if (includeLabel) {
        link.appendChild(document.createTextNode(iconKey));
    }
    link.appendChild(svg);
}

function makeLinkTODO(moreFilter) {
//	newUrl = `${window.location.pathname}?baseStation=${baseStationParam}&hideStationName=${hideStationNameParam}&${moreFilter}`;
}

function initializeAllFilterLinks() {
	      createFilterLink("filterLinkBoth", "both", baseStationParam, "both");
        createFilterLink("filterLinkUp", "up", baseStationParam, "up");
        createFilterLink("filterLinkDown", "down", baseStationParam, "down");
        
        if (filterParam === "all") {
            createFilterLink("filterLinkOthers", "all", baseStationParam, "na", true);
        } else {
            document.getElementById("filterLinkOthers").href = "#";
        } 
}

function initializeBaseStationDropdown(defaultBaseStation) {
     const dropdown = document.getElementById('baseStationDropdown');

     const KTMStationNames = Object.keys(KTMStations);
     KTMStationNames.forEach(stationName => {
         const option = document.createElement('option');
         option.value = stationName;
         option.textContent = stationName;
         if (stationName === defaultBaseStation) {
             option.selected = true;
         }
         dropdown.appendChild(option);
     });

     dropdown.addEventListener('change', function () {
         handleBaseStationUpdate(this.value);
     });
}

function handleBaseStationUpdate(newBaseStation) {
         baseStationParam = newBaseStation;
         console.log(`New Selected Station: ${newBaseStation}`);

         plotStationsOnMap(focusVehicleIdParam);
         
         fetchMtrecTrainPositionApiData();
         toggleStationScheduleTableVisibility();

         const url = new URL(location);
         url.searchParams.set("baseStation", newBaseStation);
         history.pushState(null, '', url);

         document.getElementById('filterLinkBoth').href = `${window.location.pathname}?baseStation=${baseStationParam}&filter=both`;
         document.getElementById('filterLinkUp').href   = `${window.location.pathname}?baseStation=${baseStationParam}&filter=up`;
         document.getElementById('filterLinkDown').href = `${window.location.pathname}?baseStation=${baseStationParam}&filter=down`;
}

function initializeHideStationNameToggle(){	
   const toggle = document.getElementById("stationToggle");   
   toggle.checked = hideStationNameParam; 
   
   //const toggleText = document.getElementById("toggleText");
   //toggleText.textContent = toggle.checked ? "Show Station Names" : "Hide Station Names" ;
   //toggleText.textContent = "Station Names";
   //toggleText.textContent = toggle.checked ? "Hide Station Names" : "Show Station Names" ;   

   toggle.addEventListener("change", handleHideStationNameUpdate);
}

function handleHideStationNameUpdate() {
  const toggle = document.getElementById("stationToggle");
  const toggleText = document.getElementById("toggleText");

  hideStationNameParam = toggle.checked;
  //console.log("Hide station names Flag:", hideStationNameParam);
   
  const url = new URL(location);
  url.searchParams.set("hideStationName", hideStationNameParam);
  history.pushState(null, '', url);      
  
  initializeAllFilterLinks();
  plotStationsOnMap(focusVehicleIdParam);   
}

function initializeMap(baseStation) {
	   // Initialize the map to Location to baseStation
     // API reference https://leafletjs.com/reference.html     
     
     // Openstreem Map has Transport Map Layer, but that requires API key from https://www.thunderforest.com/maps/transport/ hence it is not used.     
     const map = L.map('map').setView(KTMStations[baseStation].location, 11);
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
         maxZoom: 18,
         attribution: '&copy; OpenStreetMap contributors'
     }).addTo(map);

     //map.locate({setView: true, maxZoom: 16});
     return map;
}

function plotStationsOnMap(vehicleId = 0) {
    // Remove all station markers (if any)
    map.eachLayer(layer => {
        if (layer instanceof L.Marker && !layer.isVehicleMarker) {   
            map.removeLayer(layer);
        }
    });

    const currentDate = getCurrentDate();
    for (const [stationName, stationInfo] of Object.entries(KTMStations)) {

        const tripDurationInMins = Math.abs(stationInfo.tripDurationInMins - KTMStations[baseStationParam].tripDurationInMins);
        const tripDistanceInKms = Math.abs(stationInfo.tripDistanceInKms - KTMStations[baseStationParam].tripDistanceInKms).toFixed(1);

        let markerHTML = "";
        let offsetX = 10;
        let label = `<a href="https://myrailtime.ktmb.com.my/timetable?origin=${stationInfo.stationId}" target="_blank">${stationName}</a>`;

        stationInfo.colour = (stationName === baseStationParam) ? "blue" : "#8b81fb"; //Color for baseStation. This will change for nearby stations in Focus Mode.

        if (vehicleId > 0) {  // Focus Vehicle Mode With Departure Time On Marker & Color Coded Stations
            const ktmTrainForStation = KTMTrains.filter(train => train.stationName === stationName && train.vehicleId === vehicleId);

            if (ktmTrainForStation.length < 1) continue;

            let trainDepartureTime = ktmTrainForStation[0].departureTime;
            const [hours, minutes] = trainDepartureTime.split(":").map(Number);
            const departureTime = new Date(currentDate);
            departureTime.setHours(hours, minutes, 0, 0);
            const diffMinutes = (departureTime - currentDate) / (1000 * 60);

            if (diffMinutes >= -30 && diffMinutes <= 30 && !(stationName === baseStationParam)) {
                const intensity = Math.abs(diffMinutes) / 30;
                const lightness = 85 - intensity * 35;
                stationInfo.colour = diffMinutes < 0  ? `hsl(0, 70%, ${lightness}%)` : `hsl(120, 70%, ${lightness}%)`;
            }
            markerHTML = `<div class="marker-containerRECT" style="background-color:${stationInfo.colour};"><span class="marker-numberRECT">${trainDepartureTime}</span></div>`;
            offsetX = 18;
        }
        else {   // Default Station Mode With Distance from Base-Station On Marker
            markerHTML = `<div class="marker-containerCIRCLE" style="background-color:${stationInfo.colour};"><span class="marker-numberCIRCLE">${tripDurationInMins}</span></div>`;
        }

        if (stationName === baseStationParam) {
            map.flyTo(stationInfo.location);
        }

        const stationMarker = L.marker(stationInfo.location, {
            icon: L.divIcon({
                className: 'custom-station-marker',
                html: markerHTML,
                iconSize: [26, 26],
                iconAnchor: [18, 18],
            })
        }).addTo(map);
        stationMarker.isVehicleMarker = false;

        if (stationName === baseStationParam || hideStationNameParam === false) {  
            stationMarker.bindTooltip(label, {  //Always Visible
                permanent: true,
                direction: 'right',
                offset: [offsetX, -6]
            });
        } else {
            stationMarker.bindPopup(label, {   //Visible on click
                permanent: false,
                direction: 'right',
                offset: [offsetX, -6],
                className: 'custom-popup'
            });
        }
    }
}

async function fetchMtrecTrainPositionApiData() {
	    // Function to fetch data from MTREC API
      // API       : https://www.mtrec.name.my/api.html
      // DataSets  : https://developer.data.gov.my/static-api/data-catalogue
     countdown = COUNTDOWN_SECONDS;
     try {
         const response = await fetch('https://api.mtrec.name.my/api/position?agency=ktmb');
         //const response = await fetch('https://cors-anywhere.herokuapp.com/https://api.mtrec.name.my/api/position?agency=ktmb');
        
         const data = await response.json();
         //** For testing, comment above line & uncomment 2 code lines below 
         // New value of dummyData can be obtained with  JSON.stringify(data)
         //dummyData=  '{"IP_Address":"175.139.96.66","status":200,"message":"Request successful","timestamp":1764162153,"data":[{"trip":{"tripId":"weekday_2063"},"position":{"latitude":3.235832,"longitude":101.68106,"bearing":0,"speed":28},"timestamp":"1764162117","vehicle":{"id":"weekday_2063","label":"SCS24"}}, {"trip":{"tripId":"weekday_2054"},"position":{"latitude":3.140152,"longitude":101.69385,"bearing":0,"speed":0},"timestamp":"1764162126","vehicle":{"id":"weekday_2054","label":"SCS07"}}, {"trip":{"tripId":"2985"},"position":{"latitude":5.367928,"longitude":100.41254,"bearing":0,"speed":98},"timestamp":"1764162121","vehicle":{"id":"2985","label":"SCS12"}}, {"trip":{"tripId":"weekday_2175"},"position":{"latitude":3.0646,"longitude":101.54732,"bearing":0,"speed":67},"timestamp":"1764162118","vehicle":{"id":"weekday_2175","label":"SCS23"}}, {"trip":{"tripId":"weekday_2059"},"position":{"latitude":3.023827,"longitude":101.71571,"bearing":0,"speed":0},"timestamp":"1764162112","vehicle":{"id":"weekday_2059","label":"SCS04"}}, {"trip":{"tripId":"weekday_2062"},"position":{"latitude":2.658643,"longitude":101.99828,"bearing":0,"speed":28},"timestamp":"1764162109","vehicle":{"id":"weekday_2062","label":"SCS21"}}, {"trip":{"tripId":"60"},"position":{"latitude":5.330392,"longitude":102.12107,"bearing":0,"speed":23},"timestamp":"1764162070","vehicle":{"id":"60","label":"DMU12(D6124)"}}, {"trip":{"tripId":"weekday_2179"},"position":{"latitude":3.138645,"longitude":101.69349,"bearing":0,"speed":18},"timestamp":"1764162120","vehicle":{"id":"weekday_2179","label":"SCS19"}}, {"trip":{"tripId":"2919"},"position":{"latitude":4.607253,"longitude":101.07675,"bearing":0,"speed":23},"timestamp":"1764162106","vehicle":{"id":"2919","label":"EMU22"}}, {"trip":{"tripId":"weekday_2183"},"position":{"latitude":3.539063,"longitude":101.63529,"bearing":0,"speed":98},"timestamp":"1764162118","vehicle":{"id":"weekday_2183","label":"SCS29"}}, {"trip":{"tripId":"weekday_2174"},"position":{"latitude":3.283565,"longitude":101.56771,"bearing":0,"speed":61},"timestamp":"1764162118","vehicle":{"id":"weekday_2174","label":"EMU24"}}, {"trip":{"tripId":"9999"},"position":{"latitude":5.572193,"longitude":100.49647,"bearing":0,"speed":119},"timestamp":"1764162112","vehicle":{"id":"2987","label":"EMU31"}} ]}';     
         //const data = JSON.parse(dummyData);        

         
         console.log((new Date()).toLocaleTimeString(),'Count: ', data.data.length,', Response: ', data);
         const vehicles = data.data || [];
         if (data.data.length == 0 ) {
         	 fetchMtrecServicePositionStatusApiData();
         	 classifyVehiclesForPlotting(vehicles);
         } else {
         	 document.getElementById("system_status").innerHTML="";
           classifyVehiclesForPlotting(vehicles);
         }
     } catch (error) {
         console.error('Error fetching data from API:', error);
         fetchMtrecServicePositionStatusApiData();         
     }
}

async function fetchMtrecServicePositionStatusApiData() {
     try {
         const response = await fetch('https://api.mtrec.name.my/api/monitor?service=position-api-ktmb');
         const data = await response.json();
         console.log((new Date()).toLocaleTimeString(),' (API Response) :', data);
         const api_monitor_status = data.data.monitor_status;

         document.getElementById("system_status").innerHTML= ("Down"==api_monitor_status) ?
             `API Status:<b><span style="color: red;">${api_monitor_status}</span></b>`:
             `API Status:<b><span style="color: green;">${api_monitor_status}</span></b>`;
     } catch (error) {
         console.error('Error fetching data from API:', error);
     }		      	
}
      
function classifyVehiclesForPlotting(vehicles) {
     let upCount = 0,downCount = 0,naCount = 0, focusCount = 0;
     document.getElementById("focusTrainMessage").textContent = "";

     unplotAllVechiclesOnMap();
     KTMTrains.forEach(train => train.isActive = false);

     vehicles.forEach(vehicle => {
         const vehicleIdNum = parseInt(vehicle.vehicle.id.split('_')[1] || vehicle.vehicle.id);
         /* plotThisTrain Logic
              |Filter |  up-Train  | down-Train | na-Train|
              |-------|------------|------------|---------|
              |up     |  1         | 0          | 0       |
              |down   |  0         | 1          | 0       |
              |both   |  1         | 1          | 0       |
              |all    |  1         | 1          | 1       | Internal mode for debugging
              |ELSE   |  1         | 1          | 0       |
         */

         let plotThisTrain = true;
         let activeKTMTrainInfo = KTMTrains.find(train => train.vehicleId === vehicleIdNum && train.stationName === baseStationParam );
         if( activeKTMTrainInfo ) {
               activeKTMTrainInfo.isActive = true;
               KTMTrains.forEach(train => train.isActive = ( train.vehicleId === vehicleIdNum) ? true : train.isActive);
               if ( activeKTMTrainInfo.direction == "up") {
         	          upCount++;
         	          if (filterParam === "down" ) { plotThisTrain = false;}
         	    } else {
         	    	  	 downCount++;
         	    	  	 if (filterParam === "up" ) { plotThisTrain = false;}
         	    }
         } else {
              activeKTMTrainInfo = KTMTrains.find(train => train.vehicleId === 9999);      //Use Dummy Train              	
              activeKTMTrainInfo.direction = "na";
              naCount++;
              if (filterParam !== "all" ) { plotThisTrain = false;}
         }

         if (focusVehicleIdParam > 0 ) { // If focusVehicleIdParam is used then show just 1 vehicle
            if (focusVehicleIdParam == vehicleIdNum) {
            	    focusCount++;
            	    document.getElementById("focusTrainMessage").innerHTML = `, <span id="scheduleOpen" tyle="color:blue" onclick="javascript:handleFocusTrain(focusVehicleIdParam,true)">#${focusVehicleIdParam}</span> is active`;             	             
            	    handleFocusTrain(focusVehicleIdParam); 
            } else {
       	        plotThisTrain = false;
            }
         }

         if (plotThisTrain === true) {
         	     console.debug(`Plotting Vehicle: #${vehicleIdNum}, direction ${activeKTMTrainInfo.direction} at Position:(${vehicle.position.latitude}, ${vehicle.position.longitude})`);                    	
               plotVehicleOnMap(vehicleIdNum, vehicle.position, activeKTMTrainInfo ) ;               
        } else {
           	  console.debug(`\tSkipping Vehicle: #${vehicleIdNum}, direction ${activeKTMTrainInfo.direction}`);
         }
     });

     document.getElementById("trainCountUp").textContent = `${upCount}`;
     document.getElementById("trainCountDown").textContent = `${downCount}`;
     document.getElementById("trainCountOthers").textContent = (filterParam === "all" )  ? `:${naCount}`:"";
     bothCount = upCount + downCount;
     allCount = naCount + bothCount;
     document.getElementById("trainCountBoth").textContent = `${bothCount}`;

     if ( focusVehicleIdParam > 0 && focusCount == 0 ) { // If we are in focus Mode & the focused Train has no data
     	  let focusKTMTrainInfo = KTMTrains.find(train => train.vehicleId === focusVehicleIdParam);
     	  if ( focusKTMTrainInfo ) {
    	  	  document.getElementById("focusTrainMessage").innerHTML = `, <span id="scheduleOpen" tyle="color:blue" onclick="javascript:handleFocusTrain(focusVehicleIdParam,true)">#${focusVehicleIdParam}</span> is not active`; //, it starts from ${focusKTMTrainInfo.stationName};
    	  	  //document.getElementById("focusTrainMessage").href = `javascript:handleFocusTrain(focusVehicleIdParam)`;         	  	  

     	  } else {
     	      document.getElementById("focusTrainMessage").textContent = `,  No information on #${focusVehicleIdParam} `;	
     	  }
     	  handleFocusTrain(focusVehicleIdParam);
     }
}

function plotVehicleOnMap(vehicleIdNum, vehiclePosition, activeKTMTrainInfo) {
	       vehicleIconDesign= iconDesigns[activeKTMTrainInfo.direction];
         const arrowIcon = L.divIcon({
             html: `<svg width=${vehicleIconDesign.dimensionW} height=${vehicleIconDesign.dimensionH} xmlns="http://www.w3.org/2000/svg" fill=${vehicleIconDesign.colour} viewBox="${vehicleIconDesign.viewBox}"><path d="${vehicleIconDesign.svgPathd}"/></svg>`,
             className: 'vehicle-arrow-icon',
             iconSize: [30, 30],
             iconAnchor: [12, 12]
         });
         const marker = L.marker([vehiclePosition.latitude, vehiclePosition.longitude], {
             icon: arrowIcon
         }).addTo(map);

         let label;
         let distance;
         if ( activeKTMTrainInfo.direction === "na" ) {
            label    = `( #${vehicleIdNum})`;
         } else {	                	
            distance = calculateDistanceInKM(vehiclePosition.latitude, vehiclePosition.longitude, KTMStations[baseStationParam].location[0], KTMStations[baseStationParam].location[1]);
            distance = distance.toFixed(2);

            label = `${activeKTMTrainInfo.arrivalTime} (<a href="${window.location.pathname}?focusVehicleId=${vehicleIdNum}&baseStation=${baseStationParam}&hideStationName=${hideStationNameParam}">#${vehicleIdNum}</a>) - ${vehiclePosition.speed} km/h`;
            if ( vehicleIdNum === focusVehicleIdParam ) {
          	    map.flyTo([vehiclePosition.latitude, vehiclePosition.longitude]);  //, 14, { animation: true }) ;            	                           	
                const trainDurationFromBaseStation = findTrainDurationInMins([vehiclePosition.latitude, vehiclePosition.longitude]);
           	    label = `${label}, ${trainDurationFromBaseStation} mins away`;              	
           	   // label = `${label}, (<span onclick="javascript:handleFocusTrain(focusVehicleIdParam)">Schedule</span>)`;
         	      speakDistance(trainDurationFromBaseStation);
            }
//            else {
//            	      label = `${label} - ${vehiclePosition.speed} km/h.`;                   	
//            }
         }
         marker.bindTooltip(label, {
             permanent: true,
             direction: 'left',
             offset: [-10, 0],               //offset: [10, 0],
             className: 'vehicle-label',
             interactive: true
         });
         marker.isVehicleMarker = true;  //This marker's location can move on next refresh
}

function unplotAllVechiclesOnMap() {
     map.eachLayer(layer => {
         if (layer instanceof L.Marker && layer.isVehicleMarker) {                	
             map.removeLayer(layer);
         }
     });       	
}

function getTypeOfDay() {
       const malaysiaPublicHolidays = [
         "2025-12-25", // Christmas Day
         "2026-01-01", // New Year's Day
         "2026-02-01", // Federal Territory Day
         "2026-02-01", // Thaipusam
         "2026-02-02", // Federal Territory Holiday
         "2026-02-02", // Thaipusam Holiday
         "2026-02-17", // Chinese New Year
         "2026-02-18", // Chinese New Year Holiday
         "2026-03-07", // Nuzul Al-Quran
         "2026-03-21", // Hari Raya Aidilfitri
         "2026-03-22", // Hari Raya Aidilfitri Holiday
         "2026-03-23", // Hari Raya Aidilfitri Holiday
         "2026-05-01", // Labour Day
         "2026-05-27", // Hari Raya Haji
         "2026-05-31", // Wesak Day
         "2026-06-01", // Agong's Birthday
         "2026-06-01", // Wesak Day Holiday
         "2026-06-17", // Awal Muharram
         "2026-08-25", // Prophet Muhammad's Birthday
         "2026-08-31", // Merdeka Day
         "2026-09-16", // Malaysia Day
         "2026-11-08", // Deepavali
         "2026-11-09", // Deepavali Holiday
         "2026-12-25"  // Christmas Day
         
       ];
       
       const currentDate = getCurrentDate();
       const todayStr = currentDate.toISOString().split("T")[0];  //Date as YYYY-MM-DD
       
       const isWeekend = [0, 6].includes(currentDate.getDay());
       const isPublicHoliday = malaysiaPublicHolidays.includes(todayStr);
       let typeOfDay = (isWeekend || isPublicHoliday) ? "weekend" : "weekday";    
       
       //typeOfDay = "weekday" ; // For TESTING
       //typeOfDay = "weekday";  // For TESTING  
       return typeOfDay;	
}

function getCurrentDate() {
	  let currentDate = new Date();
    if (currentDate.getHours() < 5 )  // Handle times when pages is opened when there are no trains ...
          currentDate.setHours(4);
          
     //currentDate.setHours(10, 32, 0, 0); //For TESTING          *************************************        
     //currentDate.setDate(currentDate.getDate() + 1)
     
     return currentDate;
}

function showStationScheduleTable(stationName, direction) {
       const typeOfDay = getTypeOfDay();

       let trainsForStationAndTypeOfDayUnsorted = KTMTrains.filter(train => train.typeOfDay === typeOfDay && train.stationName === stationName && train.direction === direction);
       let trainsForStationAndTypeOfDay = trainsForStationAndTypeOfDayUnsorted.sort((trainA, trainB) => {
           let timeA = trainA.arrivalTime.split(":").map(Number);
           let timeB = trainB.arrivalTime.split(":").map(Number);
           return timeA[0] - timeB[0] || timeA[1] - timeB[1];
       });

       const currentDate = getCurrentDate();
          
       // Create table if there is none. If it has 1 row, append next row to it. If it already had 2 rows then delete the table.
       let table = document.querySelector("#stationScheduleTable");
       if (table) {
           if (table.rows.length === 2) {
               table.remove();
               table = null;
           }
       }
       if (!table) {
           table = document.createElement("table");
           table.id = "stationScheduleTable";
           table.style.borderCollapse = "collapse";
           document.body.appendChild(table);
       }

       const row = document.createElement("tr");
       const stationCell = document.createElement("td");

       stationCell.textContent = direction +" ";
       stationCell.style.fontSize = "small";
       stationCell.style.border = "1px solid black";

       vehicleIconDesign= iconDesigns[direction];
       const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
       svg.setAttribute("width", vehicleIconDesign.dimensionW);
       svg.setAttribute("height",vehicleIconDesign.dimensionH);
       svg.setAttribute("viewBox", vehicleIconDesign.viewBox);
       svg.setAttribute("fill", vehicleIconDesign.colour);
       const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
       path.setAttribute("d", vehicleIconDesign.svgPathd);
       svg.appendChild(path);
       stationCell.appendChild(svg);

       row.appendChild(stationCell);

       trainsForStationAndTypeOfDay.forEach(train => {
       	  const cell = document.createElement("td");
           cell.style.fontSize = "small";                   // Use x-small for smaller font
           cell.style.border = "1px solid black";
           cell.style.whiteSpace = "normal";

           cell.appendChild(document.createTextNode(`${train.arrivalTime}`));        
           
           const [hours, minutes] = train.departureTime.split(":").map(Number);
           const departureTime = new Date(currentDate);
           departureTime.setHours(hours, minutes, 0, 0);           
           let diffMinutes = (departureTime - currentDate) / (1000 * 60);
           if (diffMinutes < 0 && diffMinutes >= -60) {
               cell.style.backgroundColor = "lightcoral";
           } else if (diffMinutes >= 0 && diffMinutes <= 120) {
               cell.style.backgroundColor = "lightgreen";
           }           
           
           
           if (train.isActive == true) {
           	   cell.style.fontWeight = 'bold';
               cell.appendChild(document.createTextNode("*"));   //Marking trains which are in API response
           } else {   //Check if this train should be on the API response as they are on the track
              let trainSummaryData = KTMTrainsSummary.filter(trainSummary => trainSummary.typeOfDay === typeOfDay && trainSummary.vehicleId === train.vehicleId);
              let [hrs, mins] = trainSummaryData[0].arrivalTimeStart.split(":").map(Number);
              const arrivalTimeStart = new Date(currentDate);              
              arrivalTimeStart.setHours(hrs, mins, 0, 0);
              
              [hrs, mins] = trainSummaryData[0].arrivalTimeEnd.split(":").map(Number);
              const arrivalTimeEnd = new Date(currentDate);              
              arrivalTimeEnd.setHours(hrs, mins, 0, 0);    
                     
              if ( arrivalTimeStart <= currentDate  && currentDate <=  arrivalTimeEnd) {
              	   cell.appendChild(document.createTextNode("+"));
               }
               //else {	   cell.appendChild(document.createTextNode( new Date(arrivalTimeStart).toString()  + "" + new Date(arrivalTimeEnd).toString() + " BUT " +  new Date(currentDate).toString()  ));              }
           }

           cell.appendChild(document.createElement("br"));
           cell.appendChild(document.createTextNode("("));
           const vehicleLink = document.createElement("a");
           vehicleLink.href = `${window.location.pathname}?focusVehicleId=${train.vehicleId}&baseStation=${stationName}&hideStationName=${hideStationNameParam}`;
           vehicleLink.textContent = `${train.vehicleId}${train.vehicleType}`;
           cell.appendChild(vehicleLink);
           cell.appendChild(document.createTextNode(")"));

           // Show only the trains for last 1 hour & next 2 hours if the page is opened on a Mobile/Watch.
           if ( !(deviceType == "Desktop") && ( train.isActive  ||(diffMinutes >= -60 && diffMinutes <= 120)) ) {
           		row.appendChild(cell);
           }
           if ( (deviceType == "Desktop")) {
              row.appendChild(cell);	
           }
       });
       table.appendChild(row);

       // Add legend after the 2nd row was added.
       if (table.rows.length === 2) {
            let tableLegend = document.querySelector("#stationScheduleLegend");
             tableLegend = document.createElement("table");
             tableLegend.id = "stationScheduleLegend";
             tableLegend.style.borderCollapse = "collapse";
             tableLegend.innerHTML = `
                 <tr>
                     <td style="font-size: small; border: 1px dotted black; white-space: normal;">Legend: </td>
                     <td style="background-color: lightcoral; font-size: small; border: 1px dotted black; white-space: normal;">Trains in last 1 hr</td>
                     <td style="background-color: lightgreen; font-size: small; border: 1px dotted black; white-space: normal;">Trains for next 2 hrs</td>
                     <td style="font-size: small; border: 1px dotted black; white-space: normal;"><strong>* Train is on the map</strong></td>
                     <td style="font-size: small; border: 1px dotted black; white-space: normal;">+ Train is active on tracks, but position is unknown</td>
                 </tr>
                 <tr>
                     <td style="font-size: small; border: 1px dotted black; white-space: normal;" colspan=4>Departure Times on ${typeOfDay}s at ${baseStationParam}. <a href="https://www.ktmb.com.my/TrainTime.html" target="_blank">Schedule</a> updated on ${GTFSDataExtractDate}</td>
                 </tr>
             `;
             document.body.appendChild(tableLegend);
       }
}

function toggleStationScheduleTableVisibility() {	  
    let tableSchedule = document.querySelector("#stationScheduleTable");
    let tableLegend = document.querySelector("#stationScheduleLegend");
    const button = document.querySelector("#toggleStationScheduleButton");
    if (!tableSchedule) {
    	  showStationScheduleTable(baseStationParam,"up");
    	  showStationScheduleTable(baseStationParam,"down");
        tableSchedule = document.querySelector("#stationScheduleTable");
        tableLegend = document.querySelector("#stationScheduleLegend");
        tableSchedule.style.display = "none";
        tableLegend.style.display = "none" ;
    }

    if (displayScheduleFlag === false) {
        tableSchedule.style.display = "table";
        tableLegend.style.display = "table" ;
        displayScheduleFlag = true;
        tableSchedule.scrollIntoView({ behavior: "smooth", block: "start" });  // Scroll to table    
        button.textContent = "Hide Schedule";
    } else {
        tableSchedule.style.display = "none";
        tableLegend.style.display = "none" ;
        displayScheduleFlag = false;
        button.textContent = "Show Schedule";
        if (tableSchedule) {
           tableSchedule.remove();
           tableLegend.remove();
        }

    }
}

function handleFocusTrain(vehicleId, scrollIntoView = false) {  
	 plotStationsOnMap(focusVehicleIdParam);
	//  showTrainScheduleTable(vehicleId, scrollIntoView);	
}

function showTrainScheduleTable(vehicleId, scrollIntoView = false) {
	     
       let stationForTrainUnsorted = KTMTrains.filter(train => train.vehicleId === vehicleId );
       let stationForTrain = stationForTrainUnsorted.sort((trainA, trainB) => {
           let timeA = trainA.arrivalTime.split(":").map(Number);
           let timeB = trainB.arrivalTime.split(":").map(Number);
           return timeA[0] - timeB[0] || timeA[1] - timeB[1];
       });

       let tableSchedule = document.querySelector("#trainScheduleTable");
       if (tableSchedule) {
           tableSchedule.remove();
           tableSchedule = null;
           return;
       }
       if (!tableSchedule) {
           tableSchedule = document.createElement("table");
           tableSchedule.id = "trainScheduleTable";
           tableSchedule.style.borderCollapse = "collapse";
           document.body.appendChild(tableSchedule);
       }

       const row = document.createElement("tr");
       const trainCell = document.createElement("td");

       trainCell.textContent = vehicleId +" ";
       trainCell.style.fontSize = "small";
       trainCell.style.border = "1px solid black";
       row.appendChild(trainCell);
       
       const currentDate = getCurrentDate();  

       stationForTrain.forEach(train => {
       	  const cell = document.createElement("td");
           cell.style.fontSize = "small";                   // Use x-small for smaller font
           cell.style.border = "1px solid black";
           cell.style.whiteSpace = "normal";

           cell.appendChild(document.createTextNode(`${train.arrivalTime}`));
           cell.appendChild(document.createElement("br"));
           
           const vehicleLink = document.createElement("a");
           vehicleLink.href = `https://myrailtime.ktmb.com.my/timetable?origin=${train.stationId}`;
           vehicleLink.textContent = `${train.stationName}`;
           vehicleLink.target = "_blank";
           vehicleLink.rel = "noopener noreferrer";
           cell.appendChild(vehicleLink);        
           
           const [hours, minutes] = train.departureTime.split(":").map(Number);
           const departureTime = new Date(currentDate);
           departureTime.setHours(hours, minutes, 0, 0);
           
           const diffMinutes = (departureTime - currentDate) / (1000 * 60);           
           if (diffMinutes >= -30 && diffMinutes <= 30) {
               const intensity = Math.abs(diffMinutes) / 30; // 0 ? 1
               const lightness = 85 - intensity * 35; // lighter near now, darker toward ±30
           
               if (diffMinutes < 0) {                   
                   cell.style.backgroundColor = `hsl(0, 70%, ${lightness}%)`;   // Past trains ? red spectrum
               } else {                   
                   cell.style.backgroundColor = `hsl(120, 70%, ${lightness}%)`; // Future trains ? green spectrum
               }
           } else {
               cell.style.backgroundColor = "";
           }

           // Show only the trains for last 1 hour & next 2 hours if the page is opened on a Mobile/Watch.
           if ( !(deviceType == "Desktop") && ( train.isActive  ||(diffMinutes >= -60 && diffMinutes <= 120)) ) {
           		row.appendChild(cell);
           }
           if ( (deviceType == "Desktop")) {
              row.appendChild(cell);	
           }
       });
       tableSchedule.appendChild(row);       
       if (scrollIntoView ) {
           tableSchedule.scrollIntoView({ behavior: "smooth", block: "start" });  // Scroll to table
       }
       
}

function calculateDistanceInKM(lat1, lon1, lat2, lon2) {
    // Haversine formula to calculate distance between two coordinates in km
     const R = 6371; // Radius of the Earth in KM
     const dLat = (lat2 - lat1) * Math.PI / 180;
     const dLon = (lon2 - lon1) * Math.PI / 180;
     const a =
         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
         Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
         Math.sin(dLon / 2) * Math.sin(dLon / 2);
     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     return R * c;
}

function findTrainDurationInMins(vehiclePosition ) {
	   //There is a loop before the southern most station(near [2.452145476705575, 102.19320532886256], which is SOUTH of the station.
	   //This function does not work for trains in that loop.
    let nearestNorthStation = null;
    let nearestSouthStation = null;

    for (const stationName in KTMStations) {           	         	
        const station = KTMStations[stationName];
        const distance = calculateDistanceInKM(vehiclePosition[0], vehiclePosition[1], station.location[0], station.location[1]);

        if (station.location[0] > vehiclePosition[0]) {                   // North station
            if (!nearestNorthStation || distance < nearestNorthStation.distance) {
                nearestNorthStation = { name: stationName, ...station, distance };
                nearestNorthStation.tripDurationInMins = Math.abs(nearestNorthStation.tripDurationInMins - KTMStations[baseStationParam].tripDurationInMins);

            }
        } else if (station.location[0] < vehiclePosition[0]) {            // South station
            if (!nearestSouthStation || distance < nearestSouthStation.distance) {
                nearestSouthStation = { name: stationName, ...station, distance };
                nearestSouthStation.tripDurationInMins = Math.abs(nearestSouthStation.tripDurationInMins - KTMStations[baseStationParam].tripDurationInMins);
            }
        }
    }

    //let nearestStations = "";
    let trainDurationFromBaseStation = 0;
    if ( nearestNorthStation && nearestSouthStation) {
 	      let tripDistanceInKmsBetweenStations     = Math.abs(nearestNorthStation.tripDistanceInKms  - nearestSouthStation.tripDistanceInKms);
         let tripDurationInMinsBetweenStations    = Math.abs(nearestNorthStation.tripDurationInMins - nearestSouthStation.tripDurationInMins);

    	    if (nearestNorthStation.tripDurationInMins < nearestSouthStation.tripDurationInMins) {
    	    	  let tripDurationInMinsBetweenNearestStationAndTrain = (nearestNorthStation.distance / tripDistanceInKmsBetweenStations) * tripDurationInMinsBetweenStations;
    	    	  trainDurationFromBaseStation = (nearestNorthStation.tripDurationInMins + tripDurationInMinsBetweenNearestStationAndTrain).toFixed(0) ;       	 	
    	    	 // nearestStations += `Approx ${trainDurationFromBaseStation} Mins away, between `;           	 	
    	    	 // nearestStations += (nearestNorthStation ? `${nearestNorthStation.name} (${nearestNorthStation.tripDurationInMins} mins away)` : "no northern station")  + " & "
            // nearestStations += (nearestSouthStation ? `${nearestSouthStation.name} (${nearestSouthStation.tripDurationInMins} mins away)` : "no southern station");
    	    }else {
        	  let tripDurationInMinsBetweenNearestStationAndTrain = (nearestSouthStation.distance / tripDistanceInKmsBetweenStations) * tripDurationInMinsBetweenStations;           	 	
        	  trainDurationFromBaseStation = (nearestSouthStation.tripDurationInMins + tripDurationInMinsBetweenNearestStationAndTrain).toFixed(0) ;       	 	
        	 // nearestStations += `Approx ${trainDurationFromBaseStation} Mins away, between `;
    	       // nearestStations += (nearestSouthStation ? `${nearestSouthStation.name} (${nearestSouthStation.tripDurationInMins} mins away)` : "no southern station") + " & "
    	       // nearestStations += (nearestNorthStation ? `${nearestNorthStation.name} (${nearestNorthStation.tripDurationInMins} mins away)` : "no northern station");
    	    }           	
    }  else  {
    	      console.log(`Cannot find EITHER nearest north (${nearestNorthStation.name}) or south(${nearestSouthStation.name}) station for ${location}`)
    }

    return trainDurationFromBaseStation;
}

function speakDistance(distance) {
    // Check if the browser supports speech synthesis
    if ('speechSynthesis' in window) {
    	   const message = new SpeechSynthesisUtterance(`Train is ${distance} minutes away.`);
        message.lang = 'en-US';  // Set language
        message.rate = 1;        // Adjust speed if needed (0.5 - 2)
        message.pitch = 1;       // Adjust pitch if needed (0 - 2)
        window.speechSynthesis.speak(message);                // Speak the message
    } else {
        console.log("Speech synthesis not supported in this browser.");
    }
}


const COUNTDOWN_SECONDS = 60;
let countdown = COUNTDOWN_SECONDS;

let { filterParam, focusVehicleIdParam, baseStationParam, hideStationNameParam } = initializePageParameters();
initializeAllFilterLinks();
const map = initializeMap(baseStationParam);
initializeBaseStationDropdown(baseStationParam);
initializeHideStationNameToggle();

 if( focusVehicleIdParam == 0 ) // Plot when not in Focus Mode.
    plotStationsOnMap(focusVehicleIdParam);

let displayScheduleFlag = false;
const deviceType = findDeviceTypeBeingUsed();

fetchMtrecTrainPositionApiData(); // <== Main Function to fetch data & Plot

setInterval(() => {
    countdown -= 1;
    const button = document.getElementById("countdownButton");
    button.textContent = `Refresh in ${countdown}s`;
    if (countdown <= 0) {
          fetchMtrecTrainPositionApiData();
    }
}, 1000);

//if (deviceType === "Desktop" ) toggleStationScheduleTableVisibility();