<template>
  <div id="chart">
    <apexchart ref="chart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts'

  export default {
    name: "LoadChart",
    components: {
      apexchart: VueApexCharts
    },
    props: {
      device: {
        type: Object
      }
    },
    data() {
      return {
        series: [{
          name: "Package amount",
          data: [34, 44, 54, 21, 12, 43, 33, 23, 7]
        }],
        chartOptions: {
          chart: {
            type: 'line',
            height: 350,
            zoom: {
              enabled: false
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
            categories: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
          },
        },
      }
    },
    mounted() {
      this.$refs.chart.updateOptions({
          title: {
            text: 'Package load for ' + this.device.label
          }
        }
      )
    },
    watch: {
      async device() {
        await this.$refs.chart.updateOptions({
            title: {
              text: 'Package load for ' + this.device.label
            }
          }
        );
      }
    }
  }
</script>

<style scoped>

</style>