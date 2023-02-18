<template>
  <header>
    <div class="container-fluid">
      <nav class="navbar navbar-light navbar-expand-md" role="navigation">
        <div class="container-fluid">
          <router-link to="/" class="navbar-brand">
            <img class="d-inline-block" width="40" height="40" src="/logo.png" alt="Gandalf" />
            <span>{{alliance_name}}</span>
          </router-link>
          <div class="navbar-toggle">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
          <div class="collapse navbar-collapse justify-content-end" id="navbarContent">
            <ul class="navbar-nav">
              <li class="nav-item"><router-link to="/mem" class="nav-link">Members</router-link></li>
              <li class="nav-item"><router-link to="/uni" class="nav-link">Universe</router-link></li>
              <li class="nav-item dropdown">
                <div class="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">Help</div>
                <ul class="dropdown-menu">
                  <li class="nav-item"><router-link to="/about" class="nav-link">About</router-link></li>
                  <li class="nav-item"><router-link to="/admin" class="nav-link">Admin</router-link></li>
                </ul>
              </li>
            </ul>
          </div>
          <button type="button" class="btn bg-white ms-3" data-bs-toggle="offcanvas" data-bs-target="#offcanvasProfile">Profile</button>
        </div>
      </nav>
    </div>
  </header>

  <main>
    <div class="container-fluid">
      <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasProfile" aria-labelledby="offcanvasProfileLabel">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasProfileLabel">Edit Profile</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div>
            moldypenguins
          </div>
          <div>
            <input type="text" value="1:7:5" />
          </div>
          <div class="dropdown mt-3">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
              Actions
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><a class="dropdown-item" href="#">Save Profile</a></li>
              <li><a class="dropdown-item" href="#">Request Scans</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="alert alert-success my-2 mx-3 d-none" role="alert">
        <h4 class="alert-heading">Well done!</h4>
        <p>Aww yeah, you successfully read this important alert message.</p>
        <hr>
        <p class="mb-0">Whenever you need to, be sure to use margin utilities to keep things nice and tidy.</p>
      </div>
      <router-view :key="$route.path"></router-view>
    </div>
  </main>

  <footer>
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center">
        <div class="footer-tab show">
          <fa-icon icon="fa-solid fa-clock" />&nbsp;<b>1</b>
        </div>
        <div class="footer-tab show">
          <fa-icon icon="fa-solid fa-crosshairs" />&nbsp;<strong><a href="/att/daec29ae9bede5260b9e8a6c2db4dee2">1</a></strong>
        </div>
        <div class="footer-tab show">
          <fa-icon icon="fa-solid fa-globe-americas" />&nbsp;<strong><a href="/uni/c/1">1</a><span class="separator">:</span><a href="/uni/g/1/1">1</a><span class="separator">:</span><a href="/uni/p/1/1/1">1</a></strong>
        </div>
      </div>
    </div>
  </footer>

</template>

<script>
import Config from 'galadriel';
export default {
  name: 'Sauron',
  // reactive state
  data() {
    return {
      alliance_name: Config.alliance.name
    }
  },
  // lifecycle hooks
  mounted() {
    console.log(`Application mounted.`);
  }
}
</script>