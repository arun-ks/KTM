# KTM
This website shows online status of trains in [KTM Seremban Line(KTM Batu Caves - Pulau Sebang/Tampin)](https://en.wikipedia.org/wiki/Batu_Caves%E2%80%93Pulau_Sebang_Line) and for [KTM Port Klang Line(Tanjung Malim - Port Klang)](https://en.wikipedia.org/wiki/Tanjung_Malim-Port_Klang_Line).

It shows distance of stations & trains as "Minutes of train travel" instead of KMs.

You can get the [live version here for Seremban Line](https://arun-ks.github.io/KTM/) and [this for Port Klang Line](https://arun-ks.github.io/KTM/index_PortKlang.html).

## Purpose
Users of 2 KTM Lines can use this to plan their trip to KTM stations based on realitime status of trains.

The page allows user to pick their **base-station**. If you bookmark the link with URL which includes baseStation parameter, you won't have to select it every time.

## Usage
Each active train is marked to show its direction (northbound or southbound) and show distance from the base-station.

Each **station** is marked as minutes of train travel from the base-station.

- To filter trains based on their direction - Click on up, down or both. Using links on top of the page.
- Click on station markers to see details/links about it

### Focus Mode
Click on label for a train number to focus on 1 train. 

This will show more details about the train & it position. If the train is active, the page will give audio updates on the train's distance.

## Caveats
The page is as reliable as the data provided by MTREC APIs.There are often times when trains status are not reported at all.

If more people use this, maybe MTREC/KTM will ensure data accuracy & consistency.

## Credits
This uses 
- [GTFS Static data from data.gov.my](https://developer.data.gov.my/realtime-api/gtfs-static) for train schedule.
- [GTFS Realtime data](https://documenter.getpostman.com/view/40279048/2sAYBd67bZ) provided by [MTREC](https://www.mtrec.name.my/api.html) to show realtime train locations. These are updated after every 60 seconds.
- [Leaflet](https://leafletjs.com/) for interactive maps & jQuery for handling API requests.
- [KTM Komuter](https://www.ktmb.com.my/Komuter.html) is used to check periodically for updates 


The page was inspired by [https://go.navig.me/my/ktmb](https://go.navig.me/my/ktmb) which is very comprehensive, and thus too generic to be of any use. Hence, the need for this tool.

I used [chatGPT](https://chatgpt.com) extensively to assist with initial versions, which was cleaned up, refactored(multiple times), rewritten & enhanced thereafter.
