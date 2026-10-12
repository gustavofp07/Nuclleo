import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Nuclleo',
  webDir: 'www',
  plugins: {
    // Ícones claros nas barras do sistema (a faixa atrás delas é o fundo escuro do app)
    SystemBars: {
      style: 'DARK'
    }
  }
};

export default config;
