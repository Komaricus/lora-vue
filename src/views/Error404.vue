<template>
  <div class="error-404">
    <h1>Oops...</h1>
    <span>404</span>
    <p>Page Not Found</p>
    <button type="button" @click="$router.push('/')">Take me back</button>
  </div>
</template>

<script>
  export default {
    name: "Error404"
  }
</script>

<style lang="scss" scoped>
  .error-404 {
    height: 100vh;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    span {
      color: #42b983;
      font-size: 100px;
    }

    h1 {
      margin-bottom: 1rem;
    }

    p {
      margin-bottom: 2rem;
    }
  }
</style>