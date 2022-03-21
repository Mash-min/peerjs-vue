<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid container">
      <router-link to="/create-room" class="btn btn-success">Create room</router-link>
      <router-link to="/join-room" class="btn btn-primary">Join room</router-link>
    </div>
  </nav>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>