<template>
  <div>
    <Navbar/>
    <div class="wrapper">
      <h2 style="padding-bottom: 20px;">{{getTitle()}} terminal</h2>
      <terminal style="height: 100%" :device="{id: this.$route.params.dpid, host: this.$route.params.dpid.includes('h')}"/>
    </div>
  </div>
</template>

<script>
  import Navbar from "../components/Navbar";
  import Terminal from "../components/Terminal";

  export default {
    name: "Terminal",
    components: {
      'Navbar': Navbar,
      'terminal': Terminal
    },
    methods: {
      dpidToInt(dpid) {
        return Number("0x" + dpid);
      },
      getTitle() {
        if (this.$route.params.dpid.includes('h')) {
          return 'Host ' + this.dpidToInt(this.$route.params.dpid.replace('host', ''));
        } else {
          return 'Device ' + this.dpidToInt(this.$route.params.dpid);
        }
      }
    }
  }
</script>

<style scoped>
  .wrapper {
    margin-top: 60px;
    min-height: calc(100vh - 90px);
    height: calc(100vh - 90px);
    display: flex;
    flex-direction: column;
    padding: 15px;
  }
</style>