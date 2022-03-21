<template>
  <div class="container mt-5">
    <div class="row">
      <h5>Room ID: <span class="text-success">{{ roomID }}</span></h5>
      <hr>
      <div class="col-md-4">
        <small class="fw-bolder">You:</small>
        <div id="host"></div>
      </div>
      <div class="col-md-4">
      <small class="fw-bolder">Connected Peers:</small>
      <ul>
        <li v-for="peer in connectedPeers" :key="peer">
          <small class="fw-bolder">
            {{ peer }}
          </small>
        </li>
      </ul>
      </div>
      <div class="col-md-4">
        <form @submit.prevent="sendMessage">
          <div class="input-group">
          <input type="text" placeholder="Enter message" class="form-control" v-model="message">
          <button class="btn btn-primary" type="submit">Send</button>
          </div>
        </form>
        <ul>
          <li v-for="message in messages" :key="message">
            {{ message }}
          </li>
        </ul>
      </div>
      <div class="col-md-12">
        <small class="fw-bolder">Connected users:</small>
        <div id="members"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Peer from 'peerjs'
import { v4 as uuidv4 } from 'uuid'

const peer = new Peer(uuidv4())
const roomID = ref('')
const connectedPeers = ref([])
const message = ref('')
const messages = ref([])

onMounted(() => {
  // Start peer
  peer.on('open', id => roomID.value = id)
  // Start user camera
  openCamera()
  
  // Triggers when someone tries to connect to our room
  peer.on('call', call => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      call.answer(stream)
      call.on('stream', (stream) => {
        connectedPeers.value.push(call.peer)
        createVideoElement(stream, 'members', call.peer)
        broadcastPeer(call.peer)
      })
    })
  })
})

//  Start user Camera
const openCamera = () => {
  // navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  // .then(stream => {
  //   createVideoElement(stream, 'host', 'host-video')
  // })
}

// Create video element
const createVideoElement = (stream, domID, id) => {
  const video = document.createElement('video')
  video.srcObject = stream
  video.play()
  video.setAttribute('id', id)
  video.setAttribute('class', 'member-video')
  document.getElementById(domID).append(video)
}

// Broadcast newly joined peer to all connected user
const broadcastPeer = (peerID) => {
  connectedPeers.value.forEach(connectedPeer => {
    const conn = peer.connect(connectedPeer)
    conn.on('open', () => {
      conn.send({
        data: {
          type: 'broadcast',
          peerID: peerID,
          connectedPeers: connectedPeers.value
        }
      })
    })
  })
}

const sendMessage = () => {
  connectedPeers.value.forEach(connectedPeer => {
    const conn = peer.connect(connectedPeer)
    conn.on('open', () => {
      conn.send({
        data: {
          type: 'msg',
          message: message.value
        }
      })
    })
  })
}

</script>

<style>
  #host video {
    width: 100%!important;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }

  #members video {
    width: 25%!important;
    padding: 5px;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }
</style>