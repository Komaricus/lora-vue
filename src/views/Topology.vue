<template>
  <div>
    <Navbar @add-node-clicked="onAddNodeButtonClicked"
            @add-link-clicked="onAddLinkButtonClicked"
            @add-host-clicked="onAddHostButtonClicked"
            @emulation-status-changed="onEmulationStatusChanged"
            :status="status"/>
    <div class="wrapper">
      <div class="left-menu" :class="{'active' : showLeftMenu }">
        <device-info :device="selected" @device-selected="onDeviceSelected" @delete-clicked="onDeleteButtonClicked"
                     :status="status"/>
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
        status: false,
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

              if (this.addHostMode) {
                this.addHostMode = false;

                nodeData.dpid = this.generateNewHostID();

                axios.post(`${config.api}/host/h${this.dpidToInt(nodeData.dpid)}`,)
                  .then(() => {
                    this.addHost({dpid: nodeData.dpid, port: {}, mac: 'Not specified yet'});
                    this.$refs.network.disableEditMode();
                    this.setLocalTopology();
                    callback(nodeData);
                  })
                  .catch(error => {
                    console.error(error)
                  })
                  .finally(() => {
                    this.$store.commit("setLoading", false);
                  });
              } else {
                this.addNodeMode = false;
                nodeData.id = this.generateNewID();

                axios.post(`${config.api}/switch/s${this.dpidToInt(nodeData.id)}`, {
                    params: {
                      delay: "100ms",
                      bw: 50
                    }
                  })
                  .then(() => {
                    this.addDevice({id: nodeData.id});
                    this.$refs.network.disableEditMode();
                    this.setLocalTopology();
                    callback(nodeData);
                  })
                  .catch(error => {
                    console.error(error)
                  })
                  .finally(() => {
                    this.$store.commit("setLoading", false);
                  });
              }

              this.$message.closeAll();
            },
            addEdge: (edgeData, callback) => {
              this.addEdgeMode = false;
              this.$message.closeAll();

              if (edgeData.from === edgeData.to) {
                this.$store.commit('notify', {
                  title: 'Error',
                  message: 'Cyclic links are forbidden!',
                  type: 'error',
                  position: 'bottom-right',
                  duration: config.NOTIFICATION_DURATION
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
                  duration: config.NOTIFICATION_DURATION
                });
                this.$refs.network.disableEditMode();
                return;
              }

              if (edgeData.from.includes('host') && edgeData.to.includes('host')) {
                this.$store.commit('notify', {
                  title: 'Error',
                  message: 'Hosts cannot be connected directly!',
                  type: 'error',
                  position: 'bottom-right',
                  duration: config.NOTIFICATION_DURATION
                });
                this.$refs.network.disableEditMode();
                return;
              }

              if (edgeData.from.includes('host') && this.hosts[edgeData.from].links.length ||
                edgeData.to.includes('host') && this.hosts[edgeData.to].links.length) {
                this.$store.commit('notify', {
                  title: 'Error',
                  message: 'Host can only be connected to one device!',
                  type: 'error',
                  position: 'bottom-right',
                  duration: config.NOTIFICATION_DURATION
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
                  this.addLink({
                    src: {
                      dpid: edgeData.from,
                      name: this.generateInterfaceName(edgeData.from),
                      'hw_addr': 'Not specified yet',
                      'port_no': this.generatePortNumber(edgeData.from)
                    },
                    dst: {
                      dpid: edgeData.to,
                      name: this.generateInterfaceName(edgeData.to),
                      'hw_addr': 'Not specified yet',
                      'port_no': this.generatePortNumber(edgeData.to)
                    }
                  }, true);
                  this.checkDevicesReachable();
                  this.checkHostsReachable();
                  this.$refs.network.disableEditMode();
                  this.setLocalTopology();
                  callback(edgeData);
                })
                .catch(error => {
                  console.error(error)
                })
                .finally(() => {
                  this.$store.commit("setLoading", false);
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
        addHostMode: false,
        linksMap: {},
        nodesIndexes: {},
        nextId: 0x0000000000000000,
        nextHostId: 0x0000000000000000,
        hosts: {},
        links: []
      }
    },
    async created() {
      this.$store.commit("setLoading", true);
      await axios.get(`${config.api}/net/status`)
        .then(async ({data}) => {
          this.status = data.status;
          if (data.status) {
            const switches = axios.get(`${config.back}/v1.0/topology/switches`);
            const links = axios.get(`${config.back}/v1.0/topology/links`);
            const hosts = axios.get(`${config.back}/v1.0/topology/hosts`);

            await axios.all([switches, links, hosts])
              .then(responses => {
                this.initTopology(responses[0].data, responses[1].data, responses[2].data);
                this.setLocalTopology();
              })
              .catch(error => {
                console.error(error);
                //Adds mocks
                // this.nodes = mocks.nodes;
                // this.edges = mocks.edges;
                // this.devices = mocks.devices;
                // this.linksMap = mocks.linksMap;
                // this.nodesIndexes = mocks.nodesIndexes;
              });

            this.connect();
          } else {
            let switches, links, hosts;
            ({switches, links, hosts} = this.getLocalTopology());
            this.initTopology(switches, links, hosts);
          }
        })
        .catch(error => {
          console.error(error)
        });

      setTimeout(() => {
        this.$message.closeAll();
        this.$store.commit("setLoading", false);
      }, 300);
    },
    methods: {
      initTopology(switches, links, hosts) {
        for (let i = 0; i < switches.length; i++) {
          const device = switches[i];
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
              links: [],
              charges: {
                data: [],
                range: []
              },
              events: {
                data: [],
                range: []
              },
              stats: {}
            };
        }

        for (const link of links) {
          this.addLink(link, false);
        }

        for (const host of hosts) {
          this.addHost(host);
        }

        this.checkDevicesReachable();
        this.checkHostsReachable();
        this.getBatteryCharge();
        this.getEvents();
        this.getStats();

        this.options.physics.enabled = true;
      },
      async onEmulationStatusChanged(status) {
        this.$store.commit("setLoading", true);
        if (status) {
          await axios.get(`${config.api}/net/start`)
            .then(() => {
              console.info('Starting emulation...');
              this.status = status;
              this.connect();
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.$store.commit("setLoading", false);
            });
        } else {
          await axios.get(`${config.api}/net/stop`)
            .then(() => {
              console.info('Stopping emulation...');
              this.status = status;
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.$store.commit("setLoading", false);
            });
        }
      },
      getStats() {
        setInterval(() => {
          if (!this.status) return;
          for (const dpid in this.devices) {
            axios.get(`${config.back}/stats/flow/${this.dpidToInt(dpid)}`)
              .then(({data}) => {
                for (const action of data[this.dpidToInt(dpid)]) {
                  if (!this.devices[dpid].stats[action.actions[0]]) {
                    this.devices[dpid].stats[action.actions[0]] = {
                      data: [],
                      range: []
                    };
                  }

                  const tick = {x: new Date().toLocaleTimeString(), y: action.packet_count};
                  this.devices[dpid].stats[action.actions[0]].data.push(tick);
                  this.devices[dpid].stats[action.actions[0]].range.push(tick.x);

                  if (this.devices[dpid].stats[action.actions[0]].data.length > config.STATS_CHART_MAX_ITEMS) {
                    this.devices[dpid].stats[action.actions[0]].data.shift();
                    this.devices[dpid].stats[action.actions[0]].range.shift();
                  }
                }
              })
              .catch(error => {
                console.error(error)
              });
          }
        }, config.STATS_CHART_UPDATE_TIMEOUT);
      },
      getEvents() {
        setInterval(() => {
          if (!this.status) return;
          let now = new Date();
          let x = now.toLocaleTimeString();
          let end = now.toISOString().substring(0, 19);
          now.setSeconds(now.getSeconds() - config.EVENTS_CHART_UPDATE_TIMEOUT / 1000);
          let start = now.toISOString().substring(0, 19);
          axios.get(`${config.api}/count/events`, {
              params: {
                start: start,
                end: end
              }
            })
            .then(({data}) => {
              for (const dpid in this.devices) {
                const index = data.findIndex(e => e.dpid == this.dpidToInt(dpid));
                if (index === -1) {
                  this.devices[dpid].events.data.push({y: 0, x: x});
                  this.devices[dpid].events.range.push(x);
                } else {
                  const tick = {y: data[index].events, x: x};
                  this.devices[dpid].events.data.push(tick);
                  this.devices[dpid].events.range.push(x);
                  if (this.devices[dpid].events.data.length > config.EVENTS_CHART_MAX_ITEMS) {
                    this.devices[dpid].events.data.shift();
                    this.devices[dpid].events.range.shift();
                  }
                }
              }
            })
            .catch(error => {
              console.error(error)
            });
        }, config.EVENTS_CHART_UPDATE_TIMEOUT);
      },
      getBatteryCharge() {
        setInterval(() => {
          if (!this.status) return;
          axios.get(`${config.api}/events/charge_state`)
            .then(({data}) => {
              for (const device of data) {
                if (!this.devices[device.dpid]) continue;
                let charge = (device.charge / config.CHARGE_DIVIDER).toFixed(0);
                if (charge < 0) charge = 0;
                const tick = {y: charge, x: new Date().toLocaleTimeString()};
                this.devices[device.dpid].charges.data.push(tick);
                this.devices[device.dpid].charges.range.push(tick.x);
                if (this.devices[device.dpid].charges.data.length > config.BATTERY_CHART_MAX_ITEMS) {
                  this.devices[device.dpid].charges.data.shift();
                  this.devices[device.dpid].charges.range.shift();
                }
              }
            })
            .catch(error => {
              console.error(error)
            });
        }, config.BATTERY_CHART_UPDATE_TIMEOUT);
      },
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
          console.info("connected to ws://localhost:5555/v1.0/topology/ws");
          this.$store.commit('notify', {
            title: 'Connected to server',
            type: 'info',
            position: 'bottom-right',
            duration: config.NOTIFICATION_DURATION
          });
        };

        this.socket.onmessage = ({data}) => {
          const parsedData = JSON.parse(data);
          console.info(parsedData);
          // switch (parsedData.method) {
          //   case 'event_switch_enter':
          //     this.addDevice({id: parsedData.params[0].dpid});
          //     break;
          //   case 'event_link_add':
          //     this.addLink(parsedData.params[0], true);
          //     this.checkDevicesReachable();
          //     break;
          // case 'event_link_delete':
          //   this.deleteLink(parsedData.params[0]);
          //   break;
          // case 'event_switch_leave':
          //   this.deleteDevice(parsedData.params[0].dpid);
          //   break;
          // }

          this.socket.send(JSON.stringify({"id": data.id, "jsonrpc": "2.0", "result": ""}));
          // this.$store.commit("setLoading", false);
        };

        this.socket.onclose = (event) => {
          console.info(event)
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
        if (hostData.ipv4) {
          const dpid = +hostData.ipv4[0].split('.')[3];
          hostData.dpid = this.generateNewHostID(dpid);
        } else if (hostData.dpid) {
          hostData.ipv4 = [`10.0.0.${this.dpidToInt(hostData.dpid)}`];
        }

        if (this.nextHostId < parseInt('0x' + hostData.dpid, 16))
          this.nextHostId = parseInt('0x' + hostData.dpid, 16);

        hostData.id = 'host' + this.dpidToInt(hostData.dpid);
        hostData.label = 'Host ' + this.dpidToInt(hostData.dpid);
        hostData.image = hostData.port.dpid ? '/images/host.png' : '/images/host-unactive.png';
        hostData.shape = 'image';
        hostData.physics = false;
        hostData.host = true;
        hostData.links = [];
        hostData.x = this.position.x;
        hostData.y = this.position.y;

        this.nodes.push(hostData);
        this.nodesIndexes[hostData.id] = this.nodes.length - 1;
        this.hosts[hostData.id] = Object.assign({}, hostData);

        if (hostData.port.dpid !== undefined) {
          this.addLink({
            src: {
              dpid: hostData.id,
              name: `h${this.dpidToInt(hostData.dpid)}-eth${hostData.links.length + 1}`,
              'hw_addr': hostData.mac,
              'port_no': '00000001'
            },
            dst: hostData.port
          }, false);
        }

        setTimeout(() => {
          this.nodes[this.nodesIndexes[hostData.id]].x = undefined;
          this.nodes[this.nodesIndexes[hostData.id]].y = undefined;
        }, 50);
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
          links: [],
          charges: {
            data: [],
            range: []
          },
          events: {
            data: [],
            range: []
          },
          stats: {}
        };

        this.$store.commit('notify', {
          title: 'Device added',
          message: `${nodeData.label} successfully added`,
          type: 'success',
          position: 'bottom-right',
          duration: config.NOTIFICATION_DURATION
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
            length: config.TOPOLOGY_EDGES_LENGTH,
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

          if (link.src.dpid.includes('host') || link.dst.dpid.includes('host')) {
            let hostLink = link.src.dpid.includes('host') ? link.src : link.dst;
            let deviceLink = link.src.dpid.includes('host') ? link.dst : link.src;

            this.devices[deviceLink.dpid].links.push({
              id: this.hosts[hostLink.dpid].id,
              label: this.hosts[hostLink.dpid].label,
              srcPort: deviceLink.name,
              dstPort: hostLink.name,
            });

            this.hosts[hostLink.dpid].links.push({
              id: this.devices[deviceLink.dpid].id,
              label: this.devices[deviceLink.dpid].label,
              srcPort: hostLink.name,
              dstPort: deviceLink.name,
            });

            this.hosts[hostLink.dpid].port = deviceLink;
            if (this.devices[deviceLink.dpid].ports.findIndex(e => e.name === deviceLink.name) === -1) {
              this.devices[deviceLink.dpid].ports.push(deviceLink);
            }
          } else {
            this.links.push(link);

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

          if (showNotification)
            this.$store.commit('notify', {
              title: 'Link added',
              message: `Link ${link.src.name}_${link.dst.name} successfully added`,
              type: 'success',
              position: 'bottom-right',
              duration: config.NOTIFICATION_DURATION
            });
        }
      },
      deleteDevice(id) {
        const label = this.devices[id].label;

        for (const link of this.devices[id].links) {
          this.deleteLink({
            src: {
              dpid: id
            },
            dst: {
              dpid: link.id
            }
          }, false);
        }

        this.nodes.splice(this.nodesIndexes[id], 1);
        this.nodesIndexes = {};
        for (let i = 0; i < this.nodes.length; i++) {
          this.nodesIndexes[this.nodes[i].id] = i;
        }

        delete this.devices[id];

        this.$store.commit('notify', {
          title: 'Delete completed',
          message: `${label} deleted`,
          type: 'success',
          position: 'bottom-right',
          duration: config.NOTIFICATION_DURATION
        });

        this.setLocalTopology();
      },
      deleteLink(link, showNotification) {
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

        if (link.src.dpid.includes('host') || link.dst.dpid.includes('host')) {
          let hostLink = link.src.dpid.includes('host') ? link.src : link.dst;
          let deviceLink = link.src.dpid.includes('host') ? link.dst : link.src;

          if (this.devices[deviceLink.dpid] !== undefined) {
            this.devices[deviceLink.dpid].links = this.devices[deviceLink.dpid].links.filter(e => {
              return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
            });

            const portIndex = this.devices[deviceLink.dpid].ports.findIndex(e => e.name === this.hosts[hostLink.dpid].port.name);
            this.devices[deviceLink.dpid].ports.splice(portIndex, 1);
          }

          if (this.hosts[hostLink.dpid] !== undefined) {
            this.hosts[hostLink.dpid].links = this.hosts[hostLink.dpid].links.filter(e => {
              return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
            });

            this.hosts[hostLink.dpid].port = {};
          }

          this.checkHostsReachable();
        } else {
          const deleteIndex = this.links.findIndex(e => {
            return (e.src.dpid === link.src.dpid && e.dst.dpid === link.dst.dpid) || (e.src.dpid === link.dst.dpid && e.dst.dpid === link.src.dpid)
          });
          const linkPorts = this.links[deleteIndex];

          if (this.devices[link.src.dpid] !== undefined) {
            this.devices[link.src.dpid].links = this.devices[link.src.dpid].links.filter(e => {
              return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
            });

            this.devices[link.src.dpid].ports.splice(this.devices[link.src.dpid].ports.findIndex(e => e.name === linkPorts.src.name || e.name === linkPorts.dst.name), 1);
          }

          if (this.devices[link.dst.dpid] !== undefined) {
            this.devices[link.dst.dpid].links = this.devices[link.dst.dpid].links.filter(e => {
              return (e.id !== link.src.dpid && e.id !== link.dst.dpid)
            });

            this.devices[link.dst.dpid].ports.splice(this.devices[link.dst.dpid].ports.findIndex(e => e.name === linkPorts.src.name || e.hw_addr === linkPorts.dst.name), 1);
          }

          this.links.splice(deleteIndex, 1);
        }

        this.checkDevicesReachable();

        if (showNotification) {
          this.$store.commit('notify', {
            title: 'Delete completed',
            message: `${label} deleted`,
            type: 'success',
            position: 'bottom-right',
            duration: config.NOTIFICATION_DURATION
          });
        }

        this.setLocalTopology();
      },
      deleteHost(id) {
        const label = this.hosts[id].label;

        for (const link of this.hosts[id].links) {
          this.deleteLink({
            src: {
              dpid: id
            },
            dst: {
              dpid: link.id
            }
          }, false);
        }

        this.nodes.splice(this.nodesIndexes[id], 1);
        this.nodesIndexes = {};
        for (let i = 0; i < this.nodes.length; i++) {
          this.nodesIndexes[this.nodes[i].id] = i;
        }
        delete this.hosts[id];

        this.$store.commit('notify', {
          title: 'Delete completed',
          message: `${label} deleted`,
          type: 'success',
          position: 'bottom-right',
          duration: config.NOTIFICATION_DURATION
        });

        this.setLocalTopology();
      },
      async onDeleteButtonClicked() {
        this.$store.commit("setLoading", true);
        if (this.selected.host) {
          await axios.delete(`${config.api}/host/${this.getNodeNameByDpid(this.selected.id)}`)
            .then(() => {
              this.deleteHost(this.selected.id);
            })
            .catch(error => {
              console.error(error);
            }).finally(() => {
              this.$store.commit("setLoading", false);
            });
        } else if (this.selected.link) {
          await axios.delete(`${config.api}/link`, {
              data: {
                a: this.getNodeNameByDpid(this.selected.to),
                b: this.getNodeNameByDpid(this.selected.from)
              }
            })
            .then(() => {
              this.deleteLink({
                src: {
                  dpid: this.selected.from
                },
                dst: {
                  dpid: this.selected.to
                }
              }, true);
            })
            .catch(error => {
              console.error(error);
            }).finally(() => {
              this.$store.commit("setLoading", false);
            });
        } else {
          await axios.delete(`${config.api}/switch/s${this.dpidToInt(this.selected.id)}`)
            .then(() => {
              this.deleteDevice(this.selected.id);
            })
            .catch(error => {
              console.error(error);
            }).finally(() => {
              this.$store.commit("setLoading", false);
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

        for (const host in this.hosts) {
          if (this.hosts[host].id === link.from
            || this.hosts[host].id === link.to) {
            link.links.push(this.hosts[host]);
            const temp = this.devices[this.hosts[host].port.dpid].links.find(e => e.id === link.from || e.id === link.to);
            if (temp !== undefined) {
              link.ports.push({
                dpid: this.hosts[host].id,
                'hw_addr': this.hosts[host].mac,
                name: temp.dstPort,
                'port_no': "00000001"
              });
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
      onAddHostButtonClicked() {
        setTimeout(() => {
          this.$refs.network.addNodeMode();
        }, 100);

        this.addEdgeMode = false;
        this.addNodeMode = true;
        this.addHostMode = true;
        this.$message.closeAll();
        this.$message({
          showClose: true,
          message: 'Click anywhere to add host.',
          type: 'Info',
          offset: 7.5,
          duration: 0,
          onClose: () => {
            this.addNodeMode = false;
            this.addHostMode = false;
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
      generateNewHostID(dpid) {
        if (dpid === undefined) {
          this.nextHostId++;
        }

        let id = dpid !== undefined ? dpid.toString(16) : this.nextHostId.toString(16);
        id = "0".repeat(16 - id.length) + id;

        return id;
      },
      generateInterfaceName(dpid) {
        let newInterfaceNumber = 0;
        if (!dpid.includes('host')) {
          for (const port of this.devices[dpid].ports) {
            const value = parseInt(port['name'].split('-')[1].replace('eth', ''));
            if (value > newInterfaceNumber) {
              newInterfaceNumber = value;
            }
          }
        }

        return `${this.getNodeNameByDpid(dpid)}-eth${newInterfaceNumber + 1}`
      },
      generatePortNumber(dpid) {
        if (!this.devices[dpid]) return '';
        let newPortNumber = 0;
        for (const port of this.devices[dpid].ports) {
          if (parseInt(port['port_no']) > newPortNumber) {
            newPortNumber = parseInt(port['port_no']);
          }
        }

        newPortNumber++;
        newPortNumber = newPortNumber.toString();
        newPortNumber = "0".repeat(8 - newPortNumber.length) + newPortNumber;

        return newPortNumber;
      },
      onDragStart($event) {
        if ($event.nodes.length)
          this.onNodeSelected({nodes: $event.nodes});
      },
      setLocalTopology() {
        let switches = [];
        for (const dpid in this.devices) {
          switches.push({
            dpid: dpid,
            ports: this.devices[dpid].ports
          });
        }

        localStorage.setItem('switches', JSON.stringify(switches));

        localStorage.setItem('links', JSON.stringify(this.links));

        let hosts = [];
        for (const hostName in this.hosts) {
          hosts.push({
            dpid: this.hosts[hostName].dpid,
            ipv4: this.hosts[hostName].ipv4,
            ipv6: this.hosts[hostName].ipv6,
            mac: this.hosts[hostName].mac,
            port: this.hosts[hostName].port,
          });
        }

        localStorage.setItem('hosts', JSON.stringify(hosts));

      },
      getLocalTopology() {
        return {
          switches: localStorage.getItem('switches') ? JSON.parse(localStorage.getItem('switches')) : [],
          links: localStorage.getItem('links') ? JSON.parse(localStorage.getItem('links')) : [],
          hosts: localStorage.getItem('hosts') ? JSON.parse(localStorage.getItem('hosts')) : []
        }
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