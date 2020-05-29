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
        <p v-if="device.mac"><span class="bold">MAC:</span> {{ device.mac }}</p>
        <p v-if="device.ipv4"><span class="bold">IPv4:</span> {{ device.ipv4.join(', ') }}</p>
        <p v-if="device.ipv6"><span class="bold">IPv6:</span> {{ device.ipv6.join(', ') }}</p>
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
      <el-collapse-item name="3" v-if="!device.hasOwnProperty('link') && !device.hasOwnProperty('host')">
        <template slot="title">
          <p class="bold">Charts</p>
        </template>
        <el-tabs type="border-card" stretch v-model="tab">
          <el-tab-pane label="Battery">
            <battery-chart v-if="tab === '0'" :device="device" :status="status" :divider="this.charge"/>
          </el-tab-pane>
          <el-tab-pane label="Events">
            <events-chart v-if="tab === '1'" :device="device" :status="status"/>
          </el-tab-pane>
          <el-tab-pane label="Packets">
            <stats-chart v-if="tab === '2'" :device="device" :status="status"/>
          </el-tab-pane>
        </el-tabs>
      </el-collapse-item>
      <el-collapse-item name="4" v-if="!device.hasOwnProperty('link') && status">
        <template slot="title">
          <p class="bold">Terminal</p>
        </template>
        <terminal :fullscreen="false" :device="device"/>
      </el-collapse-item>
      <el-collapse-item name="5" v-if="!device.hasOwnProperty('link') && !device.hasOwnProperty('host') && status">
        <template slot="title">
          <p class="bold">Flow</p>
        </template>
        <div v-if="device.flow.length">
          <el-table
              class="devices-table"
              :data="device.flow"
              stripe
              border
              highlight-current-row
              style="width: 100%; color: #2c3e50"
              @current-change="onFlowClicked">
            <el-table-column
                label="name">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="Src. MAC">
              <template slot-scope="scope">
                <span>{{ scope.row.match.dl_src ? scope.row.match.dl_src : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="Dest. MAC">
              <template slot-scope="scope">
                <span>{{ scope.row.match.dl_dst ? scope.row.match.dl_dst : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="In Port"
                width="70">
              <template slot-scope="scope">
                <span>{{ scope.row.match.in_port ? scope.row.match.in_port : '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column
                label="Options">
              <template slot-scope="scope">
                <el-button
                    size="mini"
                    @click.stop="editFlow(scope.$index, scope.row)">Edit
                </el-button>
                <el-button
                    size="mini"
                    type="danger"
                    @click.stop="deleteFlowDialog(scope.$index, scope.row)">Delete
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-row style="padding-top: 10px">
            <el-button type="primary" size="medium" icon="mdi mdi-plus">Add Flow</el-button>
          </el-row>

          <el-dialog title="Flow description" :visible.sync="flowPreviewDialog" width="400px">
            <el-row v-for="(value, key) in this.selectedFlow" :key="key">
              <el-col :span="12"><span class="preview-title">{{key}}</span></el-col>
              <el-col :span="12"><span class="preview-item">{{value}}</span></el-col>
            </el-row>
          </el-dialog>
        </div>
        <div v-else>
          Getting flow tables...
        </div>
      </el-collapse-item>
      <el-collapse-item name="6">
        <template slot="title">
          <p class="bold">Settings</p>
        </template>
        <el-button type="danger" @click="open" icon="el-icon-delete" :disabled="$store.getters.getLoading || status">
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
    <h2 style="margin-top: 30px">Devices Initial Battery Capacity</h2>
    <div style="margin-top: 15px">
      <el-input-number v-model="charge" :min="0" :step="100"/>
      <span style="margin-left: 8px">mA</span>
      <el-button :disabled="status" type="default" style="margin-left: 15px" @click="setCharge">Set</el-button>
    </div>
  </div>
</template>

<script>
  import axios from "axios"
  import config from "@/config"
  import BatteryChart from "./BatteryChart";
  import EventsChart from "./EventsChart";
  import StatsChart from "./StatsChart";
  import Terminal from "../components/Terminal";

  export default {
    name: "device-info",
    props: {
      device: {
        type: Object
      },
      status: {
        type: Boolean,
        default: false
      }
    },
    components: {
      "battery-chart": BatteryChart,
      "events-chart": EventsChart,
      "stats-chart": StatsChart,
      "terminal": Terminal
    },
    data() {
      return {
        activeNames: ['1', '2', '3', '4', '5'],
        tab: '0',
        charge: 10000,
        selectedFlow: {},
        flowPreviewDialog: false
      }
    },
    async created() {
      if (!localStorage.getItem('activeNames')) {
        localStorage.setItem('activeNames', JSON.stringify(this.activeNames));
      } else {
        this.activeNames = JSON.parse(localStorage.getItem('activeNames'));
      }

      await axios.get(`${config.api}/initial_charge`)
        .then(({data}) => {
          this.charge = data.charge;
        })
        .catch(error => {
          console.error(error)
        });
    },
    watch: {
      activeNames() {
        localStorage.setItem('activeNames', JSON.stringify(this.activeNames));
      }
    },
    methods: {
      async setCharge() {
        await axios.put(`${config.api}/initial_charge`, {
            charge: this.charge
          })
          .then(() => {
            this.$store.commit('notify', {
              title: 'Devices Initial Battery Capacity updated!',
              type: 'success',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
            this.$emit('charge-divider-updated', this.charge)
          })
          .catch(error => {
            console.error(error)
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
      editFlow(index, flow) {
        console.info(index, flow);
      },
      deleteFlowDialog(index, flow) {
        this.$confirm(`Are you sure you want to delete Flow: ${flow.name}?`,
          'Delete warning', {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning'
          }).then(() => {
          this.deleteFlow(index, flow);
        }).catch(() => {
          this.$store.commit('notify', {
            title: 'Delete canceled',
            type: 'info',
            position: 'bottom-right',
            duration: config.NOTIFICATION_DURATION
          });
        });
      },
      onFlowClicked(val) {
        if (val) {
          const flow = Object.assign({}, val);
          for (const key in flow.match) {
            flow[key] = flow.match[key];
          }
          delete flow.match;
          this.selectedFlow = flow;
          this.flowPreviewDialog = true;
        }
      },
      async deleteFlow(index, flow) {
        await axios.post(`${config.back}/stats/flowentry/delete`, {
            dpid: this.dpidToInt(this.device.id),
            cookie: flow.cookie,
            'table_id': flow.table_id,
            priority: flow.priority,
            match: {
              "in_port": flow.match.in_port
            },
            actions: [
              {
                type: flow.actions[0].split(':')[0],
                port: flow.actions[0].split(':')[1] === 'CONTROLLER' ? 'CONTROLLER' : +flow.actions[0].split(':')[1]
              }
            ]
          })
          .then(() => {
            this.device.flow.splice(index, 1);
            this.$store.commit('notify', {
              title: 'Flow deleted',
              type: 'success',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
          .catch(error => {
            console.error(error);
            this.$store.commit('notify', {
              title: 'Something went wrong',
              type: 'error',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
          })
      },
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/styles/colors";

  .title {
    padding-bottom: 10px;
  }

  .preview-title {
    font-size: 16px;
    font-weight: bold;
  }

  .preview-item {
    font-size: 16px;
  }
</style>