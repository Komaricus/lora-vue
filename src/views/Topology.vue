<template>
  <div>
    <Navbar @add-node-clicked="onAddNodeButtonClicked" @add-link-clicked="onAddLinkButtonClicked"/>
    <div v-if="addNodeMode" class="tooltip">Click anywhere to add device.</div>
    <div v-if="addEdgeMode" class="tooltip">Click on a device and drag the link to another device to connect them.</div>
    <div class="wrapper">
      <div class="left-menu" :class="{'active' : showLeftMenu }">
        <device-info :device="selected" @device-selected="onDeviceSelected"/>
      </div>
      <Network ref="network"
               class="network"
               :nodes="nodes"
               :edges="edges"
               :options="options"
               :events="['selectNode', 'deselectNode', 'nodesAdd', 'click']"
               @select-node="onNodeSelected"
               @deselect-node="onNodeDeselected"
               @nodes-add="onNodeAdded"
               @click="onClick"/>
    </div>
    <!--    todo: add snackbar with messages -->
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
          manipulation: {
            enabled: false,
            addEdge: (edgeData, callback) => {
              this.addEdgeMode = false;
              if (edgeData.from !== edgeData.to) {
                //todo: prevent more then one link then it exists -> snack error
                edgeData.arrows = {
                  to: {
                    enabled: true,
                    type: 'triangle'
                  }
                };
                this.edges.push(edgeData);

                this.nodes.find(e => e.id === edgeData.from).image = '/images/router.png';
                this.nodes.find(e => e.id === edgeData.to).image = '/images/router.png';

                this.devices[edgeData.from].image =  '/images/router.png';
                this.devices[edgeData.to].image =  '/images/router.png';

                this.devices[edgeData.from].links.push({
                  id: this.devices[edgeData.to].id,
                  label: this.devices[edgeData.to].label,
                  image: this.devices[edgeData.to].image,
                  shape: this.devices[edgeData.to].shape,
                  ports: this.devices[edgeData.to].ports
                });
                callback(edgeData);
              }
            }
          }
        },
        devices: {},
        selected: {},
        x: 0,
        y: 0,
        addNodeMode: false,
        addEdgeMode: false
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
          this.nodes.find(e => e.id === this.selected.id).image = this.selected.image;
        this.nodes.find(e => e.id === $event.nodes[0]).image = '/images/router-selected.png';
        this.selected = this.devices[$event.nodes[0]];
        this.$store.commit('setLeftMenu', true);
      },
      onNodeDeselected($event) {
        if (this.nodes.find(e => e.id === this.selected.id))
          this.nodes.find(e => e.id === this.selected.id).image = this.selected.image;
        if (!$event.nodes.length) {
          this.selected = {};
        }
      },
      onDeviceSelected($event) {
        this.$refs.network.selectNodes([$event.id], true);
        // fire selection event manually
        this.onNodeSelected({nodes: [$event.id]});
      },
      onAddLinkButtonClicked() {
        this.$refs.network.addEdgeMode();
        this.addNodeMode = false;
        this.addEdgeMode = true;
      },
      onAddNodeButtonClicked() {
        this.$refs.network.addNodeMode();
        this.addEdgeMode = false;
        this.addNodeMode = true;
      },
      onClick($event) {
        this.x = $event.pointer.canvas.x;
        this.y = $event.pointer.canvas.y;
      },
      onNodeAdded($event) {
        if ($event.properties.items.length === 1 && !this.devices[$event.properties.items[0]]) {
          const dpid = this.generateNewID();

          this.nodes.push({
            id: dpid,
            label: 'Device ' + +dpid,
            image: '/images/router-unactive.png',
            shape: 'image',
            physics: false,
            x: this.x,
            y: this.y
          });

          if (this.devices[dpid] === undefined)
            this.devices[dpid] = {
              id: dpid,
              label: 'Device ' + +dpid,
              image: '/images/router-unactive.png',
              shape: 'image',
              ports: [],
              links: []
            };
        }

        this.addNodeMode = false;
      },
      generateNewID() {
        let maxID = 0;
        for (const node of this.nodes) {
          if (parseInt(node.id) > maxID) maxID = parseInt(node.id);
        }

        maxID++;
        maxID = String(maxID);
        maxID = "0".repeat(16 - maxID.length) + maxID;

        return maxID;
      }
    },
    computed: {
      showLeftMenu() {
        return this.$store.getters.getLeftMenu;
      }
    },
    watch: {
      showLeftMenu() {
        setTimeout(() => {
          this.$refs.network.redraw();
        }, 200);
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

  .tooltip {
    position: absolute;
    right: 20px;
    top: 70px;
  }
</style>