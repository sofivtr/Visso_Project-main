/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Si usas vite-plugin-gh-pages, puedes importarlo así:
// import { ghPages } from 'vite-plugin-gh-pages';

// https://vite.dev/config/
export default defineConfig({
  base: '/Visso_Project-main/', // GitHub Pages necesita el nombre del repositorio
  plugins: [react()],
  // Si quieres usar el plugin, descomenta la línea de abajo y agrégalo:
  // plugins: [react(), ghPages()],
  test: {
    environment: 'jsdom',       // importante: configura entorno tipo navegador
    globals: true,              // para usar expect, test, etc. sin importar
    setupFiles: './src/tests/setup.ts', // archivo para configuraciones globales
    css: true,
  }
})



