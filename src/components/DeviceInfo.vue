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
    <div v-if="!device.hasOwnProperty('link')" class="ping">
      <p class="bold">Ping:</p>
      <p>Type device name below. Example: <span class="bold">s1 - for Device 1</span></p>
      <div style="width: 100%">
        <label>
          ping s{{+device.id}}
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
      <button class="delete-button" @click="$emit('delete-clicked')">
        Delete
      </button>
    </div>
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

  export default {
    name: "device-info",
    props: {
      device: {
        type: Object
      }
    },
    data() {
      return {
        ping: '',
        loading: false,
        output: ''
      }
    },
    watch: {
      device() {
        this.ping = '';
        this.loading = false;
        this.output = '';
      }
    },
    methods: {
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
</style>