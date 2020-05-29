<template>
  <div>
    <Navbar/>
    <div class="side-menu">
      <p>Content</p>
      <div><a href="/about/#home">Home</a></div>
      <div><a href="/about/#topology">Topology</a></div>
      <div><a href="/about/#run-your-topology">Run your topology</a></div>
      <div><a href="/about/#analyze-it">Analyze it</a></div>
    </div>
    <div class="wrapper">
      <a id="home" class="anchor"></a>
      <h1>About</h1>
      <p>Welcome to the lora-vue about page!</p>

      <p>Here you can learn everything about lora-vue application! 🤩</p>

      <p>Lora-vue is network emulation web application using Vue. You can use it to make and test your own topologies.
        This wiki will explain the basics of working with lora-vue.</p>

      <p>Let`s get started! 🚀</p>

      <a id="topology" class="anchor"></a>
      <h2>Topology</h2>
      <p>Firstly, you need to know how to build your network topology. There are three type of topology components:</p>
      <ul style="padding-left: 30px;">
        <li>Hosts</li>
        <li>Switches</li>
        <li>Links</li>
      </ul>
      <p>Now let's consider each of them in more detail.</p>

      <h3>Hosts</h3>
      <p>Hosts in lora-vue are devices that produces traffic. They must be connected to switches with links, to be able
        for
        network devices. Hosts that available for network controller are green, unavailable hosts are red. You can
        select
        host in topology by clicking on it to see information about it in left side menu. Selected host is blue.</p>

      <p>Left side menu contains information about host: it`s MAC address, IP and linked device. Also here you can open
        host terminal and run command. Any Unix command available, for example you can run ifconfig or ping and any
        device
        name (for example s1 for Switch 1, or h1 for Host 1) to ping it.</p>

      <h3>Switches</h3>
      <p>Switches are devices that move traffic through the network. They also must be connected via links to be able
        for
        network devices. Switches coloring are same as hosts.</p>

      <p>In addition to information about switch, side left menu for switches includes several charts and ports list.
        You
        can also run commands for switches with terminal.</p>

      <h3>Links</h3>
      <p>Links in lora-vue are connections between devices: hosts and switches. Links can also be selected to watch
        their
        info or to navigate to devices. There are certain rules that links should follow, they will be discussed on the
        next page.</p>

      <h3>Conclusion</h3>
      <p>That`s it! Now you know what topologies are made of in lora-vue 😎</p>

      <a id="run-your-topology" class="anchor"></a>
      <h2>Run your topology</h2>
      <p>In lora-vue you can simply run your topology with Ryu controller and Mininet emulator. Then you open
        application first time, the default topology will be already running. There arre only two states or network
        statuses:</p>

      <ol style="padding-left: 30px;">
        <li>Emulation is running</li>
        <li>Emulation is stopped</li>
      </ol>

      <p>When network emulation is running, you can monitor your topology and analyze it. But to change topology, you
        need firstly stop it`s emulation. You can do it by pressing Stop button on top-left of application window.</p>

      <p>Now, when network emulation is stopped, you can change your topology. There are a bunch of things that you can
        do.</p>

      <h3>Adding new host</h3>
      <p>You can add new host to topology by pressing "Add Host" button on top-left of application window. When you
        clicked it, host creation mode will activated. You need to click anywhere on topology to add new host. Do not
        forget to connect host to switch, or it will not included to network emulation next time.</p>

      <h3>Adding new switch</h3>
      <p>You can also add new switch to topology by pressing "Add Switch" button. It works the same as with host
        creation. Pay your attention that new added switches or hosts not connected with network.</p>

      <h3>Adding new link</h3>
      <p>You can connect your devices by adding new link between them. It`s pretty simple, just press "Add Link" button
        to activate link adding mode, then click on first device you would like to connect and drag the link to another
        device. Your devices now connected and available for each other 😀.</p>

      <h3>Delete component</h3>
      <p>Moreover, you can delete any component you want. Delete button is in left side-menu with component info in
        Settings tab. Note: by deleting host or device you will also delete links, through which it is connected with
        other components.</p>

      <h3>Local saving</h3>
      <p>Then network is stopped Ryu controller does not watch topology changes, but don`t worry about it! Yout changes
        will be saved locally in browser.</p>
      <a id="analyze-it" class="anchor"></a>
      <h2>Analyze it</h2>
      <p>When you feel what your topology is ready for emulation - click "Start Emulation" button.</p>

      <p>Firstly lora-vue will connected to server, after that it will update devices MAC addresses, because MAC`s
        always generated on server side when starting topology emulation. After loading your topology is running and
        ready to be analyzed. So, what you can do? 🤔</p>

      <h3>Terminal</h3>
      <p>You can now start type and send your commands to devices through their terminals. This will send command on
        controller and render command response output. Any terminal can be opened in new tab by clicking "Open in new
        tab" button.</p>

      <h3>Charts</h3>
      <p>Charts provided information about devices and network emulation. There are three types of charts:</p>

      <ol style="padding-left: 30px;">
        <li>Battery chart - it shows the charge amount trend for device.</li>
        <li>Events chart - shows amount of package send events which controller captured.</li>
        <li>Packets chart - illustrates the packets count for every device flow.</li>
      </ol>

      <p>Each chart has two modes: real- and non- time. In realtime mode changes will be rendered in near real time with
        charts update timeout (see config). In non-realtime you can see all collected data and zoom chart. Amount of
        chart items in both modes can be changed in configuration file.</p>

      <h3>Flow</h3>
      <p>In Ryu controller OpenFlow switches have flows - it`s like path in network specified by controller. Flows are
        used by switches to retranslate data packages through network and other devices. You can see list of flow in
        flow tab of left side-menu. You can also create new flow or delete any of them.</p>

      <p>That`s how you can analyze your topology. When you think you want to test something else - press "Stop
        Emulation" button, change your topology and start emulation again! And so on, enjoy lora-vue! 😎</p>
    </div>
  </div>
</template>
<script>
  import Navbar from "../components/Navbar";

  export default {
    name: "Terminal",
    components: {
      'Navbar': Navbar,
    },
  }
</script>

<style scoped lang="scss">
  .wrapper {
    margin-top: 60px;
    padding: 30px;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  p {
    padding: 10px 0;
  }

  h2 {
    padding-top: 20px;
  }

  h3 {
    padding-top: 15px;
  }

  a.anchor {
    display: block;
    position: relative;
    top: -50px;
    visibility: hidden;
  }

  .side-menu {
    position: fixed;
    top: 60px;
    left: 0;
    padding: 15px;
    color: #42b983;

    a:hover {
      color: #2c3e50;
    }
  }

  @media screen and (max-width: 1200px) {
    .side-menu {
      display: none;
    }
  }
</style>
