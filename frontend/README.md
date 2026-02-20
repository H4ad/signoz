# Configuring Over Local
1. Docker
1. Without Docker

## With Docker

**Building image**

``docker compose up`
/ This will also run

or
`docker build . -t tagname`

**Tag to remote url- Introduce versinoing later on**

```
docker tag signoz/frontend:latest 7296823551/signoz:latest
```

```
docker compose up
```

## Without Docker
Follow the steps below

1. ```git clone https://github.com/SigNoz/signoz.git && cd signoz/frontend```
1. change baseURL to ```<test environment URL>``` in file ```src/constants/env.ts```

1. ```yarn install```
1. ```yarn dev```

```Note: Please ping us in #contributing channel in our slack community and we will DM you with <test environment URL>```

# SigNoz Frontend

This project uses [Rspack](https://rspack.dev/) for fast builds and optimal performance.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3301](http://localhost:3301) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Build System

This project uses **Rspack** with the following optimizations:

- **SWC-based compilation** - Fast JavaScript/TypeScript transpilation using Rust-based SWC
- **Built-in CSS extraction** - Using `CssExtractRspackPlugin`
- **Built-in minification** - Using `SwcJsMinimizerRspackPlugin` and `LightningCssMinimizerRspackPlugin`
- **Asset modules** - Native support for images, fonts, and other assets
- **Filesystem caching** - Persistent build caching for faster rebuilds

Configuration files:
- `rspack.config.js` - Development configuration
- `rspack.config.prod.js` - Production configuration

### Bundle Analysis

To analyze the bundle size, run:

```bash
BUNDLE_ANALYSER=true yarn build
```

This will start the bundle analyzer server to visualize the bundle composition.

## Learn More

- [Rspack Documentation](https://rspack.dev/)
- [SWC Documentation](https://swc.rs/)
- [React documentation](https://reactjs.org/)
