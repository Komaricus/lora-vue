<template>
  <div class="nav-bar">
    <button class="icon" @click="toggleLeftMenu">
      <span class="mdi mdi-menu"/>
    </button>

    <a href="/"><img alt="logo" src="../assets/logo.svg" style="height: 50px; padding: 5px"></a>
    <button v-if="$route.name === 'Topology'" :disabled="$store.getters.getLoading" style="margin-left: auto;" @click="$emit('add-link-clicked')">
      <span class="mdi mdi-plus"/>
      Add Link
    </button>
    <button v-if="$route.name === 'Topology'" :disabled="$store.getters.getLoading" style="margin-left: 10px" @click="$emit('add-node-clicked')">
      <span class="mdi mdi-plus"/>
      Add Device
    </button>
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
    position: absolute;
    height: 60px;
    width: calc(100% - 40px);
    background-color: #FFF;
    box-shadow: $shadow;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-items: start;
    padding: 0 20px;
  }
</style>