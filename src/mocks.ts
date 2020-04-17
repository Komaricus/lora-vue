import config from "@/config";

const mocks = {
    nodes: [{
        "id": "0000000000000001",
        "label": "Device 1",
        "image": "/images/router.png",
        "shape": "image"
    }, {
        "id": "0000000000000002",
        "label": "Device 2",
        "image": "/images/router.png",
        "shape": "image"
    }, {
        "id": "0000000000000003",
        "label": "Device 3",
        "image": "/images/router.png",
        "shape": "image"
    }, {"id": "0000000000000004", "label": "Device 4", "image": "/images/router.png", "shape": "image"}],
    edges: [{
        "from": "0000000000000001",
        "to": "0000000000000003",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}}
    }, {
        "from": "0000000000000001",
        "to": "0000000000000004",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}}
    }, {
        "from": "0000000000000004",
        "to": "0000000000000003",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}}
    }, {
        "from": "0000000000000002",
        "to": "0000000000000004",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}}
    }, {
        "from": "0000000000000001",
        "to": "0000000000000002",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}}
    }],
    devices: {
        "0000000000000001": {
            "id": "0000000000000001",
            "label": "Device 1",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "ca:0f:61:78:04:94",
                "name": "s1-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "72:a0:21:9e:3a:be",
                "name": "s1-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "76:4f:23:ad:61:fa",
                "name": "s1-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000001"
            }, {"hw_addr": "1e:75:bd:bb:45:c3", "name": "s1-eth4", "port_no": "00000004", "dpid": "0000000000000001"}],
            "links": [{
                "id": "0000000000000003",
                "label": "Device 3",
                "srcPort": "s1-eth4",
                "dstPort": "s3-eth1"
            }, {
                "id": "0000000000000004",
                "label": "Device 4",
                "srcPort": "s1-eth3",
                "dstPort": "s4-eth2"
            }, {"id": "0000000000000002", "label": "Device 2", "srcPort": "s1-eth2", "dstPort": "s2-eth1"}]
        },
        "0000000000000002": {
            "id": "0000000000000002",
            "label": "Device 2",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "52:ab:69:3b:a5:75",
                "name": "s2-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000002"
            }, {"hw_addr": "b6:9d:bc:f6:8a:bc", "name": "s2-eth2", "port_no": "00000002", "dpid": "0000000000000002"}],
            "links": [{
                "id": "0000000000000004",
                "label": "Device 4",
                "srcPort": "s2-eth2",
                "dstPort": "s4-eth1"
            }, {"id": "0000000000000001", "label": "Device 1", "srcPort": "s2-eth1", "dstPort": "s1-eth2"}]
        },
        "0000000000000003": {
            "id": "0000000000000003",
            "label": "Device 3",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "f6:b3:e4:10:7a:df",
                "name": "s3-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000003"
            }, {"hw_addr": "6e:29:67:4c:18:28", "name": "s3-eth2", "port_no": "00000002", "dpid": "0000000000000003"}],
            "links": [{
                "id": "0000000000000004",
                "label": "Device 4",
                "srcPort": "s3-eth2",
                "dstPort": "s4-eth3"
            }, {"id": "0000000000000001", "label": "Device 1", "srcPort": "s3-eth1", "dstPort": "s1-eth4"}]
        },
        "0000000000000004": {
            "id": "0000000000000004",
            "label": "Device 4",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "8e:b7:d0:8f:18:fe",
                "name": "s4-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "da:8f:be:78:54:2c",
                "name": "s4-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "de:10:4a:75:5b:f4",
                "name": "s4-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000004"
            }, {"hw_addr": "aa:fc:ae:d5:0a:96", "name": "s4-eth4", "port_no": "00000004", "dpid": "0000000000000004"}],
            "links": [{
                "id": "0000000000000003",
                "label": "Device 3",
                "srcPort": "s4-eth3",
                "dstPort": "s3-eth2"
            }, {
                "id": "0000000000000002",
                "label": "Device 2",
                "srcPort": "s4-eth1",
                "dstPort": "s2-eth2"
            }, {"id": "0000000000000001", "label": "Device 1", "srcPort": "s4-eth2", "dstPort": "s1-eth3"}]
        }
    },
    linksMap: {
        "0000000000000001_0000000000000003": true,
        "0000000000000001_0000000000000004": true,
        "0000000000000004_0000000000000003": true,
        "0000000000000002_0000000000000004": true,
        "0000000000000001_0000000000000002": true
    },
    nodesIndexes: {"0000000000000001": 0, "0000000000000002": 1, "0000000000000003": 2, "0000000000000004": 3}
};

export default mocks;