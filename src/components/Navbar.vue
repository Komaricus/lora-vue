<template>
  <div class="nav-bar">
    <a href="/"><h1>Lora-Vue</h1></a>
  </div>
</template>

<script>
  export default {
    name: "Navbar"
  }
</script>

<style lang="scss" scoped>
  .nav-bar {
    top: 0;
    left: 0;
    position: absolute;
    height: 60px;
    width: 100%;
    background-color: #FFF;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-items: start;
    padding: 0 20px;
  }
</style>