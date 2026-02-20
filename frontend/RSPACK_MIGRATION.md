# Webpack to Rspack Migration Summary

This document summarizes the changes made to migrate from Webpack to Rspack.

## Files Changed

1. **Created**: `rspack.config.prod.js` - Production configuration
2. **Created**: `rspack.config.js` - Development configuration
3. **To Update**: `package.json` - Dependencies and scripts

## Key Changes

### 1. Dependencies to Install

```bash
npm install --save-dev @rspack/core @rspack/cli
```

### 2. Dependencies to Remove

**Build tools:**
```bash
npm uninstall webpack webpack-cli webpack-dev-server
```

**Babel (replaced by SWC):**
```bash
npm uninstall @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-proposal-class-properties @babel/plugin-syntax-jsx babel-loader babel-jest babel-eslint babel-plugin-named-asset-import babel-plugin-styled-components babel-preset-minify babel-preset-react-app
```

**Webpack plugins (replaced by Rspack built-ins):**
```bash
npm uninstall mini-css-extract-plugin terser-webpack-plugin css-minimizer-webpack-plugin copy-webpack-plugin compression-webpack-plugin
```

**Loaders (replaced by asset modules):**
```bash
npm uninstall file-loader raw-loader tsconfig-paths-webpack-plugin
```

**Type definitions (no longer needed):**
```bash
npm uninstall @types/webpack @types/webpack-dev-server @types/mini-css-extract-plugin @types/compression-webpack-plugin @types/copy-webpack-plugin
```

### 3. Dependencies to Keep (Compatible)

- `html-webpack-plugin` - Works with Rspack
- `compression-webpack-plugin` - Works with Rspack
- `@sentry/webpack-plugin` - Works with Rspack
- `webpack-bundle-analyzer` - Works with Rspack
- `webpack-retry-chunk-load-plugin` - Works with Rspack
- `image-minimizer-webpack-plugin` - Works with Rspack
- `babel-loader` - Works with Rspack (can migrate to `builtin:swc-loader` later for better performance)
- `css-loader`, `sass-loader`, `less-loader`, `style-loader` - All work with Rspack

### 4. Dependencies No Longer Needed

- `tsconfig-paths-webpack-plugin` - Replaced with built-in `resolve.tsConfig`
- `mini-css-extract-plugin` - Replaced with `rspack.CssExtractRspackPlugin`
- `copy-webpack-plugin` - Replaced with `rspack.CopyRspackPlugin`
- `terser-webpack-plugin` - Replaced with `rspack.SwcJsMinimizerRspackPlugin`
- `css-minimizer-webpack-plugin` - Replaced with `rspack.LightningCssMinimizerRspackPlugin`
- `raw-loader` - Replaced with `type: 'asset/source'`
- `file-loader` - Replaced with `type: 'asset/resource'`

## Configuration Changes

### Plugin Replacements

| Webpack Plugin | Rspack Equivalent |
|----------------|-------------------|
| `webpack` | `@rspack/core` |
| `webpack.ProvidePlugin` | `rspack.ProvidePlugin` |
| `webpack.DefinePlugin` | `rspack.DefinePlugin` |
| `copy-webpack-plugin` | `rspack.CopyRspackPlugin` |
| `mini-css-extract-plugin` | `rspack.CssExtractRspackPlugin` |
| `tsconfig-paths-webpack-plugin` | `resolve.tsConfig: {}` |
| `terser-webpack-plugin` | `rspack.SwcJsMinimizerRspackPlugin` |
| `css-minimizer-webpack-plugin` | `rspack.LightningCssMinimizerRspackPlugin` |

### Loader Replacements

| Webpack Loader | Rspack Equivalent |
|----------------|-------------------|
| `raw-loader` | `type: 'asset/source'` |
| `file-loader` | `type: 'asset/resource'` |
| `url-loader` | `type: 'asset/inline'` |

### CSS Configuration

When using `CssExtractRspackPlugin`, add `type: 'javascript/auto'` to CSS rules:

```javascript
{
  test: /\.css$/,
  use: [
    rspack.CssExtractRspackPlugin.loader,
    { loader: 'css-loader', options: { modules: true } }
  ],
  type: 'javascript/auto'  // Required!
}
```

## Package.json Updates

Update the scripts section:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development rspack serve --progress",
    "build": "rspack --config=rspack.config.prod.js --progress"
  }
}
```

## TypeScript Configuration

Replace `TsconfigPathsPlugin` with built-in `resolve.tsConfig`:

```javascript
// Before
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
resolve: {
  plugins: [new TsconfigPathsPlugin({})]
}

// After
resolve: {
  tsConfig: {}
}
```

## SWC Migration

The project has been migrated from `babel-loader` to `builtin:swc-loader` for significantly faster compilation:

### Changes Made

**Development (`rspack.config.js`):**
- Replaced `babel-loader` with `builtin:swc-loader`
- Enabled React Fast Refresh for hot reloading
- Configured TypeScript and TSX parsing

**Production (`rspack.config.prod.js`):**
- Uses `builtin:swc-loader` for compilation
- SWC-based minification with `SwcJsMinimizerRspackPlugin`
- CSS minification with `LightningCssMinimizerRspackPlugin`

### Configuration Example

```javascript
{
  test: /\.(j|t)sx$/,
  loader: 'builtin:swc-loader',
  exclude: /[\\/]node_modules[\\/]/,
  options: {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          development: false, // true for dev
          refresh: false,     // true for dev
        },
      },
      externalHelpers: true,
    },
    env: {
      targets: '>0.2%, not dead, not op_mini all',
    },
  },
}
```

### Babel Dependencies Removed

The following packages are no longer needed and have been removed:
- `@babel/core`
- `@babel/preset-env`
- `@babel/preset-react`
- `@babel/preset-typescript`
- `@babel/plugin-proposal-class-properties`
- `@babel/plugin-syntax-jsx`
- `babel-loader`
- `babel-eslint`
- `babel-plugin-named-asset-import`
- `babel-plugin-styled-components`
- `babel-preset-minify`
- `babel-preset-react-app`

### Babel Configuration Files

- **Removed**: `.babelrc` - No longer needed since Rspack uses SWC
- **Kept**: `babel.config.js` - Still used by Jest for testing (can be migrated to `@swc/jest` later)

### Configuration Files Updated

- **tsconfig.json**: Removed references to babel and webpack configs, added rspack configs

## Notes

1. Rspack's built-in SWC-based minifiers are faster than Terser and CSS Minimizer
2. Asset modules replace legacy loaders (file-loader, url-loader, raw-loader)
3. Most webpack plugins work out of the box with Rspack
4. Rspack has better defaults for caching and performance

## Testing the Migration

1. Install new dependencies: `npm install`
2. Remove old dependencies: `npm uninstall webpack webpack-cli webpack-dev-server`
3. Test development build: `npm run dev`
4. Test production build: `npm run build`
5. Verify output in `build/` directory

## Troubleshooting

- If you encounter issues with specific plugins, check [Rspack Plugin Compatibility](https://rspack.rs/guide/compatibility/plugin)
- For loader issues, refer to [Rspack Loader Compatibility](https://rspack.rs/guide/compatibility/loader)
- Rspack CLI commands are similar to webpack but default to `rspack.config.js`
