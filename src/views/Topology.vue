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
               :events="['selectNode', 'deselectNode', 'nodesAdd', 'click', 'edgeAdd']"
               @select-node="onNodeSelected"
               @deselect-node="onNodeDeselected"
               @nodes-add="addNodeMode = false"
               @edge-add="addEdgeMode = false"
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
            enabled: false,
            barnesHut: {gravitationalConstant: -30000},
            stabilization: {iterations: 2500}
          },
          manipulation: {
            enabled: false,
            addNode: (nodeData, callback) => {
              this.addNodeMode = false;

              nodeData.id = this.generateNewID();
              nodeData.label = 'Device ' + +nodeData.id;
              nodeData.image = '/images/router-unactive.png';
              nodeData.shape = 'image';
              nodeData.physics = false;
              nodeData.x = this.x;
              nodeData.y = this.y;

              this.nodes.push(nodeData);
              this.nodesIndexes[nodeData.id] = this.nodes.length - 1;

              this.devices[nodeData.id] = {
                id: nodeData.id,
                label: 'Device ' + +nodeData.id,
                image: '/images/router-unactive.png',
                shape: 'image',
                ports: [],
                links: []
              };

              axios.post(`${config.api}/switch/add/s${+nodeData.id}`, {
                  params: {
                    delay: "100ms",
                    bw: 50
                  }
                })
                .then(response => {
                  console.log(response)
                })
                .catch(error => {
                  console.error(error)
                });
              this.$refs.network.disableEditMode();
              callback(nodeData);
            },
            addEdge: (edgeData, callback) => {
              this.addEdgeMode = false;

              if (edgeData.from !== edgeData.to
                && !(this.linksMap[edgeData.from + '_' + edgeData.to]
                  || this.linksMap[edgeData.to + '_' + edgeData.from])) {
                edgeData.arrows = {
                  to: {
                    enabled: true,
                    type: 'triangle'
                  },
                  from: {
                    enabled: true,
                    type: 'triangle'
                  }
                };
                this.edges.push(edgeData);

                const indexFrom = this.nodesIndexes[edgeData.from];
                this.nodes[indexFrom].image = '/images/router.png';
                this.nodes[indexFrom].physics = true;

                const indexTo = this.nodesIndexes[edgeData.to];
                this.nodes[indexTo].image = '/images/router.png';
                this.nodes[indexTo].physics = true;

                this.devices[edgeData.from].image = '/images/router.png';
                this.devices[edgeData.to].image = '/images/router.png';

                this.devices[edgeData.from].links.push({
                  id: this.devices[edgeData.to].id,
                  label: this.devices[edgeData.to].label,
                  image: this.devices[edgeData.to].image,
                  shape: this.devices[edgeData.to].shape,
                  ports: this.devices[edgeData.to].ports
                });

                axios.get(`${config.api}/link/add`, {
                    params: {
                      a: 's' + +edgeData.from,
                      b: 's' + +edgeData.to
                    }
                  })
                  .then(response => {
                    console.log(response)
                  })
                  .catch(error => {
                    console.error(error)
                  });

                callback(edgeData);
              }
              this.$refs.network.disableEditMode();
            }
          }
        },
        devices: {},
        selected: {},
        x: 0,
        y: 0,
        addNodeMode: false,
        addEdgeMode: false,
        linksMap: {},
        nodesIndexes: {}
      }
    },
    async created() {
      const switches = axios.get(`${config.back}/v1.0/topology/switches`);
      const links = axios.get(`${config.back}/v1.0/topology/links`);

      await axios.all([switches, links])
        .then(responses => {
          for (let i = 0; i < responses[0].data.length; i++) {
            const device = responses[0].data[i];
            this.nodes.push({
              id: device.dpid,
              label: 'Device ' + +device.dpid,
              image: '/images/router.png',
              shape: 'image'
            });
            this.nodesIndexes[device.dpid] = i;

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
            if (!(this.linksMap[link.src.dpid + '_' + link.dst.dpid] || this.linksMap[link.dst.dpid + '_' + link.src.dpid])) {
              this.linksMap[link.src.dpid + '_' + link.dst.dpid] = true;
              this.edges.push({
                from: link.src.dpid,
                to: link.dst.dpid,
                length: 300,
                arrows: {
                  to: {
                    enabled: true,
                    type: 'triangle'
                  },
                  from: {
                    enabled: true,
                    type: 'triangle'
                  }
                }
              });
            }

            this.devices[link.src.dpid].links.push({
              id: this.devices[link.dst.dpid].id,
              label: this.devices[link.dst.dpid].label,
              srcPort: link.src.name,
              dstPort: link.dst.name,
            });
          }

          for (const device in this.devices) {
            if (!this.devices[device].links.length) {
              this.devices[device].physics = false;
              this.devices[device].image = '/images/router-unactive.png';
              this.nodes[this.nodesIndexes[device]].physics = false;
              this.nodes[this.nodesIndexes[device]].image = '/images/router-unactive.png';
            }
          }
        })
        .catch(error => {
          console.error(error);
          //Adds mocks
          this.nodes = mocks.nodes;
          this.edges = mocks.edges;
          this.devices = mocks.devices;
        });

      this.options.physics.enabled = true;
    },
    methods: {
      // rpc(method, params) {
      //   switch (method) {
      //     case 'event_switch_enter':
      //       break;
      //       default:
      //         console.log(method, params)
      //   }
      // },
      onNodeSelected($event) {
        if (this.selected.id !== undefined)
          this.nodes[this.nodesIndexes[this.selected.id]].image = this.selected.image;
        this.nodes[this.nodesIndexes[$event.nodes[0]]].image = '/images/router-selected.png';
        this.selected = this.devices[$event.nodes[0]];
        this.$store.commit('setLeftMenu', true);
      },
      onNodeDeselected($event) {
        if (this.nodes[this.nodesIndexes[this.selected.id]])
          this.nodes[this.nodesIndexes[this.selected.id]].image = this.selected.image;
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