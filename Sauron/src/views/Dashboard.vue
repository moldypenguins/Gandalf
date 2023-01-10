
<template>
  <article id="dashboard">
    <section>
      <h2>Dashboard</h2>
      <div class="content">
        <p>
          <a id="popoverButton" class="text-success" href="#" role="button" data-bs-toggle="popover" title="Wait!" data-bs-content="More to come.">Greetings {{username}}</a>
        </p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <p>
          <button class="btn btn-danger" @click="logout">Logout</button>
        </p>
      </div>
    </section>
  </article>
</template>

<script>
export default {
  data() {
    return {
      username: 'moldypenguins'//window.user
    }
  },
  methods: {
    logout() {
      window.user = null
      this.$router.push({ name: 'Login' })
    }
  },
  mounted() {
    console.log(`Home page mounted.`)
  }
}
</script>
