<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header class="el-Header">
            <div>
                <img src="../assets/heima.png"/>
                <span>电商后台管理系统</span>
            </div>
           <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'" class="el-aside">
                <div class="toggle-button" @click="toggleCollapse()">|||</div>
                <!-- unique-opend这是每次只能打开一个菜单项，默认为false。 
                collapse是否水平折叠手气菜单(仅在mode为vertical时可用)-->
                <el-menu background-color="#333744" text-color="#fff" 
                active-text-color="#409EFF" unique-opend 
                :collapse="isCollapse" :collapse-transition="false" 
                :default-active="activePath"
                router>
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" 
                        :key="subItem.id" @click="saveNavState('/'+subItem.path)">
                            <!-- 一级菜单的模板区域 -->
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                        </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main class="el-main">
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name : 'home',
    data(){
        return{
            menuList:[],
            iconsObj:{
                '125':'iconfont icon-user',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            //是否折叠
            isCollapse: false,
            activePath : ''
        }
    },
    created(){
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath');
    },
    methods:{
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        async getMenuList(){
            await this.$http.get('menus').then(res=>{
                console.log(res);
                if(res.data.meta.status==200){
                    this.menuList = res.data.data;
                }else{
                    this.$message.error(res.data.meta.msg);
                }
            })
        },
        //点击按钮，切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse;
        },
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath);
            this.activePath = activePath;
        }
    }
}
</script>

<style>
.el-Header{
    background-color: #373D41;
    display: flex;
    /* 左右对齐 */
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff; 
    font-size: 20px;
    
}
.el-Header div{
    display: flex;
    /* 垂直居中 */
    align-items: center;
}
.el-Header div span{ 
    margin-left: 15px;
}
.el-aside{
    background-color: #333744;
}
.el-aside .el-menu{
    border-right: none;
}
.el-main{
    background-color:#eaedf1 ;
}
.home-container{
    height: 100%;
}
.iconfont{
    margin-right: 10px;
}
.toggle-button{
    background-color:#4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>