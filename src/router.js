import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ListView from '@/views/ListView.vue'
import DetailView from '@/views/DetailView.vue'
import ReviewWriteView from '@/views/ReviewWriteView.vue'
import ReviewReWriteView from '@/views/ReviewReWriteView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/list',
    name: 'List',
    component: ListView
  },
  {
    path: '/detail/:id',
    name: 'Detail',
    component: DetailView
  },
  {
    path: '/review/write',
    name: 'ReviewWrite',
    component: ReviewWriteView
  },
  {
    path: '/review/edit/:id',
    name: 'ReviewReWrite',
    component: ReviewReWriteView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router