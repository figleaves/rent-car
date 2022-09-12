<template>
 
 <!-- Form -->
  <el-dialog v-model="dialogFormVisible" 
    :show-close="false" 
    :close-on-click-modal="false" 
    :close-on-press-escape="false" 
    width="70%" title="Login">

    <el-form :model="loginForm">
      <el-form-item label="Email" :label-width="formLabelWidth">
        <el-input v-model="loginForm.email" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Password" :label-width="formLabelWidth">
        <el-input v-model="loginForm.password" autocomplete="off" />
      </el-form-item> 
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <!-- <el-button @click="dialogFormVisible = false">Cancel</el-button> -->
        <el-button type="primary" @click="onLogin">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

    <div class="title">
      <h2>rental a car</h2>
    </div>
    <div>
      <el-form :model="form" label-width="120px">
        <el-form-item label="car category">
          <el-select v-model="form.carCategeroyId" placeholder="select car category">
            <el-option
              v-for="item in carCategeroyIds"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="start end">
          <el-col :span="10">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="Pick a datetime"
              style="width: 60%"
            />
          </el-col>
          <el-col :span="4" class="text-center">
            <span class="text-gray-500">--</span>
          </el-col>
          <el-col :span="10">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="Pick a datetime"
              style="width: 60%"
            />
          </el-col>
        
          
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">Order</el-button>
        </el-form-item>
      </el-form>
    </div>

  <!--div class="table-box"-->
    <div class="title">
      <h2>rental car orders</h2>
    </div>
    <!--table-->
    <el-table :data="tableData" style="width:100%"> :strip="true">
      <el-table-column width="10" />
      <el-table-column prop="carCategory" label="Car Catetory" align="center" width="220" />
      <!-- <el-table-column prop="carPlate" label="Car Plate" width="100" /> -->
      <el-table-column prop="startTime" label="Start Datetime" align="center" width="220" />
      <el-table-column prop="endTime" label="End Datetime" align="center" width="220" />
      <el-table-column prop="createTime" label="Create Datetime" align="center" width="220">
    </el-table-column>
  </el-table>
  <!-- </div> -->
</template>

<script setup>

  import { ref,reactive } from "vue"
  import moment from 'moment-timezone'
  import request from "./utils/request.js"
  import { ElMessage } from "element-plus"

  const dialogFormVisible = $ref(false)
  const formLabelWidth = '140px'

  const loginForm = reactive({
    email: '',
    password: '',
  })

  let tableData = $ref([])

  let carCategeroyIds = $ref([])

  // do not use same name with ref
const form = reactive({
  categoryId: '',
  startTime: '',
  endTime: '',
})


const onLogin = async () => {
  if (!loginForm.email){
    ElMessage.error("Please input email first!")
    return
  }
  if (!loginForm.password){
    ElMessage.error("Please input password first!")
    return
  } 
  
  let res = await request.post('customer/login', {
      email: loginForm.email,
	    password: loginForm.password
    })
    if (null != res){
      dialogFormVisible = false
      localStorage.setItem('token', res)
    startData()
    }
}

const startData = () => {
  if (null != localStorage.getItem('token')){
    getCarCategoryData()
    getRentOrdersData()
  } else {
    dialogFormVisible = true
  }
}

const formatDatetimeToUtc = (datetime) => {
  let curTz = moment.tz.guess(true)
  return moment(datetime).tz(curTz).utc().format('YYYY-MM-DD HH:mm:ss')
  // return moment(datetime).format('YYYY-MM-DD HH:mm:ss')
}

const formatDatetimeToLocal = (datetime) => {
  let curTz = moment.tz.guess(true)
  return moment.utc(datetime).tz(curTz).format('YYYY-MM-DD HH:mm:ss') 
}

const onSubmit = () => {
  if (null == localStorage.getItem('token')){
    dialogFormVisible = true
    ElMessage.error("Please login first!")
    return
  }
  if (!form.carCategeroyId){
    ElMessage.error("Please choose car category first!")
    return
  }
  if (!form.startTime){
    ElMessage.error("Please choose startTime first!")
    return
  }
  // console.log(form.startTime)
  // console.log(moment(form.startTime).unix()*1000)
  // console.log(moment.now())
  // console.log(moment(form.startTime).unix()*1000 < moment.now())
  if (!form.endTime){
    ElMessage.error("Please choose endTime first!")
    return
  }
  let data = {
    carCategoryId: form.carCategeroyId,
    startTime: formatDatetimeToUtc(form.startTime),
    endTime: formatDatetimeToUtc(form.endTime), 
  }
  postRentCar(data)
}
  
let categoryMap = {}

  const getCarCategoryData = async () => {
    let res = await request.get('carCategory/list')
    res.forEach(item => {
      categoryMap[item.id] = item.categoryName
      carCategeroyIds.push({
        value: item.id,
        label: item.categoryName,
      })
    })
    // console.log(carCategeroyIds.values())
  }
  

  const getRentOrdersData = async () => {
    let res = await request.get('/rent/getOrders')

    // console.log(res)
    let newData = []
    res.forEach(item => {
      newData.push({
          carCategory: categoryMap[item.categoryId],
          // carPlate: item.carId,
          startTime: formatDatetimeToLocal(item.startTime),
          endTime: formatDatetimeToLocal(item.endTime),
          createTime: item.createTime,
      })
      tableData = newData
    })

  }

  const postRentCar = async (data) => {
    let res = await request.post('/rent/car', data)
    if (null != res) {
      getRentOrdersData()
    }
  }

  startData()

</script>



<style scoped>
.el-button--text {
  margin-right: 15px;
}
.el-input {
  width: 300px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
.table-box {
  width: 900px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.title {
  text-align: center;
}

</style>
