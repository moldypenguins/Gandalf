

<template>
  <article id="login">
    <section>
      <h2>Login</h2>
      <div class="content">
        <form class="form" @submit.prevent="login">
          <label for="username">Username</label><br />
          <input v-model="username" name="username" type="text" class="input" /><br />
          <button class="btn btn-success">Login</button>
        </form>
      </div>
    </section>
  </article>
</template>

<script>
export default {
  data() {
    return {
      username: ''
    }
  },
  methods: {
    login() {
      window.user = this.username
      this.$router.push({ name: this.$route.redirectedFrom?.name || 'Dashboard' })
    }
  },
  mounted() {
    console.log(`Login page mounted.`);
  }
}

</script>
