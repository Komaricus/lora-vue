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
          console.error(error);

          //Adds mocks
          this.nodes = [
            {
              id: "0000000000000001",
              label: "Device 1",
              image: "/images/router.png",
              shape: "image"
            },
            {
              id: "0000000000000002",
              label: "Device 2",
              image: "/images/router.png",
              shape: "image"
            },
            {
              id: "0000000000000003",
              label: "Device 3",
              image: "/images/router.png",
              shape: "image"
            },
            {
              id: "0000000000000004",
              label: "Device 4",
              image: "/images/router.png",
              shape: "image"
            }
          ];
          this.edges = [
            {
              from: "0000000000000001",
              to: "0000000000000003",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000004",
              to: "0000000000000003",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000002",
              to: "0000000000000004",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000001",
              to: "0000000000000002",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000004",
              to: "0000000000000002",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000001",
              to: "0000000000000004",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000002",
              to: "0000000000000001",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000003",
              to: "0000000000000001",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000004",
              to: "0000000000000001",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
            {
              from: "0000000000000003",
              to: "0000000000000004",
              arrows: {
                to: {
                  enabled: true,
                  type: 'triangle'
                }
              }
            },
          ];
          this.devices = {
            "0000000000000001": {
              "ports": [
                {
                  "hw_addr": "b6:82:4e:c2:c4:b5",
                  "name": "s1-eth1",
                  "port_no": "00000001",
                  "dpid": "0000000000000001"
                },
                {
                  "hw_addr": "e2:20:b0:de:45:25",
                  "name": "s1-eth2",
                  "port_no": "00000002",
                  "dpid": "0000000000000001"
                },
                {
                  "hw_addr": "82:d1:20:f0:f4:17",
                  "name": "s1-eth3",
                  "port_no": "00000003",
                  "dpid": "0000000000000001"
                },
                {
                  "hw_addr": "02:c9:91:f4:b4:13",
                  "name": "s1-eth4",
                  "port_no": "00000004",
                  "dpid": "0000000000000001"
                }
              ]
            },
            "0000000000000002": {
              "ports": [
                {
                  "hw_addr": "ea:0c:1d:80:86:db",
                  "name": "s2-eth1",
                  "port_no": "00000001",
                  "dpid": "0000000000000002"
                },
                {
                  "hw_addr": "66:16:26:f7:11:f9",
                  "name": "s2-eth2",
                  "port_no": "00000002",
                  "dpid": "0000000000000002"
                }
              ]
            },
            "0000000000000003": {
              "ports": [
                {
                  "hw_addr": "76:83:68:b8:d8:94",
                  "name": "s3-eth1",
                  "port_no": "00000001",
                  "dpid": "0000000000000003"
                },
                {
                  "hw_addr": "ee:37:e3:bb:00:ac",
                  "name": "s3-eth2",
                  "port_no": "00000002",
                  "dpid": "0000000000000003"
                }
              ]
            },
            "0000000000000004": {
              "ports": [
                {
                  "hw_addr": "1e:7c:6d:56:aa:e0",
                  "name": "s4-eth1",
                  "port_no": "00000001",
                  "dpid": "0000000000000004"
                },
                {
                  "hw_addr": "e2:69:ea:da:00:f7",
                  "name": "s4-eth2",
                  "port_no": "00000002",
                  "dpid": "0000000000000004"
                },
                {
                  "hw_addr": "9a:0f:4d:48:63:cc",
                  "name": "s4-eth3",
                  "port_no": "00000003",
                  "dpid": "0000000000000004"
                },
                {
                  "hw_addr": "fe:cf:d7:e7:0d:86",
                  "name": "s4-eth4",
                  "port_no": "00000004",
                  "dpid": "0000000000000004"
                }
              ]
            }
          };
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