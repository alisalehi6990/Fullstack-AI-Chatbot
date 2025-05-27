import { CracoConfig } from '@craco/types';

const cracoConfig: CracoConfig = {
  webpack: {
    alias: {
      // Add as many aliases as needed
      '@': require('path').resolve(__dirname, 'src'),
    },
  },
};

export default cracoConfig;