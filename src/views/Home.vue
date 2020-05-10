<template>
  <div class="home">
    <img alt="logo" src="../assets/main-logo.svg">
    <p>This application shows Lora-network emulation in real time.</p>
    <button type="button" @click="$router.push('/topology')">Get in it</button>
  </div>
</template>

<script>
  export default {
    name: 'Home'
  }
</script>
<style lang="scss" scoped>
  .home {
    height: 100vh;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    img {
      max-width: 200px;
      margin-bottom: 2rem;
    }

    h1 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 2rem;
    }
  }
</style>