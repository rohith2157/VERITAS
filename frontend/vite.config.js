import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function optimizeLucide() {
  const toKebab = (s) => s.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase();
  return {
    name: 'lucide-optimizer',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('src') || (!id.endsWith('.jsx') && !id.endsWith('.js'))) return null;
      if (!code.includes("from 'lucide-react'") && !code.includes('from "lucide-react"')) return null;

      const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/g;
      const newCode = code.replace(importRegex, (_, importsStr) => {
        const icons = importsStr.split(',').map(s => s.trim()).filter(Boolean);
        return icons.map(icon => {
          const parts = icon.split(/\s+as\s+/).map(s => s.trim());
          const orig = parts[0];
          const alias = parts[1] || orig;
          const kebab = toKebab(orig);
          return `import ${alias} from 'lucide-react/dist/esm/icons/${kebab}.mjs';`;
        }).join('\n');
      });
      return { code: newCode, map: null };
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [optimizeLucide(), react()],
  build: {
    target: 'esnext',
    emptyOutDir: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'three';
          }
        }
      }
    }
  }
})
