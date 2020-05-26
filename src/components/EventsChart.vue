<template>
  <div id="eventsChart">
    <el-switch
        v-model="realtime"
        active-color="#42b983"
        inactive-color="#ff4949"
        active-text="Realtime"
        style="padding-bottom: 10px">
    </el-switch>
    <apexchart ref="eventsChart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>

    <el-button type="primary" @click="openEventsLogDialog">Events Log</el-button>

    <el-dialog :title="`${this.device.label} Events Log`" :visible.sync="eventsLogDialog">
      <el-table :data="events">
        <el-table-column property="from_mac" label="From MAC"></el-table-column>
        <el-table-column property="from_port" label="From Port"></el-table-column>
        <el-table-column property="to_mac" label="To MAC"></el-table-column>
        <el-table-column property="to_port" label="To Port"></el-table-column>
        <el-table-column property="ts" label="Datetime"></el-table-column>
      </el-table>
      <el-row type="flex" justify="center" style="margin-top: 20px">
        <el-pagination
            background
            layout="prev, pager, next"
            :total="totalEvents"
            @current-change="loadEvents"
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
    name: "LoadChart",
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
        eventsLogDialog: false,
        events: [],
        totalEvents: 100,
        currentPage: 1,
        series: [{
          name: "Events count",
          data: []
        }],
        chartOptions: {
          chart: {
            type: 'line',
            height: 350,
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
          stroke: {
            curve: 'stepline',
          },
          dataLabels: {
            enabled: false
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
          markers: {
            hover: {
              sizeOffset: 4
            }
          },
          xaxis: {
            categories: [],
          },
          yaxis: {
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
      async loadEvents(page) {
        await axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}`, {
            params: {
              perpage: 10,
              page: page - 1
            }
          })
          .then(({data}) => {
            this.events = data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      async openEventsLogDialog() {
        this.currentPage = 1;
        this.eventsLogDialog = true;

        const total = axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}/total`);
        const events = axios.get(`${config.api}/events/${this.dpidToInt(this.device.id)}`, {
          params: {
            perpage: 10,
            page: 0
          }
        });

        await axios.all([total, events])
          .then(responses => {
            this.totalEvents = responses[0].data[0].total;
            this.events = responses[1].data;
          })
          .catch(error => {
            console.error(error);
          });

      },
      setRealtimeData() {
        if (this.$refs.eventsChart === undefined) return;

        this.$refs.eventsChart.updateOptions({
            title: {
              text: 'Events count for ' + this.device.label
            },
            xaxis: {
              categories: this.device.events.range.slice(Math.max(this.device.events.range.length - config.EVENTS_CHART_REALTIME_MAX_ITEMS, 0))
            }
          }
        );

        this.$refs.eventsChart.updateSeries([{
          data: this.device.events.data.slice(Math.max(this.device.events.data.length - config.EVENTS_CHART_REALTIME_MAX_ITEMS, 0))
        }]);

        setInterval(() => {
          if (this.$refs.eventsChart === undefined || !this.realtime || !this.status) return;
          this.$refs.eventsChart.updateOptions({
              xaxis: {
                categories: this.device.events.range.slice(Math.max(this.device.events.range.length - config.EVENTS_CHART_REALTIME_MAX_ITEMS, 0))
              }
            }
          );
          this.$refs.eventsChart.updateSeries([{
            data: this.device.events.data.slice(Math.max(this.device.events.data.length - config.EVENTS_CHART_REALTIME_MAX_ITEMS, 0))
          }]);
        }, 1000);
      },
      setAllData() {
        if (this.$refs.eventsChart === undefined) return;

        this.$refs.eventsChart.updateOptions({
            title: {
              text: 'Events count for ' + this.device.label
            },
            xaxis: {
              categories: this.device.events.range
            }
          }
        );

        this.$refs.eventsChart.updateSeries([{
          data: this.device.events.data
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
          this.$refs.eventsChart.updateOptions({
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
          this.$refs.eventsChart.updateOptions({
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