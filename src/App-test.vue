<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid container">
      <form @submit.prevent="callUser(roomID)">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Enter room ID" v-model="roomID">
          <button class="btn btn-primary" type="submit">Call</button>
        </div>
      </form>
    </div>
  </nav>
  <div class="container mt-5">
    <div class="row">
      <small class="fw-bolder">Room ID: {{ myRoomID }}</small>
      <ul>
        <li v-for="peer in connectedPeers" :key="peer">
          <small v-if="peer == myRoomID">You joined the conversation.</small>
          <small v-else>{{ peer }} joined the conversation.</small>
        </li>
      </ul>
      <div class="col-md-6">
        <small class="fw-bolder">You:</small>
        <div id="user-video"></div>
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
import { v4 as uuidv4 } from 'uuid'
const peer = new Peer(uuidv4())

export default {
  name: 'App',
  data() {
    return {
      roomID: '',
      myRoomID: '',
      peerList: [],
      connectedPeers: []
    }
  },
  mounted() {
    // this.startCamera()

    // Start peer 
    peer.on('open', (id) => {
      this.myRoomID = id
    })

    // Triggers when someone tries to call
    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(stream => {
        call.answer(stream)
        call.on('stream', stream => {
          if(!this.peerList.includes(call.peer)) {
            const video = document.createElement('video')
            video.srcObject = stream
            video.play()
            document.getElementById('remote-video').append(video)
            this.peerList.push(call.peer)

            // Send all peers to all connected users
            this.connectedPeers.push(call.peer)
            this.connectedPeers.forEach(roomID => {
              const conn = peer.connect(roomID)
              conn.on('open', () => {
                conn.send({
                  arrays: this.connectedPeers
                })
              })
            })

          }
        })
      })
    }),

    // Triggers when some tries to send data
    peer.on('connection', (conn) => {
      conn.on('data', data => {
        console.log(data.arrays)
        data.arrays.forEach(roomID => {
          if(roomID != this.myRoomID) {
            this.callUser(roomID)
          }
        }) 
      })
    })

  },

  methods: {
    // Start host/user's camera
    startCamera() {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        const video = document.createElement('video')
        video.srcObject = stream
        document.getElementById('user-video').append(video)
        video.setAttribute('class', 'host')
        video.play()
        console.log(video.getVideoPlaybackQuality())
      })
    },

    // Call user via roomID
    callUser(roomId) {
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      .then(stream => {
        this.roomID = ''
        let call = peer.call(roomId, stream)
        call.on('stream', stream => {
          if(!this.peerList.includes(call.peer)) {
            console.log({ 
              stream: stream,
              call: call 
            })
            const video = document.createElement('video')
            this.addRemoteVideo(video, stream)
            this.peerList.push(call.peer)
          }
        })
      })
    },

    // Add connected user's video
    addRemoteVideo(video, stream) {
      video.srcObject = stream
      document.getElementById('remote-video').append(video)
      video.play()
    },
  }
}
</script>

<style>
  #user-video video {
    width: 100%!important;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }

  #remote-video video {
    width: 50%!important;
    padding: 5px;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }
</style>