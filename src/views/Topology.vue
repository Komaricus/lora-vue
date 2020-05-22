<template>
  <div>
    <Navbar @add-node-clicked="onAddNodeButtonClicked"
            @add-link-clicked="onAddLinkButtonClicked"/>
    <div class="wrapper">
      <div class="left-menu" :class="{'active' : showLeftMenu }">
        <device-info :device="selected" @device-selected="onDeviceSelected" @delete-clicked="onDeleteButtonClicked"/>
      </div>
      <Network ref="network"
               class="network"
               :nodes="nodes"
               :edges="edges"
               :options="options"
               :events="['selectNode', 'deselectNode', 'nodesAdd', 'click', 'edgeAdd', 'selectEdge', 'deselectEdge', 'dragStart']"
               @select-edge="onEdgeSelected"
               @deselect-edge="onEdgeDeselected"
               @select-node="onNodeSelected"
               @deselect-node="onNodeDeselected"
               @nodes-add="addNodeMode = false"
               @edge-add="addEdgeMode = false"
               @drag-start="onDragStart"
               @click="onClick"/>
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
              this.$message.closeAll();
              nodeData.id = this.generateNewID();

              axios.post(`${config.api}/switch/s${this.dpidToInt(nodeData.id)}`, {
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
              this.$message.closeAll();
              console.log(edgeData);

              if (edgeData.from === edgeData.to) {
                this.$store.commit('notify', {
                  title: 'Error',
                  message: 'Cyclic links are forbidden!',
                  type: 'error',
                  position: 'bottom-right',
                  duration: 3000
                });
                this.$refs.network.disableEditMode();
                return;
              }

              if (this.linksMap[edgeData.from + '_' + edgeData.to]
                || this.linksMap[edgeData.to + '_' + edgeData.from]) {
                this.$store.commit('notify', {
                  title: 'Error',
                  message: 'Link already exists!',
                  type: 'error',
                  position: 'bottom-right',
                  duration: 3000
                });
                this.$refs.network.disableEditMode();
                return;
              }

              this.$store.commit("setLoading", true);
              axios.post(`${config.api}/link`, {
                  a: this.getNodeNameByDpid(edgeData.from),
                  b: this.getNodeNameByDpid(edgeData.to),
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
        nextId: 0x0000000000000000,
        nextHostId: 0x0000000000000000,
        hosts: {}
      }
    },
    async created() {
      const switches = axios.get(`${config.back}/v1.0/topology/switches`);
      const links = axios.get(`${config.back}/v1.0/topology/links`);
      const hosts = axios.get(`${config.back}/v1.0/topology/hosts`);

      this.$store.commit("setLoading", true);
      await axios.all([switches, links, hosts])
        .then(responses => {
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
            this.addLink(link, false);
          }

          for (const host of responses[2].data) {
            this.addHost(host);
          }

          this.checkDevicesReachable();
          this.checkHostsReachable()
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
        this.$message.closeAll();
        this.$store.commit("setLoading", false);
      }, 300);
    },
    methods: {
      getNodeNameByDpid(dpid) {
        if (dpid.includes('host')) {
          return 'h' + Number(dpid.replace('host', ''));
        } else {
          return 's' + this.dpidToInt(dpid);
        }
      },
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
          }
        }
      },
      checkHostsReachable() {
        for (const host in this.hosts) {
          if (!this.hosts[host].links.length) {
            this.hosts[host].physics = false;
            this.hosts[host].image = '/images/host-unactive.png';
            this.nodes[this.nodesIndexes[host]].physics = false;
            this.nodes[this.nodesIndexes[host]].image = '/images/host-unactive.png';
          } else if (!this.hosts[host].physics) {
            this.hosts[host].physics = true;
            this.hosts[host].image = '/images/host.png';
            this.nodes[this.nodesIndexes[host]].physics = true;
            this.nodes[this.nodesIndexes[host]].image = '/images/host.png';
          }
        }
      },
      connect() {
        this.socket = new WebSocket("ws://localhost:5555/v1.0/topology/ws");
        this.socket.onopen = () => {
          console.log("connected to ws://localhost:5555/v1.0/topology/ws");
          this.$store.commit('notify', {
            title: 'Connected to server',
            type: 'info',
            position: 'bottom-right',
            duration: 3000
          });
        };

        this.socket.onmessage = ({data}) => {
          const parsedData = JSON.parse(data);
          console.log(parsedData);
          switch (parsedData.method) {
            case 'event_switch_enter':
              this.addDevice({id: parsedData.params[0].dpid});
              break;
            case 'event_link_add':
              this.addLink(parsedData.params[0], true);
              this.checkDevicesReachable();
              break;
            case 'event_link_delete':
              this.deleteLink(parsedData.params[0]);
              break;
            case 'event_switch_leave':
              this.deleteDevice(parsedData.params[0].dpid);
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
        };
      },
      initLinkMap() {
        this.linksMap = {};
        for (const link of this.edges) {
          if (!(this.linksMap[link.from + '_' + link.to]
            || this.linksMap[link.to + '_' + link.from]))
            this.linksMap[link.from + '_' + link.to] = true;
        }
      },
      addHost(hostData) {
        hostData.dpid = this.generateNewHostID();
        hostData.id = 'host' + this.dpidToInt(hostData.dpid);
        hostData.label = 'Host ' + this.dpidToInt(hostData.dpid);
        hostData.image = '/images/host.png';
        hostData.shape = 'image';
        hostData.physics = false;
        hostData.host = true;
        hostData.links = [];

        if (hostData.port.dpid !== undefined) {
          hostData.links.push({
            id: hostData.port.dpid,
            label: this.devices[hostData.port.dpid].label,
            srcPort: `h${this.dpidToInt(hostData.dpid)}-eth${hostData.links.length}`,
            dstPort: hostData.port.name,
          });

          this.edges.push({
            label: `h${this.dpidToInt(hostData.dpid)}-eth${hostData.links.length}_${hostData.port.name}`,
            from: hostData.id,
            to: hostData.port.dpid,
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

          this.linksMap[hostData.id + '_' + hostData.port.dpid] = true;
        }

        this.nodes.push(hostData);
        this.nodesIndexes[hostData.id] = this.nodes.length - 1;
        this.hosts[hostData.id] = Object.assign({}, hostData);
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

        this.$store.commit('notify', {
          title: 'Device added',
          message: `${nodeData.label} successfully added`,
          type: 'success',
          position: 'bottom-right',
          duration: 3000
        });

        setTimeout(() => {
          this.nodes[this.nodesIndexes[nodeData.id]].x = undefined;
          this.nodes[this.nodesIndexes[nodeData.id]].y = undefined;
        }, 50);
      },
      addLink(link, showNotification) {
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

          if (showNotification)
            this.$store.commit('notify', {
              title: 'Link added',
              message: `Link ${link.src.name}_${link.dst.name} successfully added`,
              type: 'success',
              position: 'bottom-right',
              duration: 3000
            });
        }
      },
      deleteDevice(id) {
        const label = this.devices[id].label;
        this.nodes.splice(this.nodesIndexes[id], 1);
        this.nodesIndexes = {};
        for (let i = 0; i < this.nodes.length; i++) {
          this.nodesIndexes[this.nodes[i].id] = i;
        }

        this.edges = this.edges.filter(e => {
          return e.from !== id && e.to !== id
        });

        this.initLinkMap();
        delete this.devices[id];

        for (const device in this.devices) {
          this.devices[device].links = this.devices[device].links.filter(e => {
            return e.id !== id
          });
          if (!this.devices[device].links.length) {
            this.devices[device].physics = false;
            this.devices[device].image = '/images/router-unactive.png';
            this.nodes[this.nodesIndexes[device]].physics = false;
            this.nodes[this.nodesIndexes[device]].image = '/images/router-unactive.png';
          }
        }

        this.$store.commit('notify', {
          title: 'Delete completed',
          message: `${label} deleted`,
          type: 'success',
          position: 'bottom-right',
          duration: 3000
        });
      },
      deleteLink(link) {
        if (!(this.linksMap[link.src.dpid + '_' + link.dst.dpid] || this.linksMap[link.dst.dpid + '_' + link.src.dpid]))
          return;

        const index = this.edges.findIndex(e => {
          return (e.from === link.src.dpid && e.to === link.dst.dpid) || (e.from === link.dst.dpid && e.to === link.src.dpid)
        });
        const label = 'Link ' + this.edges[index].label;

        this.edges = this.edges.filter(e => {
          return !((e.from === link.src.dpid && e.to === link.dst.dpid) || (e.from === link.dst.dpid && e.to === link.src.dpid))
        });

        this.initLinkMap();

        if (this.devices[link.src.dpid] !== undefined) {
          this.devices[link.src.dpid].links = this.devices[link.src.dpid].links.filter(e => {
            return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
          });
        }
        if (this.devices[link.dst.dpid] !== undefined) {
          this.devices[link.dst.dpid].links = this.devices[link.dst.dpid].links.filter(e => {
            return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
          });
        }

        this.checkDevicesReachable();

        this.$store.commit('notify', {
          title: 'Delete completed',
          message: `${label} deleted`,
          type: 'success',
          position: 'bottom-right',
          duration: 3000
        });
      },
      async onDeleteButtonClicked() {
        this.$store.commit("setLoading", true);
        if (this.selected.link) {
          await axios.delete(`${config.api}/link`, {
              data: {
                a: this.getNodeNameByDpid(this.selected.to),
                b: this.getNodeNameByDpid(this.selected.from)
              }
            })
            .catch(error => {
              console.error(error)
            });
        } else {
          await axios.delete(`${config.api}/switch/s${this.dpidToInt(this.selected.id)}`)
            .catch(error => {
              console.error(error)
            });
        }

        this.$refs.network.deleteSelected();
        this.selected = {};
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
        if ($event.nodes[0].includes('host')) {
          this.nodes[this.nodesIndexes[$event.nodes[0]]].image = '/images/host-selected.png';
          this.selected = this.hosts[$event.nodes[0]];
        } else {
          this.nodes[this.nodesIndexes[$event.nodes[0]]].image = '/images/router-selected.png';
          this.selected = this.devices[$event.nodes[0]];
        }

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
        setTimeout(() => {
          this.$refs.network.addEdgeMode();
        }, 100);

        this.addNodeMode = false;
        this.addEdgeMode = true;
        this.$message.closeAll();
        this.$message({
          showClose: true,
          message: 'Click on a device and drag the link to another device to connect them.',
          type: 'Info',
          offset: 7.5,
          duration: 0,
          onClose: () => {
            this.addEdgeMode = false;
            this.$refs.network.disableEditMode();
          }
        });
      },
      onAddNodeButtonClicked() {
        setTimeout(() => {
          this.$refs.network.addNodeMode();
        }, 100);

        this.addEdgeMode = false;
        this.addNodeMode = true;
        this.$message.closeAll();
        this.$message({
          showClose: true,
          message: 'Click anywhere to add device.',
          type: 'Info',
          offset: 7.5,
          duration: 0,
          onClose: () => {
            this.addNodeMode = false;
            this.$refs.network.disableEditMode();
          }
        });
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
      },
      generateNewHostID() {
        this.nextHostId++;
        let id = this.nextHostId.toString(16);
        id = "0".repeat(16 - id.length) + id;

        return id;
      },
      onDragStart($event) {
        if ($event.nodes.length)
          this.onNodeSelected({nodes: $event.nodes});
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

</style>