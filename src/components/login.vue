!<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      //  这是登录表单的数据绑定对象
      loginForm: {
        username: '',
        password: ''
      },
      // 这是表单的验证规则
      loginFormRules: {
        //验证用户名是否合法
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度3 到 10个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度6 到 15个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    resetLoginForm() {
      //this.$refs表示调用当前对象的默认引用，在el-form标签中使用ref='loginFormRef',resetFields是表单的重置方法
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      //表单验证
      this.$refs.loginFormRef.validate(async valid => {
        if (valid) {
          await this.$http.post('login', this.loginForm).then(res => {
            //console.log(res)
            if (res.data.meta.status == 200) {
              //console.log('登录成功');
              this.$message.success(res.data.meta.msg)
              //1.将登录成功之后的 token，保存到客户端的 sessionStorage中
              //1.1 项目中除了登录之外的其他API接口，必须在登陆之后才能访问
              // 1.2token只应在当前网站打开期间生效，所以将token保存在sessionStorage中
              window.sessionStorage.setItem('token', res.data.data.token)
              //2.通过编程式导航跳跳转到后台主页，路由地址是/home
              this.$router.push('/home')
            } else {
              this.$message.error(res.data.meta.msg)
            }
          })
        } else {
          return
        }
      })
    }
  }
}
</script>

<style>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  height: 130px;
  border: 1px solid #eee;
  width: 130px;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
.avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
/* 让按钮居右对齐 */
.btns {
  display: flex;
  justify-content: flex-end;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>