import config from "@/config";

const mocks = {
    nodes: [
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
    ],
    edges: [
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
    ],
    devices: {
        "0000000000000001": {
            "id": "0000000000000001",
            "label": "Device 1",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "da:90:cc:d0:39:99",
                "name": "s1-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "9e:8e:ae:9d:58:37",
                "name": "s1-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "02:9f:03:7b:77:90",
                "name": "s1-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "fe:25:08:98:19:f8",
                "name": "s1-eth4",
                "port_no": "00000004",
                "dpid": "0000000000000001"
            }],
            "links": [{
                "id": "0000000000000003",
                "label": "Device 3",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "6e:06:8b:11:d8:f3",
                    "name": "s3-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000003"
                }, {
                    "hw_addr": "02:8e:c1:85:11:27",
                    "name": "s3-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000003"
                }]
            }, {
                "id": "0000000000000002",
                "label": "Device 2",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "9e:bb:54:e1:53:7d",
                    "name": "s2-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000002"
                }, {
                    "hw_addr": "e2:82:07:09:d2:0b",
                    "name": "s2-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000002"
                }]
            }, {
                "id": "0000000000000004",
                "label": "Device 4",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "d2:8e:e5:68:49:76",
                    "name": "s4-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "9e:34:a9:64:c5:b2",
                    "name": "s4-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "ae:c0:18:5d:6a:ac",
                    "name": "s4-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "aa:0f:c4:35:05:d6",
                    "name": "s4-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000004"
                }]
            }]
        }, "0000000000000002": {
            "id": "0000000000000002",
            "label": "Device 2",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "9e:bb:54:e1:53:7d",
                "name": "s2-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000002"
            }, {
                "hw_addr": "e2:82:07:09:d2:0b",
                "name": "s2-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000002"
            }],
            "links": [{
                "id": "0000000000000004",
                "label": "Device 4",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "d2:8e:e5:68:49:76",
                    "name": "s4-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "9e:34:a9:64:c5:b2",
                    "name": "s4-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "ae:c0:18:5d:6a:ac",
                    "name": "s4-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "aa:0f:c4:35:05:d6",
                    "name": "s4-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000004"
                }]
            }, {
                "id": "0000000000000001",
                "label": "Device 1",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "da:90:cc:d0:39:99",
                    "name": "s1-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "9e:8e:ae:9d:58:37",
                    "name": "s1-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "02:9f:03:7b:77:90",
                    "name": "s1-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "fe:25:08:98:19:f8",
                    "name": "s1-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000001"
                }]
            }]
        }, "0000000000000003": {
            "id": "0000000000000003",
            "label": "Device 3",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "6e:06:8b:11:d8:f3",
                "name": "s3-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000003"
            }, {
                "hw_addr": "02:8e:c1:85:11:27",
                "name": "s3-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000003"
            }],
            "links": [{
                "id": "0000000000000001",
                "label": "Device 1",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "da:90:cc:d0:39:99",
                    "name": "s1-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "9e:8e:ae:9d:58:37",
                    "name": "s1-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "02:9f:03:7b:77:90",
                    "name": "s1-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "fe:25:08:98:19:f8",
                    "name": "s1-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000001"
                }]
            }, {
                "id": "0000000000000004",
                "label": "Device 4",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "d2:8e:e5:68:49:76",
                    "name": "s4-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "9e:34:a9:64:c5:b2",
                    "name": "s4-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "ae:c0:18:5d:6a:ac",
                    "name": "s4-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000004"
                }, {
                    "hw_addr": "aa:0f:c4:35:05:d6",
                    "name": "s4-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000004"
                }]
            }]
        }, "0000000000000004": {
            "id": "0000000000000004",
            "label": "Device 4",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "d2:8e:e5:68:49:76",
                "name": "s4-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "9e:34:a9:64:c5:b2",
                "name": "s4-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "ae:c0:18:5d:6a:ac",
                "name": "s4-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "aa:0f:c4:35:05:d6",
                "name": "s4-eth4",
                "port_no": "00000004",
                "dpid": "0000000000000004"
            }],
            "links": [{
                "id": "0000000000000003",
                "label": "Device 3",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "6e:06:8b:11:d8:f3",
                    "name": "s3-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000003"
                }, {
                    "hw_addr": "02:8e:c1:85:11:27",
                    "name": "s3-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000003"
                }]
            }, {
                "id": "0000000000000002",
                "label": "Device 2",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "9e:bb:54:e1:53:7d",
                    "name": "s2-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000002"
                }, {
                    "hw_addr": "e2:82:07:09:d2:0b",
                    "name": "s2-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000002"
                }]
            }, {
                "id": "0000000000000001",
                "label": "Device 1",
                "image": "/images/router.png",
                "shape": "image",
                "ports": [{
                    "hw_addr": "da:90:cc:d0:39:99",
                    "name": "s1-eth1",
                    "port_no": "00000001",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "9e:8e:ae:9d:58:37",
                    "name": "s1-eth2",
                    "port_no": "00000002",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "02:9f:03:7b:77:90",
                    "name": "s1-eth3",
                    "port_no": "00000003",
                    "dpid": "0000000000000001"
                }, {
                    "hw_addr": "fe:25:08:98:19:f8",
                    "name": "s1-eth4",
                    "port_no": "00000004",
                    "dpid": "0000000000000001"
                }]
            }]
        }
    }
};

export default mocks;