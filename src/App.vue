<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid container">
      <button class="btn btn-primary" @click="createRoom">Create room</button>
      <form @submit.prevent="joinRoom(newRoomID)">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Enter room ID" v-model="newRoomID">
          <button class="btn btn-primary" type="submit">Call</button>
        </div>
      </form>
    </div>
  </nav>
  <div class="container mt-5">
    <div class="row">
      <h5>Room ID: <span class="text-success">{{ roomID }}</span></h5>
      <ul>
        <small class="fw-bolder">Peers:</small>
        <li v-for="peer in connectedPeers" :key="peer">
          <small class="fw-bolder">
            {{ peer }}
          </small>
        </li>
      </ul>
      <div class="col-md-6">
        <small class="fw-bolder">You:</small>
        <div id="host"></div>
      </div>
      <div class="col-md-12">
        <small class="fw-bolder">Connected users:</small>
        <div id="members"></div>
      </div>
      <div class="col-md-4">
        <small class="fw-bolder">Chat:</small>
        <div class="card" v-for="message in messages" :key="message">
          <div class="card-body">
            {{ message.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Peer from 'peerjs'
import { v4 as uuidv4 } from 'uuid'

const peer = new Peer(uuidv4())
const newRoomID  = ref('')
const roomID = ref('')
const connectedPeers = ref([])
// const messages = ref([])
// const message = ref('')

onMounted(() => {
  // Start peer
  peer.on('open', id => roomID.value = id)
  // Start user camera
  openCamera()
  
  // Triggers when someone tries to connect to our room
  peer.on('call', call => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      connectedPeers.value.push(call.peer)  
      call.answer(stream)
      call.on('stream', (stream) => {
        createVideoElement(stream, 'members', call.peer)
        broadcastPeer(call.peer)
      })
    })
  })

  // Triggers when someone tries to send data
  peer.on('connection', conn => {
    conn.on('data', response => {
      if(!connectedPeers.value.includes(response.data.peerID)) joinRoom(response.data.peerID)
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

// Join to other users room
const joinRoom = (id) => {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    if(roomID.value !== id) {
      const call = peer.call(id, stream)
      call.on('stream', stream => {
        createVideoElement(stream, 'members', call.peer)
      })
    }
  })
}

// Broadcast newly joined peer to all connected user
const broadcastPeer = (peerID) => {
  connectedPeers.value.forEach(connectedPeer => {
    const conn = peer.connect(connectedPeer)
    conn.on('open', () => {
      conn.send({
        data: {
          type: 'broadcast',
          peerID: peerID
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