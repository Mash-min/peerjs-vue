import { createRouter, createWebHistory } from 'vue-router'
import CreateRoom from '@/views/CreateRoom'
import JoinRoom from '@/views/JoinRoom'

const routes = [
  {
    path: '/join-room',
    name: 'JoinRoom',
    component: JoinRoom
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: CreateRoom
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
