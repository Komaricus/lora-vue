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
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts'
  import config from "../config";

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