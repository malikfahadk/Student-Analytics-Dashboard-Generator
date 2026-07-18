import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Student-Analytics-Dashboard-Generator/',
  plugins: [react()],
});
