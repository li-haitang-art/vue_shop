<template>
  <div>
      <!-- 面包屑导区域 -->
      <el-breadcrumb class="el-breadcrumb" separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 卡片视图区域 -->
      <el-card class="el-card">
         <!-- gutter设置列与列之间的距离，span占一行的24分之几-->
          <el-row :gutter="20">
              <el-col :span="7">
                <!-- 搜索与添加区域 -->
                <el-input placeholder="请输入内容" 
                v-model="queryInfo.query" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
              </el-col>
              <el-col :span="4">
                  <el-button type="primary" @click="addDialogVisible = true">添加用户 </el-button>
              </el-col>
          </el-row>
          <!-- 用户列表区 -->
          <el-table :data="userList" border stripe class="el-table">
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="姓名" prop="username"></el-table-column>
              <el-table-column label="邮箱" prop="email"></el-table-column>
              <el-table-column label="电话" prop="mobile"></el-table-column>
              <el-table-column label="角色" prop="role_name"></el-table-column>
              <el-table-column label="状态">
                  <!-- {{scope.row}}得到这一整行的所有数据 -->
                  <template slot-scope="scope">
                      <!-- {{scope.row}} -->
                      <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                  </template>
              </el-table-column>
              <el-table-column label="操作" width="180px">
                  <template slot-scope="scope"> 
                      <!-- 修改按钮 -->
                      <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
                      <!-- 删除按钮 -->
                      <el-button type="danger" icon="el-icon-delete"  size="mini" @click="removeUserById(scope.row.id)"></el-button>
                      <!-- 分配角色按钮,effect="dark"提示框背景色为黑色，
                      content="分配角色"提示文字内容，placement="top"在上方显示，
                      enterable="false"鼠标是否可以进入提示框中，默认为true -->
                      <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting"  size="mini" 
                        @click="setRole(scope.row)"></el-button>
                      </el-tooltip>
                  </template>
              </el-table-column>
          </el-table>

          <!-- 分页区域 -->
          <el-pagination class="el-pagination" @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
          :current-page="queryInfo.pagenum" 
          :page-sizes="[1,2,5,10]" 
          :page-size="queryInfo.pagesize" 
          layout="total,sizes,prev,pager,next,jumper" :total="total">

          </el-pagination>
      </el-card>
        <!-- 添加用户的对话框，:visible.sync=""用于保存对话框的显示于隐藏，dialogVisible是个布尔值 -->
      <el-dialog title="添加用户" 
      :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" 
        label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="adduser">确定</el-button>
        </span>
      </el-dialog>
      <!-- 修改用户的对话框 -->
       <el-dialog title="修改用户" 
      :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" 
        label-width="70px">
            <el-form-item label="用户名">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item> 
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="editUserInfo">确定</el-button>
        </span>
      </el-dialog>
      <!-- 这是分配角色的对话框 -->
      <el-dialog title="分配角色" 
      :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
        <div>
            <p>当前的用户：{{userInfo.username}}</p>
            <p>当前的角色：{{userInfo.role_name}}</p>
            <p>分配新角色：
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in rolesList" :key="item.id" 
                    :label="item.roleName" :value="item.id"></el-option>
                </el-select>  
            </p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default { 
    data(){
        //验证邮箱的规则
        var checkEmail = (rule,value,cb)=>{
            //这是验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
            if(regEmail.test(value)){
                //合法邮箱
                return cb()
            }else{
                cb(new Error('请输入合法的邮箱'))
            }
        }
        //验证手机号的规则
        var checkMobile = (rule,value,cb)=>{
            //验证手机号的正则表达式
           const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678][18[0-9]|14[57])[0-9]{8}$/
            if(regMobile.test(value)){
                return cb()
            }else{
                return cb(new Error('请输入合法的手机号'))
            }
        }
        return{
            //获取用户列表的参数对象
            queryInfo:{
                query : '',
                //当前的页数
                pagenum : 1,
                //当前每页显示多少条数据
                pagesize: 2
            },
            userList : [],
            total : 0,
            //已选择的角色id值
            selectedRoleId : '',
            //控制修改对话框的显示于隐藏
            editDialogVisible:false,
            //控制添加对话框的显示于隐藏
            addDialogVisible : false,
            //控制分配角色对话框的显示与隐藏
            setRoleDialogVisible:false,
            //所有角色的数据列表
            rolesList:[],
            //添加用户的表单数据
            addForm:{
                username : '',
                password : '',
                email : '',
                mobile : ''
            },
            //查询到的用户信息对象
            editForm:{},
            //需要被分配权限的空对象
            userInfo:{},
            //添加表单的验证规则对象
            addFormRules:{
                username:[
                    {
                        required:true,message: '请输入用户名',trigger:'blur'
                    },
                    {
                        min : 3,max : 10,message : '用户名的长度在3到10之间',trigger:'blur'
                    }
                ],
                password:[
                     {
                        required:true,message: '请输入密码',trigger:'blur'
                    },
                    {
                        min : 6,max : 15,message : '用户名的长度在5到15之间',trigger:'blur'
                    }
                ],
                email:[
                    {
                        required:true,message: '请输入邮箱',trigger:'blur'
                    },
                    {
                        validator:checkEmail,trigger:'blur'
                    }
                ],
                mobile:[
                    {
                          required:true,message: '请输入手机号',trigger:'blur'
                    },{
                        validator:checkMobile,trigger:'blur'
                    }
                ]
            },
            editFormRules:{
                email:[
                    {
                        required:true,message: '请输入用户邮箱',trigger:'blur'
                    },
                    {
                       validator:checkEmail,trigger:'blur'
                    }
                ],
                mobile:[
                    {
                          required:true,message: '请输入手机号',trigger:'blur'
                    },{
                        validator:checkMobile,trigger:'blur'
                    }
                ]
            }
        }
    },
    created(){
        this.getUserList();
    },
    methods:{
        async getUserList(){
           await this.$http.get('users',{params: this.queryInfo }).then(res=>{
               console.log(res)
               if(res.data.meta.status==200){
                   this.userList = res.data.data.users;
                   this.total = res.data.data.total;
               }else{
                   this.$message.error(res.data.meta.msg)
               }
            })
        } ,//监听 pagesize改变的事件
            handleSizeChange(newSize){
                //console.log(newSize);
                this.queryInfo.pagesize = newSize;
                this.getUserList();
            },
            //监听页码值改变的事件
            handleCurrentChange(newPage){
                //console.log(newPage);
                this.queryInfo.pagenum = newPage;
                this.getUserList();
            },
            async userStateChanged(userInfo){
                //console.log(userInfo);
               await this.$http.put(`/users/${userInfo.id}/state/${userInfo.mg_state}`).then(res=>{
                   console.log(res);
                   if(res.data.meta.status==200){
                       this.$message.success('更新用户状态成功！');
                   }else{
                       userInfo.mg_state = !userInfo.mg_state;
                       this.$message.error('更新用户状态失败！');
                   }
               })
            },
            //监听添加用户对话框的关闭事件
            addDialogClosed(){
                this.$refs.addFormRef.resetFields();
            },
            //添加新用户
            async adduser(){
                await this.$refs.addFormRef.validate(valid=>{
                    //console.log(valid)
                    if(valid){
                        //可以发起添加用户的网络请求
                        this.$http.post('users',this.addForm).then(res=>{
                            if(res.data.meta.status!==201){
                                this.$message.error('用户添加失败');
                            }else{
                                this.$message.success('添加用户成功')
                                //隐藏添加用户的对话框
                                this.addDialogVisible = false;
                                //刷新列表
                                this.getUserList()
                            }
                        })
                    }else{ 
                        return;
                    }
                })
            },
            //展示编辑用户的对话框
            async showEditDialog(id){
                await this.$http.get('/users/' + id).then(res=>{
                    console.log(res);
                    if(res.data.meta.status!=200){
                        return this.$message.error('请求用户数据失败')
                    }else{
                        this.editForm = res.data.data;
                    }
                })
                this.editDialogVisible = true;
            },
            //监听修改用户对话框的关闭事假
            editDialogClosed(){
                this.$refs.editFormRef.resetFields();
            },
            //修改用户信息并提交
            async editUserInfo(){
               await this.$refs.editFormRef.validate(valid=>{
                    if(valid){
                        //发起修改信息的请求
                        this.$http.put('users/' +this.editForm.id,{
                            email:this.editForm.email,
                            mobile:this.editForm.mobile
                        }).then(res=>{
                            if(res.data.meta.status!==200){
                                return this.$message.error('更新用户信息失败！')
                            }else{
                                 //关闭对话框
                                 this.editDialogVisible = false
                                 //刷新数据列表
                                 this.getUserList();
                                 //修改成功
                                 this.$message.success('更新用户信息成功！')
                            }
                        })
                    }else{
                        return;
                    }
                })
            },
            async removeUserById(Id){
                var flag = '';
                //询问用户是否删除数据
                await this.$confirm('此操作将永久删除该用户，是否继续？','提示',{
                    confirmButtonText : '确定',
                    cancelButtonText : '取消',
                    type : 'warning'
                }).then(res=>{
                    //console.log('确认删除  ')
                    //如果用户确认删除，则返回值为字符串confirm
                    flag = res;
                    
                }).catch(err=>{
                    //如果用户确认取消，则返回值为字符串cancel
                    flag = err;
                })
                console.log(flag);
                if(flag=='confirm'){
                    await this.$http.delete('users/' + Id).then(res=>{
                        if(res.data.meta.status !==200){
                            this.$message.error('删除用户失败！')
                        }else{
                            this.$message.success('删除用户成功！')
                            this.getUserList();
                        }
                })
                }else{
                    return this.$message.info('已经取消删除');
                }
                
            },
            async setRole(userInfo){
                this.userInfo = userInfo;
                //获取所有的角色列表
                this.$http.get('roles').then(res=>{
                    if(res.data.meta.status!=200){
                        return this.$message.error('获取角色列表失败！');
                    }
                    this.rolesList = res.data.data;
                })
                this.setRoleDialogVisible = true;
            },
            //点击按钮分配角色
            async saveRoleInfo(){
                if(!this.selectedRoleId){
                   return this.$message.error('请选择要分配的角色')
                }
                await this.$http.put(`users/${this.userInfo.id}/role`,{
                    rid : this.selectedRoleId
                }).then(res=>{
                    if(res.data.meta.status!=200){ 
                        return this.$message.error('更新角色失败！')
                    }
                    this.$message.success('更新成功！')
                    this.getUserList();
                    this.setRoleDialogVisible = false;
                })
            },
            //监听分配角色对话框的关闭事件
            setRoleDialogClosed(){
                this.selectedRoleId = ''
                this.userInfo = {}
            }
    }
    
}
</script>