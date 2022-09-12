// import
import axios from "axios"
import { ElMessage } from "element-plus"


// global config
const service = axios.create({
    baseURL: "http://localhost:8888/carRental",
    // baseURL: "http://xxx/carRental",
    timeout: 8000,
})

service.interceptors.request.use(
    config => {
        let token = localStorage.getItem('token')
        if (null != token) {
            config.headers.token = token
        }
        // console.log(config);
        return config
    },
    err => {
        return Promise.reject(err)
    },
)

service.interceptors.response.use(
    response => {
        const { code, success, data, message } = response.data

        if (success == true) {
            ElMessage.success(message)
            return data;
        } else {
            if (code == 1004 || code == 1005) {
                localStorage.removeItem('token')
            }
            console.log(response.data)
            ElMessage.error(message)
        }
        // return response.data;
    }
)

// request
// request.get('/api', {xxx: xxx})
function request(options) {
    options.method = options.method || 'get'

    if (options.method.toLowerCase() === 'get') {
        options.params = options.data
    }

    return service(options)
}

['get', 'post', 'put', 'delete'].forEach(item => {
    request[item] = (url, data) => {
        return request({
            url,
            data,
            method: item
        })
    }
})

export default request