/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 项目站需带仓库名；本地开发默认 '/'
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [react()]
})
