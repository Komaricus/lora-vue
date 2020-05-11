<template>
  <div class="nav-bar">
    <el-button type="default" icon="mdi mdi-menu" @click="toggleLeftMenu" circle size="small"/>

    <a href="/"><img alt="logo" src="../assets/logo.svg" style="height: 40px; padding: 10px"></a>
    <el-button type="primary" size="medium" v-if="$route.name === 'Topology'" :disabled="$store.getters.getLoading" style="margin-left: auto;" @click="$emit('add-link-clicked')" icon="mdi mdi-plus">
      Add Link
    </el-button>
    <el-button type="primary" size="medium" v-if="$route.name === 'Topology'" :disabled="$store.getters.getLoading" style="margin-left: 10px" @click="$emit('add-node-clicked')" icon="mdi mdi-plus">
      Add Device
    </el-button>
  </div>
</template>

<script>
  export default {
    name: "Navbar",
    methods: {
      toggleLeftMenu() {
        this.$store.commit('setLeftMenu', !this.$store.getters.getLeftMenu);
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