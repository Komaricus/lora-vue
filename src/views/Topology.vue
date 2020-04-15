<template>
  <div>
    <Navbar/>
    <div class="wrapper">
      <div class="left-menu" :class="{'active' : $store.getters.getLeftMenu }">
        <device-info :device="selected" @device-selected="onDeviceSelected"/>
      </div>
      <Network ref="network"
               class="network"
               :nodes="nodes"
               :edges="edges"
               :options="options"
               :events="['selectNode', 'deselectNode']"
               @select-node="onNodeSelected"
               @deselect-node="onNodeDeselected"/>
    </div>
  </div>
</template>

<script>
  import Navbar from "../components/Navbar";
  import DeviceInfo from "../components/DeviceInfo";
  import axios from "axios"
  import {Network} from "vue-vis-network";

  import config from "@/config"
  import mocks from "@/mocks"

  export default {
    name: "Topology",
    components: {
      Navbar,
      Network,
      DeviceInfo
    },
    data() {
      return {
        nodes: [],
        edges: [],
        options: {
          nodes: {
            font: {
              color: '#2c3e50',
              size: 16, // px
              face: 'Avenir',
              strokeWidth: 2
            }
          },
          edges: {
            color: 'gray'
          },
          physics: {
            barnesHut: {gravitationalConstant: -30000},
            stabilization: {iterations: 2500}
          },
        },
        devices: {},
        selected: {}
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
              shape: 'image'
            });

            if (this.devices[device.dpid] === undefined)
              this.devices[device.dpid] = {
                id: device.dpid,
                label: 'Device ' + +device.dpid,
                image: '/images/router.png',
                shape: 'image',
                ports: device.ports,
                links: []
              };
          }

          for (const link of responses[1].data) {
            this.edges.push({
              from: link.src.dpid,
              to: link.dst.dpid,
              length: 300,
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            });

            this.devices[link.src.dpid].links.push({
              id: this.devices[link.dst.dpid].id,
              label: this.devices[link.dst.dpid].label,
              image: this.devices[link.dst.dpid].image,
              shape: this.devices[link.dst.dpid].shape,
              ports: this.devices[link.dst.dpid].ports
            });
          }

          this.options.physics.enabled = true;
        })
        .catch(error => {
          console.error(error);
          //Adds mocks
          this.nodes = mocks.nodes;
          this.edges = mocks.edges;
          this.devices = mocks.devices;
        })
    },
    methods: {
      onNodeSelected($event) {
        if (this.selected.id !== undefined)
          this.nodes.find(e => e.id === this.selected.id).image = '/images/router.png';
        this.nodes.find(e => e.id === $event.nodes[0]).image = '/images/router-selected.png';
        this.selected = this.devices[$event.nodes[0]];
        this.$store.commit('setLeftMenu', true);
      },
      onNodeDeselected($event) {
        this.nodes.find(e => e.id === this.selected.id).image = '/images/router.png';
        if (!$event.nodes.length) {
          this.selected = {};
        }
      },
      onDeviceSelected($event) {
        this.$refs.network.selectNodes([$event.id], true);
        // fire selection event manually
        this.onNodeSelected({nodes: [$event.id]});
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/styles/colors";

  .wrapper {
    margin-top: 60px;
    min-height: calc(100vh - 60px);
    height: calc(100vh - 60px);
    display: flex;
  }

  .network {
    width: 100%;
    background-color: #f0f0f0;
  }

  .left-menu {
    white-space: nowrap;
    width: 0;
    background-color: #fff;
    transition: width 0.2s ease-in-out;

    .content {
      margin: 15px;
    }
  }

  .left-menu.active {
    width: 800px;
  }
</style>