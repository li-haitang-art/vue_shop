<template>
    <div>
    <!-- 面包屑导区域 -->
      <el-breadcrumb class="el-breadcrumb" separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card class="el-card">
          <el-row>
              <el-col>
                  <el-button type="primary">添加角色</el-button>
              </el-col>
          </el-row>
          <el-table :data="rolesList" border stripe class="el-table">
              <el-table-column type="expand">
                  <template slot-scope="scope">
                      <el-row :class="['bdbottom',i1=== 0 ? 'bdtop' : '','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                          <!-- 渲染一级权限 -->
                          <el-col :span="5">
                              <el-tag class="el-tag" closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                              <i class="el-icon-caret-right"></i>
                          </el-col>
                           <!-- 渲染二级权限 -->
                          <el-col :span="19">
                              <el-row :class="[i2=== 0 ? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                  <el-col :span="6">
                                      <el-tag class="el-tag" type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                  </el-col>
                                  <el-col :span="18">
                                      <el-tag type="warning" v-for="(item3,i3) in item2.children" 
                                      :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                                          {{item3.authName}}
                                      </el-tag>
                                  </el-col>
                              </el-row>
                          </el-col>
                      </el-row>
                  </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="角色名称" prop="roleName"></el-table-column>
              <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
              <el-table-column label="操作" prop="level">
                  <template slot-scope="scope" width="300px">
                      <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                      <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                      <el-button size="mini" type="warning " icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
                  </template>
              </el-table-column>
          </el-table>
      </el-card>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" 
      :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 default-expand-all默认展开所有树形控件，show-checkbox出现复选框，
        data显示所用的数据，default-checked-keys树形控件默认选中的复选框-->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox 
        node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>   
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="allotRights">确定</el-button>
        </span>
      </el-dialog>
      </div>
</template>

<script>
export default {
    data(){
        return{
            rolesList:[],
            setRightDialogVisible : false,
            rightsList : [],
            //树形控件的属性绑定对象
            treeProps : {
                label:'authName',
                children : 'children'
            },
            //默认选中的节点Id值数组
            defkeys:[],
            //当前即将分配角色的权限id
            roleId : ''
        }
    },created(){
        this.getRolesList();
    },
    methods:{
        async getRolesList(){
            await this.$http.get('roles').then((res) => {
                if(res.data.meta.status !=200){
                    this.$message.error('获取角色列表失败！');
                }else{
                    this.rolesList = res.data.data
                }
            })
        },
    //根据id删除对应的权限
    async removeRightById(role,rightId){
        //根据弹框是否删除对应权限
        const confirmResult = await this.$confirm('此操作将永久删除该文件','是否继续？','提示',{
            $confirmButtonText:'确定',
            cancelButtonText : '取消',
            type : 'warning' 
        }).catch(err=>err)
        if(confirmResult !=='confirm'){
            return this.$message.info('取消了权限删除！')
        }else{
           await this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res=>{
               if(res.data.meta.status !==200){
                   return this.$message.error('删除权限失败！')
               }else{
                   //this.getRolesList();
                   role.children = res.data.data;
               }
           })
        }
    },
    //展示分配权限的对话框
    async showSetRightDialog(role){
        this.roleId = role.id;
        //获取所有权限的数据
        await this.$http.get('/rights/tree').then(res=>{
            if(res.data.meta.status!==200){
                return this.$message.error('获取权限数据失败！')
            }
                //console.log(res.data.data)
                this.rightsList = res.data.data;
                this.getLeafKeys(role,this.defkeys);
            this.setRightDialogVisible = true;
        })
        
    },
    //通过递归的形式，获取角色下所有三级权限id，并保存到defKeys数组中
        getLeafKeys(node,arr){
            //如果当前node节点不包含children属性则是三级节点
            if(!node.children){
                return arr.push(node.id)
            }
            node.children.forEach(item =>this.getLeafKeys(item,arr));
        },
        //监听分配权限对话框的关闭事件
        setRightDialogClosed(){
            this.defkeys = [];
        },
        //点击为角色分配的权限
        async allotRights(){
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            //onsole.log(keys);
            const idStr = keys.join(',');
            await this.$http.post(`roles/${this.roleId}/rights`,{
                rids:idStr
            }).then(res=>{
                if(res.data.meta.status!=200){
                    return this.$message.error('分配权限失败！')
                }
                this.$message.success('分配权限成功！')
                this.getRolesList();
                this.setRightDialogVisible = false;
            })
        }
    }
    
}
</script>

<style>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: solid 1px #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
/* 设置垂直上的居中 */
.vcenter{
    display: flex;
    align-items: center;
}
</style>