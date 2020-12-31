import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import './assets/css/global.css'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/users.vue'
import Right from './components/power/Rights.vue'
import Roles from './components/power/roles.vue'
import Cate from './components/goods/Cate.vue'

Vue.use(Router)
 
const router =  new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path : '/',
      redirect : '/login'
    },
    {
      path:'/login',
      component:Login
    },{
      path : '/home',
      component : Home,
      redirect : '/welcome',
      children:[
        { path: "/welcome", component: Welcome},
        { path:'/users', component: Users },
        {path : '/rights',component:Right},
        {path : '/roles',component:Roles},
        {path : '/categories',component : Cate}
      ]
    }
  ]
})
router.beforeEach((to,from ,next)=>{
  //to 将要访问的路径
  //from 代表从哪个路径跳转而来
  //next 是一个函数，表示放行
  // next() 放行  next('/login')强制跳转
  if(to.path === '/login') return next();
  //获取const 
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login');
  next()
})
export default router
