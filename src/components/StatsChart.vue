<template>
  <div id="statsChart">
    <el-switch
        v-model="realtime"
        active-color="#42b983"
        inactive-color="#ff4949"
        active-text="Realtime"
        style="padding-bottom: 10px">
    </el-switch>

    <apexchart ref="statsChart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts'
  import config from "../config";

  export default {
    name: "stats-chart",
    props: {
      device: {
        type: Object
      }
    },
    components: {
      apexchart: VueApexCharts
    },
    data() {
      return {
        realtime: true,
        series: [
          {
            name: "",
            data: []
          },
        ],
        chartOptions: {
          chart: {
            height: 400,
            type: 'line',
            dropShadow: {
              enabled: true,
              color: '#000',
              top: 18,
              left: 7,
              blur: 10,
              opacity: 0.2
            },
            toolbar: {
              show: false
            }
          },
          colors: ['#42b983', '#2c3e50', '#77B6EA'],
          dataLabels: {
            enabled: true,
          },
          stroke: {
            curve: 'smooth'
          },
          title: {
            text: '',
            align: 'left'
          },
          grid: {
            borderColor: '#e7e7e7',
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5
            },
          },
          markers: {
            size: 1
          },
          xaxis: {
            categories: [],
            title: {
              text: 'Time'
            }
          },
          yaxis: {
            title: {
              text: 'Packets'
            },
            min: 0,
          },
          legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
          }
        },
      }
    },
    methods: {
      setRealtimeData() {
        if (this.$refs.statsChart === undefined) return;

        let range = [];
        if (this.device.stats['OUTPUT:CONTROLLER'] !== undefined) {
          range = this.device.stats['OUTPUT:CONTROLLER'].range.slice(Math.max(this.device.stats['OUTPUT:CONTROLLER'].range.length - config.STATS_CHART_REALTIME_MAX_ITEMS, 0));
        }

        this.$refs.statsChart.updateOptions({
            title: {
              text: 'Packets count for ' + this.device.label
            },
            xaxis: {
              categories: range
            }
          }
        );

        let series = [];

        for (const stat in this.device.stats) {
          series.push({
            name: stat,
            data: this.device.stats[stat].data.slice(Math.max(this.device.stats[stat].range.length - config.STATS_CHART_REALTIME_MAX_ITEMS, 0))
          });
        }

        this.$refs.statsChart.updateSeries(series);

        setInterval(() => {
          if (this.$refs.statsChart === undefined || !this.realtime) return;

          let range = [];
          if (this.device.stats['OUTPUT:CONTROLLER'] !== undefined) {
            range = this.device.stats['OUTPUT:CONTROLLER'].range.slice(Math.max(this.device.stats['OUTPUT:CONTROLLER'].range.length - config.STATS_CHART_REALTIME_MAX_ITEMS, 0));
          }

          console.log(range);

          this.$refs.statsChart.updateOptions({
              xaxis: {
                categories: range
              }
            }
          );

          let series = [];

          for (const stat in this.device.stats) {
            series.push({
              name: stat,
              data: this.device.stats[stat].data.slice(Math.max(this.device.stats[stat].range.length - config.STATS_CHART_REALTIME_MAX_ITEMS, 0))
            });
          }

          this.$refs.statsChart.updateSeries(series);

        }, 1000);
      },
      setAllData() {
        if (this.$refs.statsChart === undefined) return;

        let range = [];
        if (this.device.stats['OUTPUT:CONTROLLER'] === undefined) {
          range = this.device.stats['OUTPUT:CONTROLLER'].range;
        }

        this.$refs.statsChart.updateOptions({
            title: {
              text: 'Packets count for ' + this.device.label
            },
            xaxis: {
              categories: range
            }
          }
        );

        let series = [];

        for (const stat in this.device.stats) {
          series.push({
            name: stat,
            data: this.device.stats[stat].data.slice(Math.max(this.device.stats[stat].range.length - config.STATS_CHART_REALTIME_MAX_ITEMS, 0))
          });
        }

        this.$refs.statsChart.updateSeries(series);
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
          this.$refs.statsChart.updateOptions({
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
          this.$refs.statsChart.updateOptions({
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