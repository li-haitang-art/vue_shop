<template>
  <div>
      <!-- 面包屑导区域 -->
      <el-breadcrumb class="el-breadcrumb" separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{path:'/home'}">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品分类</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图 -->
      <el-card class="el-card">
          <el-row>
              <el-col>
                  <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
              </el-col>
          </el-row>
          <tree-table class="treeTable" :data="cateList" :columns="columns" 
          :selection-type="false" :expand-type="false" 
          show-index index-text="#" border 
          :show-row-hover="false">
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false" 
                style="color : lightgreen;"></i>
                 <i class="el-icon-error" v-else style="color : red;"></i>
            </template>
            <!-- 排序 -->
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                <el-tag type="success" size="mini" v-if="scope.row.cat_level===1">二级</el-tag>
                <el-tag type="warning" size="mini" v-if="scope.row.cat_level===2">三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon--delete" size="mini">删除</el-button>
            </template>
          </tree-table> 
           <!-- 分页区域 -->
          <el-pagination class="el-pagination" @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
          :current-page="queryInfo.pagenum" 
          :page-sizes="[3,5,10,15]" 
          :page-size="queryInfo.pagesize" 
          layout="total,sizes,prev,pager,next,jumper" :total="total">
          </el-pagination>
      </el-card>

      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" 
      :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addCateForm" :rules="addCateFormRules" 
        ref="addCateFormRef" 
        label-width="100px">
            <el-form-item label="分类名称：" prop="cat_name">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类：">
                <!-- options用来指定数据源 -->
                <!-- 用来指定配置对象,:props="cascaderProps" -->
                <el-cascader class="el-cascader" 
                    expand-trigger="hover"
                    :options="parentCateList" 
                    :props="cascaderProps"
                  v-model="selectedKeys" 
                 @change="parentCateChanged" clearable change-on-select></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="">
            <el-button @click="addCateDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="addCate">确定</el-button>
        </span>
      </el-dialog>
  </div>
</template>

<script>
export default {
    data(){
        return{
            //指定查询条件
            queryInfo:{
                type : 3,
                pagenum : 1,
                pagesize:5
            },
            //添加分类的表单数据对象
            addCateForm : {
                //要添加的分类名称
                cat_name : '',
                //父级分类id
                cat_pid : 0 ,
                //分类的等级，默认要添加的是1级分类
                cat_level:0
            },
            cascaderProps :{
                value : 'cat_id',
                label:'cat_name',
                children:'children'
            },
            //添加分类变淡的验证规则对象
            addCateFormRules:{
               cat_name:[{
                   required:true,message:'请输入分类名称',trigger:'blur'
               }] 
            },
            //选中的父级分类的Id数组
            selectedKeys:[],
            //控制添加分类对话框的显示与隐藏
            addCateDialogVisible : false,
            //父级分类的列表
            parentCateList:[],
            //商品分类的数据列表，默认为空
            cateList:[],
            //总数据条数
            total:0,
            columns:[
              { label : '分类名称',prop : 'cat_name'},
              {label : '是否有效',
                  //表示，将当前列定义为模板列
                  type : 'template',
                  //表示当前这一列使用模板名称
                  template : 'isok' },
              { label : '排序',
                  //表示，将当前列定义为模板列
                  type : 'template',
                  //表示当前这一列使用模板名称
                  template : 'order'},
              {label : '操作',
                  //表示，将当前列定义为模板列
                  type : 'template',
                  //表示当前这一列使用模板名称
                  template : 'opt'}
            ]
        }
    },
    created(){
        this.getCateList();
    },
    methods:{
        //获取商品分了的数据
        getCateList(){
            this.$http.get('categories',{params:this.queryInfo}).then(res=>{
                if(res.data.meta.status!=200){
                    return this.$messaga.error('获取商品数据列表失败！');
                }
                this.cateList = res.data.data.result;
                this.total = res.data.data.total;
            })
        },
        //监听pageSize的改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getCateList();
        },
        //监听pagenum改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getCateList();
        },
        showAddCateDialog(){
            this.getParentCateList();
            this.addCateDialogVisible = true;
        },
        //获取父级分类的数据列表
        async getParentCateList(){
            await this.$http.get('categories',{params:{type:2}}).then(res=>{
                if(res.data.meta.status!==200){
                    return this.$messaga.error('获取父级分类数据失败！')
                }
            this.parentCateList = res.data.data;
            })
        },
        parentCateChanged(){
            //如果selectedKeys数据中的length大于0，证明选中的父级分类
            //反之，就说明没有选中任何父级分类
            if(this.selectedKeys.length>0){
                //父级分类的id
              this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1];
              //为当前分类的等级赋值
              this.addCateForm.cat_level = this.selectedKeys.length;
              return;
            }else{
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
            }
        } ,
        addCate(){
            this.$refs.addCateFormRef.validate(async valid=>{
                if(!valid){
                    return;
                }
                await this.$http.post('categories',this.addCateForm).then(res=>{
                    if(res.data.meta.status !==201){
                        return this.$messaga.error('添加分类失败！');
                    }
                    this.$messaga.success('添加分类成功！');
                    this.getCateList();
                    this.addCateDialogVisible = false;
                })
            })
        },addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields();
            this.selectedKeys = []
            this.addCateForm.cat_level = 0;
            this.addCateForm.cat_pid = 0;
        }
    }
}
</script>

<style>
.treeTable{
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>