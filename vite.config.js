import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 깃허브 저장소 이름이 '26school-co2'이므로 반드시 이 경로를 포함해야 합니다.
  base: '/26school-co2/', 
})