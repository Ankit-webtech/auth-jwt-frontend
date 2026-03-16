import axios from 'axios';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if(parts.length === 2) return parts.pop().split(";").shift();
}

const api = axios.create({
    baseURL: import.meta.env.VITE_SERVER,
    withCredentials: true,
});

api.interceptors.request.use(
    (config)=>{
        if(config.method === "post" || config.method === "put" || config.method === "delete" ) {
            const csrfToken = getCookie("csrfToken");
            if(csrfToken){
                config.headers["x-csrf-token"] = csrfToken;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let isRefreshCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (error, token=null) => {
    failedQueue.forEach((prom) => {
        if(error){
            prom.reject(error);
        }else{
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const processCSRFQueue = (error, token=null) => {
    csrfFailedQueue.forEach((prom) => {
        if(error){
            prom.reject(error);
        }else{
            prom.resolve(token);
        }
    });
    csrfFailedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async(error) => {
        const originalRequest = error.config;

        // Agar response hi nahi aaya (network error)
        if(!error.response) {
            return Promise.reject(error);
        }

        if([401, 403].includes(error.response?.status) && !originalRequest._retry) {

            // /me route ko silently reject karo - ye sirf auth check ke liye hai
            if(originalRequest.url.includes('/api/v1/me')) {
                return Promise.reject(error);
            }

            // refresh aur refresh-csrf routes ko loop se bachao
            if(
                originalRequest.url.includes('/api/v1/refresh') ||
                originalRequest.url.includes('/api/v1/refresh-csrf')
            ){
                // Refresh bhi fail ho gaya — session khatam, login pe bhejo
                window.location.href = '/login';
                return Promise.reject(error);
            }

            const errorCode = error.response.data?.code || "";

            // ---- CSRF Token refresh logic ----
            if(errorCode.startsWith("CSRF_")) {
                if(isRefreshCSRFToken){
                    return new Promise((resolve, reject) => {
                        csrfFailedQueue.push({resolve, reject});
                    }).then(() => api(originalRequest));
                }

                originalRequest._retry = true;
                isRefreshCSRFToken = true;

                try{
                    await api.post("/api/v1/refresh-csrf");
                    processCSRFQueue(null);
                    return api(originalRequest);
                }catch(csrfError){
                    processCSRFQueue(csrfError);
                    // CSRF refresh bhi fail — login pe bhejo
                    window.location.href = '/login';
                    return Promise.reject(csrfError);
                }finally{
                    isRefreshCSRFToken = false;
                }
            }

            // ---- Access Token refresh logic ----
            if(isRefreshing){
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject});
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try{
                await api.post("/api/v1/refresh");
                processQueue(null);
                return api(originalRequest);
            }catch(refreshError){
                processQueue(refreshError, null);
                // Refresh token bhi expire — login pe bhejo
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }finally{
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;










































////////////////////////////////////////// purana code 














// import axios from 'axios';

// const getCookie = (name) => {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if(parts.length === 2) return parts.pop().split(";").shift();
// }

// // const api = axios.create({
// //     baseURL: server,
// //     withCredentials: true,
// // });
// const api = axios.create({
//     baseURL: import.meta.env.VITE_SERVER,
//     withCredentials: true,
// });

// api.interceptors.request.use(
//     (config)=>{
//         if(config.method === "post" || config.method === "put" || config.method === "delete" ) {
//             const csrfToken = getCookie("csrfToken");

//             if(csrfToken){
//                 config.headers["x-csrf-token"] = csrfToken;
//             }
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// let isRefreshing = false;
// let isRefreshCSRFToken = false;
// let failedQueue = [];
// let csrfFailedQueue = [];

// const processQueue = (error , token=null) => {
//     failedQueue.forEach((prom) => {
//         if(error){
//             prom.reject(error)
//         }else {
//             prom.resolve(token);
//         }
//     });

//     failedQueue = [];
// };

// const processCSRFQueue = (error , token=null) => {
//     csrfFailedQueue.forEach((prom) => {
//         if(error){
//             prom.reject(error)
//         }else {
//             prom.resolve(token);
//         }
//     });

//     csrfFailedQueue = [];
// };

// api.interceptors.response.use(
//     (response)=> response,
//     async(error) => {
//         const originalRequest = error.config;

//         if([401,403].includes(error.response?.status) && !originalRequest._retry) {
//             if(originalRequest.url.includes('/api/v1/me')) {
//         return Promise.reject(error); }
//         const errorCode = error.response.data?.code || "";
//             if(errorCode.startsWith("CSRF_")) {
//                 if(isRefreshCSRFToken){
//                     return new Promise((resolve, reject) => {
//                         csrfFailedQueue.push({resolve, reject} );
//                     }).then(() => api(originalRequest));
//                 }
//                 originalRequest._retry = true
//                 isRefreshCSRFToken = true

//                 try{
//                     await api.post("/api/v1/refresh-csrf");
//                     processCSRFQueue(null);
//                     return api(originalRequest);
//                 } catch(error){
//                     processCSRFQueue(error)
//                     console.log("Failed to refresh csrf token ");
//                     return Promise.reject(error);
//                 } finally{
//                     isRefreshCSRFToken = false;
//                 }
//             }
//             if(isRefreshing){
//                 return new Promise((resolve , reject) => {
//                     failedQueue.push({resolve, reject });
//                 }).then(() => {
//                     return api(originalRequest);
//                 });
//             }
//             originalRequest._retry = true;
//             isRefreshing = true;

//             try {
//                 await api.post("/api/v1/refresh");
//                 processQueue(null);
//                 return api(originalRequest);
//             } catch (error) {
//                 processQueue(error, null)
//                 return Promise.reject(error);
//             } finally {
//                 isRefreshing = false;
//             }
//         }
//         return Promise.reject(error);
//     }
// );

// export default api;
