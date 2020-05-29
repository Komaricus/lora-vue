# lora-vue
<p align="center">
  <img alt="Lora-vue Logo" width="460" height="300" src="/src/assets/main-logo.svg">
</p>
## About

This application shows Lora-network emulation in real time. 
It allows you to easily build and run your own topologies. 
Some monitoring features also available such as: charts, devices charge level and devices terminals.
Application available in https://lora-vue.herokuapp.com/

## Run locally

This is frontend repository, so you need server application contained Ryu and Mininet for makes this works.

1) First of all, you need to pull server repository: https://github.com/uncleDecart/sdn_iot.

2) After that, run it following instructions in repository.

3) Pull this repository and install dependencies:
```
npm install
```
4) Run application locally:
```
npm run serve
```

## How to use it
Please visit about page in application or wiki page of this repository to learn the basics of using Lora-vue application.

## Configuration

You can change application configuration in configuration file located in /src/config.ts.

This file contains several constants, that is used for running application.

### API URL`s
* ```back``` - specifies Ryu REST API connection URL, used for making requests to Ryu controller.
* ```api``` - specifies Mininet Bootle WSGI server URL, used for changing topology.

### Battery chart settings
* ```BATTERY_CHART_UPDATE_TIMEOUT``` - time in milliseconds, timeout of devices charge chart update in realtime mode.
* ```BATTERY_CHART_REALTIME_MAX_ITEMS``` - how many items can be rendered in realtime mode for devices charge chart.
* ```BATTERY_CHART_MAX_ITEMS``` - amount of battery chart items that will be saved in cache for non-realtime mode.

### Events chart settings
* ```EVENTS_CHART_UPDATE_TIMEOUT``` - time in milliseconds, timeout of events chart update in realtime mode.
* ```EVENTS_CHART_REALTIME_MAX_ITEMS``` - how many items can be rendered in realtime mode for events chart.
* ```EVENTS_CHART_MAX_ITEMS``` - amount of events chart items that will be saved in cache for non-realtime mode.

### Packets statistic chart settings
* ```STATS_CHART_UPDATE_TIMEOUT``` - time in milliseconds, timeout of packets statistic chart update in realtime mode.
* ```STATS_CHART_MAX_ITEMS``` - how many items can be rendered in realtime mode for packets statistic chart.
* ```STATS_CHART_REALTIME_MAX_ITEMS``` - amount of packets statistic chart items that will be saved in cache for non-realtime mode.

### Topology
* ```TOPOLOGY_EDGES_LENGTH``` - specifies edges length in pixels for topology rendering.

### Notification
* ```NOTIFICATION_DURATION``` - duration of all notifications at bottom-right of topology view.

Some of constants only cosmetic and can be easily changed, but some of them, such as charts update timeouts, can reduce performance. 
Anyway feel free to experiment with default config.