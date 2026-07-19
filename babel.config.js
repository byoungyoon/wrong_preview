module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: [
          '.ios.ts',
          '.android.ts',
          '.ios.tsx',
          '.android.tsx',
          '.ts',
          '.tsx',
          '.ios.js',
          '.android.js',
          '.js',
          '.jsx',
          '.json',
        ],
        alias: {
          '@screens': './src/screens',
          '@components': './src/components',
          '@store': './src/store',
          '@app-types': './src/types',
          '@api': './src/api',
          '@hooks': './src/hooks',
        },
      },
    ],
    'nativewind/babel',
  ],
};
