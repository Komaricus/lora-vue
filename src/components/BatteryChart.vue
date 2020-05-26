<template>
  <div id="batteryChart">
    <el-switch
        v-model="realtime"
        active-color="#42b983"
        inactive-color="#ff4949"
        active-text="Realtime"
        style="padding-bottom: 10px">
    </el-switch>
    <apexchart ref="batteryChart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>

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
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts'
  import config from "../config";
  import axios from "axios";

  export default {
    name: "BatteryChart",
    components: {
      apexchart: VueApexCharts
    },
    props: {
      device: {
        type: Object
      },
      status: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        realtime: true,
        chargeLogDialog: false,
        charges: [],
        totalCharges: 100,
        currentPage: 1,
        series: [{
          name: "Battery charge %",
          data: []
        }],
        chartOptions: {
          chart: {
            height: 350,
            type: 'line',
            animations: {
              enabled: true,
              easing: 'linear',
              dynamicAnimation: {
                speed: 1000
              }
            },
            zoom: {
              enabled: false
            },
            toolbar: {
              show: false
            }
          },
          colors: ['#42b983'],
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth'
          },
          title: {
            text: '',
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5
            },
          },
          xaxis: {
            categories: []
          },
          yaxis: {
            max: 100,
            min: 0
          },
          legend: {
            show: false
          },
        },
      }
    },
    methods: {
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
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
      setRealtimeData() {
        if (this.$refs.batteryChart === undefined) return;

        this.$refs.batteryChart.updateOptions({
            title: {
              text: 'Battery trend for ' + this.device.label
            },
            xaxis: {
              categories: this.device.charges.range.slice(Math.max(this.device.charges.range.length - config.BATTERY_CHART_REALTIME_MAX_ITEMS, 0))
            }
          }
        );

        this.$refs.batteryChart.updateSeries([{
          data: this.device.charges.data.slice(Math.max(this.device.charges.data.length - config.BATTERY_CHART_REALTIME_MAX_ITEMS, 0))
        }]);

        setInterval(() => {
          if (this.$refs.batteryChart === undefined || !this.realtime || !this.status) return;
          this.$refs.batteryChart.updateOptions({
              xaxis: {
                categories: this.device.charges.range.slice(Math.max(this.device.charges.range.length - config.BATTERY_CHART_REALTIME_MAX_ITEMS, 0))
              }
            }
          );
          this.$refs.batteryChart.updateSeries([{
            data: this.device.charges.data.slice(Math.max(this.device.charges.data.length - config.BATTERY_CHART_REALTIME_MAX_ITEMS, 0))
          }]);
        }, config.BATTERY_CHART_UPDATE_TIMEOUT);
      },
      setAllData() {
        if (this.$refs.batteryChart === undefined) return;

        this.$refs.batteryChart.updateOptions({
            title: {
              text: 'Battery trend for ' + this.device.label
            },
            xaxis: {
              categories: this.device.charges.range
            }
          }
        );

        this.$refs.batteryChart.updateSeries([{
          data: this.device.charges.data
        }]);
      }
    },
    mounted() {
      if (this.realtime) {
        this.setRealtimeData();
      } else {
        this.setAllData();
      }
    },
    watch: {
      device() {
        if (this.realtime) {
          this.setRealtimeData();
        } else {
          this.setAllData();
        }
      },
      realtime() {
        if (this.realtime) {
          this.$refs.batteryChart.updateOptions({
            chart: {
              zoom: {
                enabled: false
              },
              toolbar: {
                show: false
              }
            }
          });

          this.setRealtimeData();
        } else {
          this.$refs.batteryChart.updateOptions({
            chart: {
              zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
              },
              toolbar: {
                show: true,
                autoSelected: 'zoom'
              }
            }
          });

          this.setAllData();
        }
      }
    }
  }
</script>

<style scoped>

</style>