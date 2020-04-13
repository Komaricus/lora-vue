<template>
  <Network ref="network"
           class="wrapper"
           :nodes="nodes"
           :edges="edges"
           :options="options"
           :events="['selectNode']"
           @select-node="onNodeSelected"/>
</template>

<script>
  import axios from "axios"
  import {Network} from "vue-vis-network";

  import config from "@/config"

  export default {
    name: "Topology",
    components: {
      Network
    },
    data() {
      return {
        nodes: [],
        edges: [],
        options: {
          edges: {
            color: 'gray'
          }
        },
        devices: {}
      }
    },
    async created() {
      const switches = axios.get(`${config.back}/v1.0/topology/switches`);
      const links = axios.get(`${config.back}/v1.0/topology/links`);

      await axios.all([switches, links])
        .then(responses => {
          for (const device of responses[0].data) {
            this.nodes.push({
              id: device.dpid,
              label: 'Device ' + +device.dpid,
              image: '/images/router.png',
              shape: 'image',
            });

            if (this.devices[device.dpid] === undefined)
              this.devices[device.dpid] = {
                ports: device.ports
              };
          }

          for (const link of responses[1].data) {
            this.edges.push({
              from: link.src.dpid, to: link.dst.dpid, arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            })
          }
        })
        .catch(error => {
          console.error(error)
        })
    },
    methods: {
      onNodeSelected($event) {
        //this.nodes.find(e => e.id === $event.nodes[0]).shape = 'circle';
        console.log(this.devices[$event.nodes[0]])
      }
    }
  }
</script>

<style lang="scss" scoped>
  .wrapper {
    min-height: 100vh;
    background-color: #f0f0f0;
    height: 100vh;
  }
</style>