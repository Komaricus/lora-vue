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
  export default {
    name: "device-info",
    props: {
      device: {
        type: Object
      }
    },
    data() {
      return {}
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
  }

  .delete-button:hover {
    color: white;
    background-color: $danger;
  }
</style>