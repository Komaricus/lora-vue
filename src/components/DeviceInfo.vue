<template>
  <div v-if="device.hasOwnProperty('id') && $store.getters.getLeftMenu" class="content">
    <div class="title">
      <h2 v-if="device.hasOwnProperty('link')">Selected: Link {{device.label}}</h2>
      <h2 v-else>Selected: {{device.label}}</h2>
      <p v-if="!device.hasOwnProperty('link')"><span class="bold">ID: </span>{{device.id}}</p>
    </div>
    <el-collapse v-model="activeNames" style="color: #2c3e50">
      <el-collapse-item name="1">
        <template slot="title">
          <p class="bold">Ports</p>
        </template>
        <el-table
            v-if="device.ports.length"
            :data="device.ports"
            stripe
            border
            style="width: 100%; color: #2c3e50">
          <el-table-column
              prop="hw_addr"
              label="HWADDR (MAC)">
          </el-table-column>
          <el-table-column
              prop="name"
              label="Name">
          </el-table-column>
          <el-table-column
              prop="port_no"
              label="Port №">
          </el-table-column>
        </el-table>
        <p v-else>No ports specified</p>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <p class="bold">Links</p>
        </template>
        <el-table
            v-if="device.links.length"
            class="devices-table"
            :data="device.links"
            stripe
            border
            highlight-current-row
            @current-change="handleCurrentChange"
            style="width: 100%; color: #2c3e50">
          <el-table-column
              prop="label"
              label="Device name">
          </el-table-column>
          <el-table-column
              prop="id"
              label="Device ID"
              width="150">
          </el-table-column>
          <el-table-column
              v-if="!device.hasOwnProperty('link')"
              prop="srcPort"
              label="Source port"
              width="100">
          </el-table-column>
          <el-table-column
              v-if="!device.hasOwnProperty('link')"
              prop="dstPort"
              label="Dest. port"
              width="100">
          </el-table-column>
        </el-table>
        <p v-else>No links specified</p>
      </el-collapse-item>
      <el-collapse-item name="3" v-if="!device.hasOwnProperty('link')">
        <template slot="title">
          <p class="bold">Charts</p>
        </template>
        <el-tabs type="border-card">
          <el-tab-pane label="Battery">
            <battery-chart :device="device"/>
          </el-tab-pane>
          <el-tab-pane label="Load">
            <load-chart :device="device"/>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item name="4" v-if="!device.hasOwnProperty('link')">
        <template slot="title">
          <p class="bold">Ping</p>
        </template>
        <p>Type device name below. Example: <span class="bold">s1 - for Device 1</span></p>
        <div style="color: #2c3e50; display: flex; padding: 10px 0">
          <span style="font-size: 14px; padding-top: 8px">ping s{{ dpidToInt(device.id)}}</span>
          <el-input placeholder="Type here..." v-model="ping" style="padding: 0 10px"/>
          <el-button :disabled="!ping || loading" type="primary" @click="doPing" style="max-width: 100%">Ping
          </el-button>
        </div>
        <div class="ping-output" :class="{ show: output.length || loading }">
          <div v-if="loading" style="margin: 20px auto; text-align: center">
            <i class="el-icon-loading"></i>
            <br>
            <span>Loading...</span>
          </div>
          <div v-else v-html="output"/>
        </div>

      </el-collapse-item>
      <el-collapse-item name="5">
        <template slot="title">
          <p class="bold">Settings</p>
        </template>
        <el-button type="danger" @click="open" icon="el-icon-delete">
          Delete
        </el-button>
      </el-collapse-item>
    </el-collapse>
  </div>
  <div v-else-if="$store.getters.getLeftMenu" class="content">
    <h2>Nothing is selected</h2>
    <p>Click on device to watch it's info</p>

    <h2 style="margin-top: 30px">Available devices:</h2>
    <p v-if="!$parent.nodes.length">Nothing is available</p>
    <el-table
        v-else
        class="devices-table"
        :data="$parent.nodes"
        stripe
        border
        highlight-current-row
        @current-change="handleCurrentChange"
        style="width: 100%; color: #2c3e50">
      <el-table-column
          prop="label"
          label="Device name">
      </el-table-column>
      <el-table-column
          prop="id"
          label="Device ID">
      </el-table-column>
    </el-table>
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
        activeNames: ['1', '2', '3', '4', '5']
      }
    },
    created() {
      if (!localStorage.getItem('activeNames')) {
        localStorage.setItem('activeNames', JSON.stringify(this.activeNames));
      } else {
        this.activeNames = JSON.parse(localStorage.getItem('activeNames'));
      }
    },
    watch: {
      device() {
        this.ping = '';
        this.loading = false;
        this.output = '';
      },
      activeNames() {
        localStorage.setItem('activeNames', JSON.stringify(this.activeNames));
      }
    },
    methods: {
      open() {
        const isDevice = this.device.link === undefined;
        this.$confirm(`Are you sure you want to delete ${isDevice ? this.device.label : 'Link ' + this.device.label}?`,
          'Delete warning', {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
          this.$emit('delete-clicked');
        }).catch(() => {
          this.$store.commit('notify', {
            title: 'Delete canceled',
            type: 'info',
            position: 'bottom-right',
            duration: 2000
          });
        });
      },
      handleCurrentChange(val) {
        if (val !== null) this.$emit('device-selected', val);
      },
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      async doPing() {
        this.loading = true;
        await axios.post(`${config.api}/nodes/s${this.dpidToInt(this.device.id)}/cmd`, 'ping ' + this.ping, {
            headers: {'Content-Type': 'text/plain'}
          })
          .then(response => {
            this.output = response.data.replace('data.', `data.<br>`).split('ms').join(`ms<br>`).replace('---', `<br>---`).replace('statistics ---', `statistics ---<br>`);
            this.$store.commit('notify', {
              title: 'Command completed',
              type: 'success',
              position: 'bottom-right',
              duration: 2000
            });
          })
          .catch(error => {
            console.error(error);
            this.$store.commit('notify', {
              title: 'Error',
              message: 'Something went wrong',
              type: 'error',
              position: 'bottom-right',
              duration: 2000
            });
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false;
            }, 100)
          });
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/styles/colors";

  .title {
    padding-bottom: 10px;
  }

  .ping-output {
    display: none;
    max-width: 600px;
    white-space: normal;
    background-color: $primary;
    color: white;
    padding: 10px;
    font-size: 16px;
  }

  .show {
    display: block;
  }
</style>