import '@/app/assets/main.css'

import { createApp } from 'vue'
import App from '@/app/App.vue'
import { useWebGLLoading, router } from '@/shared'

const app = createApp(App)

app.use(router)

app.mount('#app')

useWebGLLoading()
