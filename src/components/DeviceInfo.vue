<template>
  <div v-if="device.hasOwnProperty('id') && $store.getters.getLeftMenu" class="content">
    <h2>Selected: {{device.label}}</h2>
    <p v-if="!device.hasOwnProperty('link')"><span class="bold">ID: </span>{{device.id}}</p>
    <p class="bold">Ports:</p>
    <table v-if="device.ports.length">
      <tr>
        <th>HWADDR (MAC)</th>
        <th>Name</th>
        <th>Port №</th>
      </tr>
      <tr v-for="(port, index) in device.ports" :key="index">
        <td>{{port.hw_addr}}</td>
        <td>{{port.name}}</td>
        <td>{{port.port_no}}</td>
      </tr>
    </table>
    <p v-else>No ports specified</p>
    <p class="bold">Links:</p>
    <table v-if="device.links.length" class="devices-table">
      <tr>
        <th>Device name</th>
        <th>Device ID</th>
        <th v-if="!device.hasOwnProperty('link')">Source port</th>
        <th v-if="!device.hasOwnProperty('link')">Dest. port</th>
      </tr>
      <tr v-for="(linkDevice, index) in device.links" :key="index" @click="$emit('device-selected', linkDevice)">
        <td>{{linkDevice.label}}</td>
        <td>{{linkDevice.id}}</td>
        <td v-if="!device.hasOwnProperty('link')">{{linkDevice.srcPort}}</td>
        <td v-if="!device.hasOwnProperty('link')">{{linkDevice.dstPort}}</td>
      </tr>
    </table>
    <p v-else>No links specified</p>
    <div class="charts" v-if="!device.hasOwnProperty('link')">
      <p class="bold">Charts</p>
      <!--      make toggle -->
      <button class="text" @click="chartType = 'battery'" :class="{active: chartType === 'battery'}">
        Battery
      </button>
      <button class="text" @click="chartType = 'load'" :class="{active: chartType === 'load'}">
        Load
      </button>
      <battery-chart v-if="!device.hasOwnProperty('link') && chartType === 'battery'" :device="device"
                     style="margin: 10px 0"/>
      <load-chart v-if="!device.hasOwnProperty('link') && chartType === 'load'" :device="device"
                  style="margin: 10px 0"/>
    </div>
    <div v-if="!device.hasOwnProperty('link')" class="ping">
      <p class="bold">Ping:</p>
      <p>Type device name below. Example: <span class="bold">s1 - for Device 1</span></p>
      <div style="width: 100%">
        <label>
          ping s{{ dpidToInt(device.id) }}
          <input class="ping-input" type="text" v-model="ping">
        </label>
        <button @click="doPing" style="margin-left: 20px">
          Ping
        </button>
      </div>

      <div class="ping-output">
        <div v-if="loading" style="margin: 20px auto; text-align: center">
          <span class="mdi mdi-loading mdi-spin" style="color: #42b983;"/>
        </div>
        <div v-else v-html="output"/>
      </div>
    </div>

    <button class="delete-button" @click="$emit('delete-clicked')">
      Delete
    </button>
  </div>
  <div v-else-if="$store.getters.getLeftMenu" class="content">
    <h2>Nothing is selected</h2>
    <p>Click on device to watch it's info</p>

    <h2 style="margin-top: 30px">Available devices:</h2>
    <table class="devices-table">
      <tr>
        <th>Device name</th>
        <th>Device ID</th>
      </tr>
      <tr v-for="item in $parent.nodes" :key="item.id" @click="$emit('device-selected', item)">
        <td>{{item.label}}</td>
        <td>{{item.id}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
  import axios from "axios"
  import config from "@/config"
  import BatteryChart from "./BatteryChart";
  import LoadChart from "./LoadChart";

  export default {
    name: "device-info",
    props: {
      device: {
        type: Object
      }
    },
    components: {
      "battery-chart": BatteryChart,
      "load-chart": LoadChart
    },
    data() {
      return {
        ping: '',
        loading: false,
        output: '',
        chartType: ''
      }
    },
    watch: {
      device() {
        this.ping = '';
        this.loading = false;
        this.output = '';
        this.chartType = '';
      }
    },
    methods: {
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      async doPing() {
        this.loading = true;
        await axios.post(`${config.api}/nodes/s${+this.device.id}/cmd`, 'ping ' + this.ping, {
            headers: {'Content-Type': 'text/plain'}
          })
          .then(response => {
            this.output = response.data.replace('data.', `data.<br>`).split('ms').join(`ms<br>`).replace('---', `<br>---`).replace('statistics ---', `statistics ---<br>`);
          })
          .catch(error => {
            console.error(error)
          })
          .finally(() => {
            this.loading = false;
          });
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/styles/colors";

  table {
    color: $primary;
    margin: 10px 0;
    border-collapse: collapse;
    width: 100%;

    th, td {
      border: 1px $secondary solid;
      padding: 5px;
    }

    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
  }

  table.devices-table {
    tr:not(:first-child) {
      cursor: pointer;
    }

    tr:not(:first-child):hover {
      background-color: $light-lime;
    }
  }

  .delete-button {
    color: $danger;
    border: 2px solid $danger;
    margin-top: 20px;
  }

  .delete-button:hover {
    color: white;
    background-color: $danger;
  }

  .ping {
    margin: 10px 0;
  }

  .ping-input {
    margin-top: 10px;
    font-size: 16px;
    border: 1px solid $lime;
    border-radius: 5px;
    padding: 2px;
    width: 300px;
  }

  .ping-output {
    max-width: 600px;
    white-space: normal;
  }

  .charts {
    margin: 10px 0;
  }

  .active {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom: 2px solid $lime;
  }
</style>