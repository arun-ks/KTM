# KTM
Exploratory code to keep track of KTM Komuter trains. You can get the [live version here](https://arun-ks.github.io/KTM/)

## Purpose
This uses the [KTM schedule](https://www.ktmb.com.my/TrainTime.html) and uses the wonderful APIs provided by [MTREC](https://www.mtrec.name.my/api.html) to show train locations.

The current version used hardcoded values for KTM Serdang & MidValley Stations, and deals with trains for "Batu Caves - Pulau Sebang" route during weekdays.
Yes, hardcoding is not good, but this is one way of customizing it in a form which will be useful.

Each active train is marked to show its direction (northbound or southbound) and show distance from KTM Serdang of KTM MidValley station (based on the direction).


## Also
The page was inspired by [https://go.navig.me/my/ktmb](https://go.navig.me/my/ktmb) which is great, but is too generic to be of any use.

It uses Leaflet for interactive maps & jQuery for handling API requests.
