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
    }, {
        "id": "0000000000000004",
        "label": "Device 4",
        "image": "/images/router.png",
        "shape": "image"
    }],
    edges: [{
        "from": "0000000000000001",
        "to": "0000000000000003",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}},
        "id": "fc646c12-cca4-429c-ba78-8137a32f1c94"
    }, {
        "from": "0000000000000001",
        "to": "0000000000000004",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}},
        "id": "25fee2e2-fb63-4e0d-b62b-c11462c877a1"
    }, {
        "from": "0000000000000004",
        "to": "0000000000000003",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}},
        "id": "c6cbf98a-f456-4d12-8868-67e6ed3fe3cf"
    }, {
        "from": "0000000000000002",
        "to": "0000000000000004",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}},
        "id": "38f165e1-fe8d-49c4-af17-bf67eef9f59e"
    }, {
        "from": "0000000000000001",
        "to": "0000000000000002",
        "length": 300,
        "arrows": {"to": {"enabled": true, "type": "triangle"}, "from": {"enabled": true, "type": "triangle"}},
        "id": "4cab6cc1-4e55-4dbf-8b83-d93ae14d8741"
    }],
    devices: {
        "0000000000000001": {
            "id": "0000000000000001",
            "label": "Device 1",
            "image": "/images/router.png",
            "shape": "image",
            "ports": [{
                "hw_addr": "1e:8d:d5:d7:55:39",
                "name": "s1-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "6e:4a:c8:71:c6:33",
                "name": "s1-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000001"
            }, {
                "hw_addr": "a2:bc:bf:05:7e:b9",
                "name": "s1-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000001"
            }, {"hw_addr": "26:26:5b:14:63:68", "name": "s1-eth4", "port_no": "00000004", "dpid": "0000000000000001"}],
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
                "hw_addr": "ca:29:27:ea:ec:6e",
                "name": "s2-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000002"
            }, {"hw_addr": "a2:fa:a1:6a:e2:cc", "name": "s2-eth2", "port_no": "00000002", "dpid": "0000000000000002"}],
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
                "hw_addr": "a2:53:3f:04:88:4c",
                "name": "s3-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000003"
            }, {"hw_addr": "02:32:3a:57:91:1b", "name": "s3-eth2", "port_no": "00000002", "dpid": "0000000000000003"}],
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
                "hw_addr": "b2:68:ac:75:b4:80",
                "name": "s4-eth1",
                "port_no": "00000001",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "da:08:55:ed:6b:b9",
                "name": "s4-eth2",
                "port_no": "00000002",
                "dpid": "0000000000000004"
            }, {
                "hw_addr": "ae:f3:60:80:8f:48",
                "name": "s4-eth3",
                "port_no": "00000003",
                "dpid": "0000000000000004"
            }, {"hw_addr": "72:6b:a6:77:24:05", "name": "s4-eth4", "port_no": "00000004", "dpid": "0000000000000004"}],
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
    }
};

export default mocks;