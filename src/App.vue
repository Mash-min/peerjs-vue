<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid container">
      <form @submit.prevent="joinRoom(roomID)">
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
      <!-- <ul>
        <li v-for="peer in connectedPeers" :key="peer">
          <small v-if="peer == myRoomID">You joined the conversation.</small>
          <small v-else>{{ peer }} joined the conversation.</small>
        </li>
      </ul> -->
      <div class="col-md-6">
        <small class="fw-bolder">You:</small>
        <div id="host-video"></div>
      </div>
      <div class="col-md-6">
        <small class="fw-bolder">Connected users:</small>
        <div id="members-video"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import Peer from 'peerjs'
  import { v4 as uuidv4 } from 'uuid'

  const peer = new Peer(uuidv4())
  const myRoomID = ref('')
  const roomID = ref('')
  const connectedPeers = ref([])

  onMounted(() => {
    startCamera()

    // Start peer connection
    peer.on('open', (id) => {
      myRoomID.value = id
    })

    // Triggers when someone joins our room
    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        call.answer(stream)
        call.on('stream', stream => {
          if(!connectedPeers.value.includes(call.peer)) {
            addVideo(stream, 'members-video')
            connectedPeers.value.push(call.peer)

            // Send peers to all connected users
            connectedPeers.value.forEach(connectedPeerID => {
              const conn = peer.connect(connectedPeerID)
              conn.on('open', () => {
                conn.send({
                  arrays: connectedPeers.value
                })
              })
            })
          }
        })
      })
    })

    // Triggers when someone tries to send data
    peer.on('connection', conn => {
      conn.on('data', data => {
        console.log({ connected_peers: data.arrays })
        data.arrays.forEach(connectedPeers => {
          joinRoom(connectedPeers)
        })
      })
    })

  })
  
  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
      addVideo(stream, 'host-video')
    })
  }

  const joinRoom = (roomID) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      const call = peer.call(roomID, stream)
      call.on('stream', stream => {
        if(!connectedPeers.value.includes(call.peer)) {
          addVideo(stream, 'members-video')
          connectedPeers.value.push(call.peer)
        }
      })
    })
  }

  const addVideo = (stream, elementID) => {
    const video = document.createElement('video')
    video.setAttribute('id', stream.id)
    video.srcObject = stream
    video.play()
    document.getElementById(elementID).append(video)
  }

</script>

<style>
  #host-video video {
    width: 100%!important;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }

  #members-video video {
    width: 50%!important;
    padding: 5px;
    border-radius: 5px;
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg); /* Safari and Chrome */
  }
</style>