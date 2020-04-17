<template>
  <div id="chart">
    <apexchart ref="chart" type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>
</template>

<script>
  import VueApexCharts from 'vue-apexcharts'

  export default {
    name: "BatteryChart",
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
          name: "Battery charge %",
          data: [100, 97, 86, 73, 61, 54, 45, 33, 20]
        }],
        chartOptions: {
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          colors: ['#42b983'],
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'straight',
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
            categories: ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
          },
          yaxis: {
            max: 100,
            min: 0
          }
        },
      }
    },
    mounted() {
      this.$refs.chart.updateOptions({
          title: {
            text: 'Battery trend for ' + this.device.label
          }
        }
      )
    },
    watch: {
      device() {
        this.$refs.chart.updateOptions({
            title: {
              text: 'Battery trend for ' + this.device.label
            }
          }
        )
      }
    }
  }
</script>

<style scoped>

</style>