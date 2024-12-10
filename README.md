# KTM
Exploratory code to keep track of KTM Komuter trains. You can get the [live version here](https://arun-ks.github.io/KTM/)

## Purpose
The current version used hardcoded values for **KTM Serdang** & **MidValley** Stations, and deals with trains for "Batu Caves - Pulau Sebang" route.
The current version uses hardcoding, to to check how useful this is for a specific use case, without making the took bulky.

## Usage
Each active train is marked to show its direction (northbound or southbound) and show distance from KTM Serdang of KTM MidValley station (based on the direction).

You can use URL parameter **filter** :
- Use "?filter=up" to see only trains from [Serdang to Midvalley](https://arun-ks.github.io/KTM/?filter=up)
- Use "?filter=down" to see trains from [MidValley to Serdang](https://arun-ks.github.io/KTM/?filter=down)
- Use "?filter=all" to see [all active KTM trains](https://arun-ks.github.io/KTM/?filter=all)

Any other value of filter, or even no value for it will [show trains in Serdang to Midvalley or from Midvalley to Serdang route](https://arun-ks.github.io/KTM/)

You can use URL Parameter **focusVehicleId** to see data for 1 selected train
- Use "?focusVehicleId=2059" to see location of specific [train#2059](https://arun-ks.github.io/KTM/?focusVehicleId=2059)

The icons for trains are coloured as per the colour of the starting station. If the trains are not part of "Batu Caves - Pulau Sebang" route, then they have a separate colour.


## Credits
This uses the [KTM schedule](https://www.ktmb.com.my/TrainTime.html) and uses the wonderful APIs provided by [MTREC](https://www.mtrec.name.my/api.html) to show train locations.

The page was inspired by [https://go.navig.me/my/ktmb](https://go.navig.me/my/ktmb) which is great, but is too generic to be of any use. Hence, the need for this tool.

It uses Leaflet for interactive maps & jQuery for handling API requests. 

The initial code was co-created with [chatGPT](https://chatgpt.com), but it was cleaned up, refactored, rewritten & enhanced thereafter.
