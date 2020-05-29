<template>
  <div class="nav-bar">
    <el-button type="default" v-if="$route.name === 'Topology'" icon="mdi mdi-menu" @click="toggleLeftMenu" circle
               size="small"/>

    <a href="/"><img alt="logo" src="../assets/logo.svg" style="height: 40px; padding: 10px"></a>
    <router-link to="/about">
      <i style="font-size: 30px; color: #a0a3aa" v-if="$route.name !== 'About'" class="mdi mdi-help-circle-outline"></i>
    </router-link>
    <el-button :type="emulationStatus ? 'danger' : 'success'" size="medium" v-if="$route.name === 'Topology'"
               :disabled="$store.getters.getLoading" style="margin-left: auto;" @click="onEmulationButtonClicked"
               :icon="emulationStatus ? 'mdi mdi-stop' : 'mdi mdi-play'">
      {{emulationStatus ? 'Stop Emulation' : 'Start Emulation'}}
    </el-button>
    <el-button type="primary" size="medium" v-if="$route.name === 'Topology'"
               :disabled="emulationStatus || $store.getters.getLoading" @click="$emit('add-link-clicked')"
               icon="mdi mdi-plus">
      Add Link
    </el-button>
    <el-button type="primary" size="medium" v-if="$route.name === 'Topology'"
               :disabled="emulationStatus || $store.getters.getLoading" style="margin-left: 10px"
               @click="$emit('add-node-clicked')" icon="mdi mdi-plus">
      Add Device
    </el-button>
    <el-button type="primary" size="medium" v-if="$route.name === 'Topology'"
               :disabled="emulationStatus || $store.getters.getLoading" style="margin-left: 10px"
               @click="$emit('add-host-clicked')" icon="mdi mdi-plus">
      Add Host
    </el-button>
  </div>
</template>

<script>
  export default {
    name: "Navbar",
    props: {
      status: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        emulationStatus: false
      }
    },
    watch: {
      status() {
        this.emulationStatus = this.status;
      }
    },
    methods: {
      toggleLeftMenu() {
        this.$store.commit('setLeftMenu', !this.$store.getters.getLeftMenu);
      },
      onEmulationButtonClicked() {
        this.emulationStatus = !this.emulationStatus;
        this.$emit('emulation-status-changed', this.emulationStatus);
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../assets/styles/colors";

  .nav-bar {
    top: 0;
    left: 0;
    position: fixed;
    height: 60px;
    width: calc(100% - 40px);
    background-color: #FFF;
    border-bottom: #E4E7ED 1px solid;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-items: start;
    padding: 0 20px;
  }
</style>