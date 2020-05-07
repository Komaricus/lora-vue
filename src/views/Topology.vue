<template>
  <div>
    <Navbar @add-node-clicked="onAddNodeButtonClicked"
            @add-link-clicked="onAddLinkButtonClicked"/>
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
              this.addNodeMode = false;
              nodeData.id = this.generateNewID();
              // this.addDevice(nodeData);

              axios.post(`${config.api}/switch/add/s${this.dpidToInt(nodeData.id)}`, {
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
              // if (this.getDeviceEmptyPortIndex(edgeData.from) === -1) {
              //   this.message = `Device ${this.dpidToInt(edgeData.from)} has no empty ports!`;
              //   this.snackbar = true;
              //   this.$refs.network.disableEditMode();
              //   return;
              // }
              //
              // if (this.getDeviceEmptyPortIndex(edgeData.to) === -1) {
              //   this.message = `Device ${this.dpidToInt(edgeData.to)} has no empty ports!`;
              //   this.snackbar = true;
              //   this.$refs.network.disableEditMode();
              //   return;
              // }

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

              axios.get(`${config.api}/link/add`, {
                  params: {
                    a: 's' + this.dpidToInt(edgeData.from),
                    b: 's' + this.dpidToInt(edgeData.to),
                  }
                })
                .then(response => {
                  console.log(response)
                })
                .catch(error => {
                  console.error(error)
                });

              // const fromPort = this.devices[edgeData.from].ports[this.getDeviceEmptyPortIndex(edgeData.from)].name;
              // const toPort = this.devices[edgeData.to].ports[this.getDeviceEmptyPortIndex(edgeData.to)].name;
              //
              // const indexFrom = this.nodesIndexes[edgeData.from];
              // this.nodes[indexFrom].image = '/images/router.png';
              // this.nodes[indexFrom].physics = true;
              //
              // const indexTo = this.nodesIndexes[edgeData.to];
              // this.nodes[indexTo].image = '/images/router.png';
              // this.nodes[indexTo].physics = true;
              //
              // this.devices[edgeData.from].image = '/images/router.png';
              // this.devices[edgeData.from].physics = true;
              //
              // this.devices[edgeData.to].image = '/images/router.png';
              // this.devices[edgeData.to].physics = true;
              //
              // this.devices[edgeData.from].links.push({
              //   id: this.devices[edgeData.to].id,
              //   label: this.devices[edgeData.to].label,
              //   srcPort: fromPort,
              //   dstPort: toPort
              // });
              //
              // this.devices[edgeData.to].links.push({
              //   id: this.devices[edgeData.from].id,
              //   label: this.devices[edgeData.from].label,
              //   srcPort: toPort,
              //   dstPort: fromPort
              // });


              callback(edgeData);

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
            if (!(this.linksMap[link.src.dpid + '_' + link.dst.dpid] || this.linksMap[link.dst.dpid + '_' + link.src.dpid])) {
              this.linksMap[link.src.dpid + '_' + link.dst.dpid] = true;
              this.edges.push({
                label: link.src.name + '_' + link.dst.name,
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
          this.linksMap = mocks.linksMap;
          this.nodesIndexes = mocks.nodesIndexes;
        });

      this.options.physics.enabled = true;
      this.connect();
    },
    methods: {
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      connect() {
        this.socket = new WebSocket("ws://localhost:5555/v1.0/topology/ws");
        this.socket.onopen = () => {
          console.log("connected to ws://localhost:5555/v1.0/topology/ws");

          this.socket.onmessage = ({data}) => {
            const parsedData = JSON.parse(data);
            console.log(parsedData);
            switch (parsedData.method) {
              case 'event_switch_enter':
                this.addDevice({id: parsedData.params[0].dpid});
                break;
              case 'event_link_enter':
                this.addLink(parsedData.params[0]);
                break;
            }
          };
        };
      },
      addDevice(nodeData) {
        nodeData.label = 'Device ' + this.dpidToInt(nodeData.id);
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

        // ports initialization
        // for (let i = 0; i < 4; i++) {
        //   this.devices[nodeData.id].ports.push({
        //     "hw_addr": "XX:XX:XX:XX:XX:XX".replace(/X/g, function () {
        //       return "0123456789abcdef".charAt(Math.floor(Math.random() * 16))
        //     }),
        //     name: `s${+nodeData.id}-eth${i + 1}`,
        //     "port_no": `0000000${i + 1}`,
        //     dpid: nodeData.id
        //   })
        // }
      },
      addLink(params) {
        const edgeData = {
          from: params.src,
          to: params.dst
        };

        this.linksMap[edgeData.from + '_' + edgeData.to] = true;
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
      },
      getDeviceEmptyPortIndex(deviceID) {
        for (let i = 0; i < this.devices[deviceID].ports.length; i++) {
          const portName = this.devices[deviceID].ports[i].name;
          if (!this.devices[deviceID].links.some(e => e.srcPort === portName)) return i;
        }

        return -1;
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
        if (link.ports.length === 2) link.label = `Link ${link.ports[0].name}_${link.ports[1].name}`;
        else link.label = 'Link ';

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
        this.x = $event.pointer.canvas.x;
        this.y = $event.pointer.canvas.y;
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