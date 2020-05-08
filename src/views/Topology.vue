<template>
  <div>
    <Navbar @add-node-clicked="onAddNodeButtonClicked"
            @add-link-clicked="onAddLinkButtonClicked"/>
    <div v-if="$store.getters.getLoading" class="overlay">
      <span class="mdi mdi-loading mdi-spin loader"/>
    </div>
    <div v-if="addNodeMode" class="tooltip">Click anywhere to add device.</div>
    <div v-if="addEdgeMode" class="tooltip">Click on a device and drag the link to another device to connect them.</div>
    <div class="wrapper">
      <div class="left-menu" :class="{'active' : showLeftMenu }">
        <device-info :device="selected" @device-selected="onDeviceSelected" @delete-clicked="onDeleteButtonClicked"/>
      </div>
      <Network ref="network"
               class="network"
               :nodes="nodes"
               :edges="edges"
               :options="options"
               :events="['selectNode', 'deselectNode', 'nodesAdd', 'click', 'edgeAdd', 'selectEdge', 'deselectEdge']"
               @select-edge="onEdgeSelected"
               @deselect-edge="onEdgeDeselected"
               @select-node="onNodeSelected"
               @deselect-node="onNodeDeselected"
               @nodes-add="addNodeMode = false"
               @edge-add="addEdgeMode = false"
               @click="onClick"/>
    </div>
    <div class="snackbar" v-if="snackbar">
      <p style="color: white">{{message}}</p>
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
            color: 'gray',
            font: {
              color: '#2c3e50',
              size: 16, // px
              face: 'Avenir',
              strokeWidth: 2
            }
          },
          physics: {
            enabled: false,
            barnesHut: {gravitationalConstant: -30000},
            stabilization: {iterations: 2500}
          },
          manipulation: {
            enabled: false,
            addNode: (nodeData, callback) => {
              this.$store.commit("setLoading", true);
              this.addNodeMode = false;
              nodeData.id = this.generateNewID();

              axios.post(`${config.api}/switch/add/s${this.dpidToInt(nodeData.id)}`, {
                  params: {
                    delay: "100ms",
                    bw: 50
                  }
                })
                .then(() => {
                  this.$refs.network.disableEditMode();
                  callback(nodeData);
                })
                .catch(error => {
                  console.error(error)
                });
            },
            addEdge: (edgeData, callback) => {
              this.addEdgeMode = false;

              if (edgeData.from === edgeData.to) {
                this.message = 'Cyclic links ara forbidden!';
                this.snackbar = true;
                this.$refs.network.disableEditMode();
                return;
              }

              if (this.linksMap[edgeData.from + '_' + edgeData.to]
                || this.linksMap[edgeData.to + '_' + edgeData.from]) {
                this.message = 'Link already exists!';
                this.snackbar = true;
                this.$refs.network.disableEditMode();
                return;
              }

              this.$store.commit("setLoading", true);
              axios.get(`${config.api}/link/add`, {
                  params: {
                    a: 's' + this.dpidToInt(edgeData.from),
                    b: 's' + this.dpidToInt(edgeData.to),
                  }
                })
                .then(() => {
                  this.$refs.network.disableEditMode();
                  callback(edgeData);
                })
                .catch(error => {
                  console.error(error)
                });
            }
          }
        },
        devices: {},
        selected: {},
        position: {
          x: 0,
          y: 0,
        },
        addNodeMode: false,
        addEdgeMode: false,
        linksMap: {},
        nodesIndexes: {},
        message: '',
        snackbar: false,
        nextId: 0x0000000000000000
      }
    },
    async created() {
      const switches = axios.get(`${config.back}/v1.0/topology/switches`);
      const links = axios.get(`${config.back}/v1.0/topology/links`);
      const hosts = axios.get(`${config.back}/v1.0/topology/hosts`);

      this.$store.commit("setLoading", true);
      await axios.all([switches, links, hosts])
        .then(responses => {
          console.log(responses[2]);

          for (let i = 0; i < responses[0].data.length; i++) {
            const device = responses[0].data[i];
            if (this.nextId < parseInt('0x' + device.dpid, 16))
              this.nextId = parseInt('0x' + device.dpid, 16);

            this.nodes.push({
              id: device.dpid,
              label: 'Device ' + this.dpidToInt(device.dpid),
              image: '/images/router.png',
              shape: 'image'
            });
            this.nodesIndexes[device.dpid] = i;

            if (this.devices[device.dpid] === undefined)
              this.devices[device.dpid] = {
                id: device.dpid,
                label: 'Device ' + this.dpidToInt(device.dpid),
                image: '/images/router.png',
                shape: 'image',
                ports: device.ports,
                links: []
              };
          }

          for (const link of responses[1].data) {
            this.addLink(link)
          }

          this.checkDevicesReachable();
        })
        .catch(error => {
          console.error(error);
          //Adds mocks
          this.nodes = mocks.nodes;
          this.edges = mocks.edges;
          this.devices = mocks.devices;
          this.linksMap = mocks.linksMap;
          this.nodesIndexes = mocks.nodesIndexes;
        });

      this.options.physics.enabled = true;
      this.connect();

      setTimeout(() => {
        this.$store.commit("setLoading", false);
      }, 300);
    },
    methods: {
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      checkDevicesReachable() {
        for (const device in this.devices) {
          if (!this.devices[device].links.length) {
            this.devices[device].physics = false;
            this.devices[device].image = '/images/router-unactive.png';
            this.nodes[this.nodesIndexes[device]].physics = false;
            this.nodes[this.nodesIndexes[device]].image = '/images/router-unactive.png';
          } else if (!this.devices[device].physics) {
            this.devices[device].physics = true;
            this.devices[device].image = '/images/router.png';
            this.nodes[this.nodesIndexes[device]].physics = true;
            this.nodes[this.nodesIndexes[device]].image = '/images/router.png';
            this.nodes[this.nodesIndexes[device]].x = undefined;
            this.nodes[this.nodesIndexes[device]].y = undefined;
          }
        }
      },
      connect() {
        this.socket = new WebSocket("ws://localhost:5555/v1.0/topology/ws");
        this.socket.onopen = () => {
          console.log("connected to ws://localhost:5555/v1.0/topology/ws");
        };

        this.socket.onmessage = ({data}) => {
          const parsedData = JSON.parse(data);
          console.log(parsedData);
          switch (parsedData.method) {
            case 'event_switch_enter':
              this.addDevice({id: parsedData.params[0].dpid});
              break;
            case 'event_link_add':
              this.addLink(parsedData.params[0]);
              this.checkDevicesReachable();
              break;
            case 'event_link_delete':
              console.log(parsedData);
              break;
            case 'event_switch_leave':
              console.log(parsedData);
              break;
          }

          this.socket.send(JSON.stringify({"id": data.id, "jsonrpc": "2.0", "result": ""}));
          this.$store.commit("setLoading", false);
        };

        this.socket.onclose = (event) => {
          console.log(event)
        };

        this.socket.onerror = (error) => {
          console.error(error)
        }
      },
      addDevice(nodeData) {
        nodeData.label = 'Device ' + this.dpidToInt(nodeData.id);
        nodeData.image = '/images/router-unactive.png';
        nodeData.shape = 'image';
        nodeData.physics = false;
        nodeData.x = this.position.x;
        nodeData.y = this.position.y;

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
      },
      addLink(link) {
        if (!(this.linksMap[link.src.dpid + '_' + link.dst.dpid] || this.linksMap[link.dst.dpid + '_' + link.src.dpid])) {
          this.linksMap[link.src.dpid + '_' + link.dst.dpid] = true;
          this.edges.push({
            label: `${link.src.name}_${link.dst.name}`,
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

          this.devices[link.src.dpid].links.push({
            id: this.devices[link.dst.dpid].id,
            label: this.devices[link.dst.dpid].label,
            srcPort: link.src.name,
            dstPort: link.dst.name,
          });

          if (this.devices[link.src.dpid].ports.findIndex(e => e.name === link.src.name) === -1) {
            this.devices[link.src.dpid].ports.push(link.src);
          }

          this.devices[link.dst.dpid].links.push({
            id: this.devices[link.src.dpid].id,
            label: this.devices[link.src.dpid].label,
            srcPort: link.dst.name,
            dstPort: link.src.name,
          });

          if (this.devices[link.dst.dpid].ports.findIndex(e => e.name === link.dst.name) === -1) {
            this.devices[link.dst.dpid].ports.push(link.dst);
          }
        }
      },
      onDeleteButtonClicked() {
        if (this.selected.link) {
          this.edges = this.edges.filter(e => {
            return e.id !== this.selected.id
          });

          this.linksMap = {};
          for (const link of this.edges) {
            if (!(this.linksMap[link.from + '_' + link.to]
              || this.linksMap[link.to + '_' + link.from]))
              this.linksMap[link.from + '_' + link.to] = true;
          }

          this.devices[this.selected.from].links = this.devices[this.selected.from].links.filter(e => {
            return (e.id !== this.selected.from && e.id !== this.selected.to)
          });
          this.devices[this.selected.to].links = this.devices[this.selected.to].links.filter(e => {
            return (e.id !== this.selected.from && e.id !== this.selected.to)
          });

          for (const device in this.devices) {
            if (!this.devices[device].links.length) {
              this.devices[device].physics = false;
              this.devices[device].image = '/images/router-unactive.png';
              this.nodes[this.nodesIndexes[device]].physics = false;
              this.nodes[this.nodesIndexes[device]].image = '/images/router-unactive.png';
            }
          }
        } else {
          this.nodes.splice(this.nodesIndexes[this.selected.id], 1);
          this.nodesIndexes = {};
          for (let i = 0; i < this.nodes.length; i++) {
            this.nodesIndexes[this.nodes[i].id] = i;
          }

          this.edges = this.edges.filter(e => {
            return e.from !== this.selected.id && e.to !== this.selected.id
          });

          this.linksMap = {};
          for (const link of this.edges) {
            if (!(this.linksMap[link.from + '_' + link.to]
              || this.linksMap[link.to + '_' + link.from]))
              this.linksMap[link.from + '_' + link.to] = true;
          }
          delete this.devices[this.selected.id];

          for (const device in this.devices) {
            this.devices[device].links = this.devices[device].links.filter(e => {
              return e.id !== this.selected.id
            });
            if (!this.devices[device].links.length) {
              this.devices[device].physics = false;
              this.devices[device].image = '/images/router-unactive.png';
              this.nodes[this.nodesIndexes[device]].physics = false;
              this.nodes[this.nodesIndexes[device]].image = '/images/router-unactive.png';
            }
          }
        }

        this.$refs.network.deleteSelected();
        this.selected = {};
        //todo: delete API (by network.getSelection)
      },
      onEdgeSelected($event) {
        if ($event.nodes.length) return;

        if (this.selected.id !== undefined && !this.selected.link)
          this.nodes[this.nodesIndexes[this.selected.id]].image = this.selected.image;

        const link = Object.assign({}, this.edges.find(e => e.id === $event.edges[0]));
        link.ports = [];
        link.links = [];
        link.link = true;

        for (const device in this.devices) {
          if (this.devices[device].id === link.from
            || this.devices[device].id === link.to) {
            link.links.push(this.devices[device]);
            const temp = this.devices[device].links.find(e => e.id === link.from || e.id === link.to);
            if (temp !== undefined) {
              const srcPort = temp.srcPort;
              const port = this.devices[device].ports.find(e => e.name === srcPort);
              if (port !== undefined)
                link.ports.push(port);
            }
          }
        }

        this.selected = link;

        this.$store.commit('setLeftMenu', true);
      },
      onEdgeDeselected($event) {
        if ($event.edges.length) this.onEdgeSelected($event);
        else if (this.selected.link) this.selected = {};
      },
      onNodeSelected($event) {
        if (this.selected.id !== undefined && !this.selected.link)
          this.nodes[this.nodesIndexes[this.selected.id]].image = this.selected.image;
        this.nodes[this.nodesIndexes[$event.nodes[0]]].image = '/images/router-selected.png';
        this.selected = this.devices[$event.nodes[0]];
        this.$store.commit('setLeftMenu', true);
      },
      onNodeDeselected($event) {
        if (!this.selected.link && this.nodes[this.nodesIndexes[this.selected.id]])
          this.nodes[this.nodesIndexes[this.selected.id]].image = this.selected.image;
        if (!$event.nodes.length && !$event.edges.length) {
          this.selected = {};
        }
        if ($event.edges.length) {
          this.onEdgeSelected($event);
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
        this.position.x = $event.pointer.canvas.x;
        this.position.y = $event.pointer.canvas.y;
      },
      generateNewID() {
        this.nextId++;
        let id = this.nextId.toString(16);
        id = "0".repeat(16 - id.length) + id;

        return id;
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
      },
      snackbar() {
        if (this.snackbar) {
          setTimeout(() => {
            this.snackbar = false;
            this.message = '';
          }, 3000);
        }
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
    overflow-y: scroll;

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

  .snackbar {
    position: absolute;
    bottom: 0;
    right: 0;
    height: 40px;
    width: 100%;
    max-width: 400px;
    background-color: #f05458;
    border-top-left-radius: 10px;
    display: flex;
    text-align: left;
    align-items: center;
    padding: 10px;
  }

</style>