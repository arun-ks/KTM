# KTM
Exploratory code to keep track of KTM Komuter trains for commute. You can get the [live version here](https://arun-ks.github.io/KTM/)

## Purpose
The current version used hardcoded values for **KTM Serdang** & **MidValley** Stations, and deals with trains for "Batu Caves - Pulau Sebang" route.
The current version uses hardcoding, to to check how useful this is for a specific use case, without making the took bulky.

## Usage
Each active train is marked to show its direction (northbound or southbound) and show distance from KTM Serdang of KTM MidValley station (based on the direction).

- Filter trains based on their direction - Click on up, down or both. Using links on top of the page.
- Click on station markers to see details about it
- Click on label for a train number to focus on 1 train. This will show more details about the train & it position. (this is referre to as focus Mode, as in this example for [train#2059](https://arun-ks.github.io/KTM/?focusVehicleId=2059) ).



## Credits
This uses the [KTM schedule](https://www.ktmb.com.my/TrainTime.html) and uses the [wonderful APIs](https://documenter.getpostman.com/view/40279048/2sAYBd67bZ) provided by [MTREC](https://www.mtrec.name.my/api.html) to show train locations.

The page was inspired by [https://go.navig.me/my/ktmb](https://go.navig.me/my/ktmb) which is great, but is too generic to be of any use. Hence, the need for this tool.

It uses Leaflet for interactive maps & jQuery for handling API requests. 

The initial code was co-created with [chatGPT](https://chatgpt.com), but it was cleaned up, refactored, rewritten & enhanced thereafter.
