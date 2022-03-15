<template>
  <div class="container mt-5">
    <div class="row">
      <small class="fw-bolder">Room ID: {{ myRoomID }}</small>
      <div class="col-md-6">
        <small class="fw-bolder">You:</small>
        <div id="user-video"></div>
        <form @submit.prevent="callUser(roomID)">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Enter room ID" v-model="roomID">
            <button class="btn btn-primary" type="submit">Call</button>
          </div>
        </form>
      </div>
      <div class="col-md-6">
        <small class="fw-bolder">Connected users:</small>
        <div id="remote-video"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Peer from 'peerjs'

const peer = new Peer()

export default {
  name: 'App',
  data() {
    return {
      roomID: '',
      myRoomID: '',
      peerList: []
    }
  },
  mounted() {
    this.startCamera()

    peer.on('open', (id) => {
      this.myRoomID = id
    })

    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        call.answer(stream)
        call.on('stream', stream => {
          if(!this.peerList.includes(call.peer)) {
            const video = document.createElement('video')
            video.srcObject = stream
            video.play()
            document.getElementById('remote-video').append(video)
            this.peerList.push(call.peer)
          }
        })
      })
    })

  },

  methods: {
    startCamera() {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })
      .then(stream => {
        const video = document.createElement('video')
        video.srcObject = stream
        document.getElementById('user-video').append(video)
        video.play()
      })
    },

    callUser(roomId) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        let call = peer.call(roomId, stream)
        call.on('stream', stream => {
          if(!this.peerList.includes(call.peer)) {
            const video = document.createElement('video')
            this.addRemoteVideo(video, stream)
            this.peerList.push(call.peer)
          }
        })
      })
    },

    addRemoteVideo(video, stream) {
      video.srcObject = stream
      document.getElementById('remote-video').append(video)
      video.play()
    }
  }
}
</script>

<style>
  #user-video video {
    width: 100%!important;
    border-radius: 5px;
  }

  #remote-video video {
    width: 50%!important;
    padding: 5px;
    border-radius: 5px;
  }
</style>