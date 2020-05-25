<template>
  <div v-if="device.hasOwnProperty('id') && $store.getters.getLeftMenu" class="content">
    <div class="title">
      <h2 v-if="device.hasOwnProperty('link')">Selected: Link {{device.label}}</h2>
      <h2 v-else>Selected: {{device.label}}</h2>
      <p v-if="!device.hasOwnProperty('link')"><span class="bold">ID: </span>{{device.id}}</p>
    </div>
    <el-collapse v-model="activeNames" style="color: #2c3e50">
      <el-collapse-item name="0" v-if="device.hasOwnProperty('host')">
        <template slot="title">
          <p class="bold">Info</p>
        </template>
        <p><span class="bold">MAC:</span> {{ device.mac }}</p>
        <p><span class="bold">IPv4:</span> {{ device.ipv4.join(', ') }}</p>
        <p><span class="bold">IPv6:</span> {{ device.ipv6.join(', ') }}</p>
      </el-collapse-item>
      <el-collapse-item name="1" v-if="!device.hasOwnProperty('host')">
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
      <el-collapse-item name="2" v-if="!device.hasOwnProperty('host')">
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
      <el-collapse-item name="3" v-if="!device.hasOwnProperty('link') && !device.hasOwnProperty('host')">
        <template slot="title">
          <p class="bold">Charts</p>
        </template>
        <el-tabs type="border-card">
          <el-tab-pane label="Battery">
            <battery-chart :device="device"/>
            <el-button type="primary" @click="openChargeLogDialog">Charge Log</el-button>

            <el-dialog :title="`${this.device.label} Charge Log`" :visible.sync="chargeLogDialog">
              <el-table :data="charges">
                <el-table-column property="id" label="Log ID"></el-table-column>
                <el-table-column property="dpid" label="Device ID"></el-table-column>
                <el-table-column property="charge" label="Charge"></el-table-column>
                <el-table-column property="ts" label="Datetime"></el-table-column>
              </el-table>
              <el-row type="flex" justify="center" style="margin-top: 20px">
                <el-pagination
                    background
                    layout="prev, pager, next"
                    :total="totalCharges"
                    @current-change="loadCharges"
                    :current-page.sync="currentPage">
                </el-pagination>
              </el-row>
            </el-dialog>
          </el-tab-pane>
          <el-tab-pane label="Events">
            <events-chart :device="device"/>
          </el-tab-pane>
          <el-tab-pane label="Packets">
            <stats-chart :device="device"/>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item name="4" v-if="!device.hasOwnProperty('link')">
        <template slot="title">
          <p class="bold">Terminal</p>
        </template>
        <div id="terminal" class="terminal-output">
          <div v-html="output"></div>
          <div v-if="loading" class="loading">
            <i class="el-icon-loading"></i>
            <br>
            <span>Loading...</span>
          </div>
          <label style="color: #42b983">
            &gt;
            <input v-model="command" v-on:keyup.enter="runCommand" class="terminal-input"/>
          </label>
        </div>

      </el-collapse-item>
      <el-collapse-item name="5" v-if="!device.hasOwnProperty('host')">
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
  import EventsChart from "./EventsChart";
  import StatsChart from "./StatsChart";

  export default {
    name: "device-info",
    props: {
      device: {
        type: Object
      }
    },
    components: {
      "battery-chart": BatteryChart,
      "events-chart": EventsChart,
      "stats-chart": StatsChart
    },
    data() {
      return {
        command: '',
        loading: false,
        output: '',
        activeNames: ['1', '2', '3', '4', '5'],
        chargeLogDialog: false,
        charges: [],
        totalCharges: 100,
        currentPage: 1
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
        this.command = '';
        this.loading = false;
        this.output = '';
      },
      activeNames() {
        localStorage.setItem('activeNames', JSON.stringify(this.activeNames));
      }
    },
    methods: {
      async loadCharges(page) {
        await axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}/charge_events`, {
            params: {
              perpage: 10,
              page: page - 1
            }
          })
          .then(({data}) => {
            this.charges = data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      async openChargeLogDialog() {
        this.currentPage = 1;
        this.chargeLogDialog = true;

        const total = axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}/charge_events/total`);
        const events = axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}/charge_events`, {
          params: {
            perpage: 10,
            page: 0
          }
        });

        await axios.all([total, events])
          .then(responses => {
            this.totalCharges = responses[0].data[0].total;
            this.charges = responses[1].data;
          })
          .catch(error => {
            console.error(error);
          });

      },
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
            duration: config.NOTIFICATION_DURATION
          });
        });
      },
      handleCurrentChange(val) {
        if (val !== null) this.$emit('device-selected', val);
      },
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      scroll() {
        const objDiv = document.getElementById("terminal");
        objDiv.scrollTop = 99999999;
      },
      async runCommand() {
        if (this.loading) return;

        const command = this.command;
        this.command = '';

        this.output += `<span style="color: #42b983;">&gt; ${command}</span>`;
        setTimeout(() => {
          this.scroll();
        }, 20);

        this.loading = true;
        const nodeName = this.device.host ? 'h' + this.dpidToInt(this.device.dpid) : 's' + this.dpidToInt(this.device.id);
        await axios.post(`${config.api}/nodes/${nodeName}/cmd`, command, {
            headers: {'Content-Type': 'text/plain'},
            params: {
              timeout: config.CMD_TIMEOUT
            }
          })
          .then(response => {
            this.output += `<br>${response.data}`;
            this.$store.commit('notify', {
              title: 'Command completed',
              type: 'success',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
          .catch(error => {
            console.error(error);
            this.$store.commit('notify', {
              title: 'Error',
              message: 'Something went wrong',
              type: 'error',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false;
              this.scroll();
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

  .terminal-output {
    display: block;
    max-width: 600px;
    white-space: normal;
    background-color: $primary;
    color: white;
    padding: 10px;
    font-size: 16px;
    height: 400px;
    overflow-y: auto;
  }

  .terminal-input {
    background-color: $primary;
    color: #42b983;
    border: none;
    outline: 0;
    font-size: 16px;
    width: calc(100% - 15.11px);
  }

  .loading {
    margin: 0 auto;
    padding: 20px 0;
    text-align: center;
    background-color: $primary;
    color: white;
  }
</style>