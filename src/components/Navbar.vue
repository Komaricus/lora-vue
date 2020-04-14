<template>
  <div class="nav-bar">
    <button class="icon" @click="toggleLeftMenu">
      <span class="mdi mdi-menu"/>
    </button>

    <a href="/"><h1>Lora-Vue</h1></a>
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
    width: 100%;
    background-color: #FFF;
    box-shadow: $shadow;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-items: start;
    padding: 0 20px;
  }
</style>