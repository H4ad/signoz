/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// shared config (dev and prod)
import { ImageMinimizerPlugin } from '@rsbuild/plugin-image-compress';
import { rspack, RspackOptions } from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

dotenv.config();
const isDev = process.env.NODE_ENV === 'development';

const plugins = [
	isDev && new ReactRefreshPlugin(),
	new HtmlWebpackPlugin({
		template: 'src/index.html.ejs',
		PYLON_APP_ID: process.env.PYLON_APP_ID,
		APPCUES_APP_ID: process.env.APPCUES_APP_ID,
		POSTHOG_KEY: process.env.POSTHOG_KEY,
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SENTRY_ORG: process.env.SENTRY_ORG,
		SENTRY_PROJECT_ID: process.env.SENTRY_PROJECT_ID,
		SENTRY_DSN: process.env.SENTRY_DSN,
		TUNNEL_URL: process.env.TUNNEL_URL,
		TUNNEL_DOMAIN: process.env.TUNNEL_DOMAIN,
	}),
	new CompressionPlugin({
		exclude: /.map$/,
	}),
	new rspack.CopyRspackPlugin({
		patterns: [{ from: './public/', to: '.' }],
	}),
	new rspack.ProvidePlugin({
		process: 'process/browser',
	}),
	new rspack.DefinePlugin({
		'process.env': JSON.stringify({
			FRONTEND_API_ENDPOINT: process.env.FRONTEND_API_ENDPOINT,
			WEBSOCKET_API_ENDPOINT: process.env.WEBSOCKET_API_ENDPOINT,
			PYLON_APP_ID: process.env.PYLON_APP_ID,
			PYLON_IDENTITY_SECRET: process.env.PYLON_IDENTITY_SECRET,
			APPCUES_APP_ID: process.env.APPCUES_APP_ID,
			POSTHOG_KEY: process.env.POSTHOG_KEY,
			SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
			SENTRY_ORG: process.env.SENTRY_ORG,
			SENTRY_PROJECT_ID: process.env.SENTRY_PROJECT_ID,
			SENTRY_DSN: process.env.SENTRY_DSN,
			TUNNEL_URL: process.env.TUNNEL_URL,
			TUNNEL_DOMAIN: process.env.TUNNEL_DOMAIN,
			DOCS_BASE_URL: process.env.DOCS_BASE_URL,
		}),
	}),
	new rspack.CssExtractRspackPlugin(),
	sentryWebpackPlugin({
		authToken: process.env.SENTRY_AUTH_TOKEN,
		org: process.env.SENTRY_ORG,
		project: process.env.SENTRY_PROJECT_ID,
	}),
	// new RetryChunkLoadPlugin({
	// 	maxRetries: 2,
	// }),
	new rspack.ProgressPlugin({}),
];

if (process.env.BUNDLE_ANALYSER === 'true') {
	plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server' }));
}

const config: RspackOptions = {
	mode: 'production',
	devtool: 'source-map',
	entry: {
		main: './src/index.tsx',
	},
	experiments: {
		css: true,
	},
	output: {
		path: path.resolve('./build'),
		publicPath: '/',
		filename: '[name].[contenthash].js',
	},
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
		tsConfig: './tsconfig.json',
		modules: [path.resolve(__dirname, 'node_modules')],
		fallback: { 'process/browser': require.resolve('process/browser') },
		alias: {
			src: path.resolve(__dirname, './src'),
		},
	},
	cache: true,
	stats: {
		children: true,
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: [/node_modules/],
				loader: 'builtin:swc-loader',
				resolve: {
					fullySpecified: false,
				},
				options: {
					jsc: {
						parser: {
							syntax: 'typescript',
							jsx: true,
						},
						transform: {
							react: {
								runtime: 'automatic',
							},
						},
					},
				},
				type: 'javascript/auto',
			},
			{
				test: /\.jsx$/,
				use: {
					loader: 'builtin:swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'ecmascript',
								jsx: true,
							},
						},
						transform: {
							react: {
								runtime: 'automatic',
							},
						},
					},
				},
				type: 'javascript/auto',
			},
			{
				test: /\.tsx$/,
				resolve: {
					fullySpecified: false,
				},
				use: {
					loader: 'builtin:swc-loader',
					options: {
						jsc: {
							parser: {
								syntax: 'typescript',
								tsx: true,
							},
							transform: {
								react: {
									runtime: 'automatic',
								},
							},
						},
					},
				},
				type: 'javascript/auto',
			},
			{
				test: /\.md$/,
				type: 'asset/source',
			},
			{
				test: /\.css$/,
				use: [
					rspack.CssExtractRspackPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							modules: true,
						},
					},
				],
				type: 'javascript/auto',
			},
			{
				test: /\.(sass|scss)$/,
				use: [
					{
						loader: 'sass-loader',
						options: {
							// using `modern-compiler` and `sass-embedded` together significantly improve build performance,
							// requires `sass-loader >= 14.2.1`
							api: 'modern-compiler',
							implementation: require.resolve('sass-embedded'),
						},
					},
				],
				// set to 'css/auto' if you want to support '*.module.(scss|sass)' as CSS Modules, otherwise set type to 'css'
				type: 'css',
			},
			{
				test: /\.(jpe?g|png|gif|svg)$/i,
				type: 'asset',
			},

			{
				test: /\.(ttf|eot|woff|woff2)$/,
				type: 'asset/resource',
			},
		],
	},
	plugins,
	optimization: {
		chunkIds: 'named',
		runtimeChunk: isDev
			? undefined
			: {
					name: (entrypoint) => `runtime~${entrypoint.name}`,
			  },
		minimizer: isDev
			? []
			: [
					new rspack.SwcJsMinimizerRspackPlugin({
						extractComments: false,
					}),
					new rspack.LightningCssMinimizerRspackPlugin(),
					new ImageMinimizerPlugin({
						use: 'jpeg',
						test: /\.(?:jpe?g)$/,
						quality: 80,
					}),
					new ImageMinimizerPlugin({
						use: 'png',
						test: /\.png$/,
					}),
					new ImageMinimizerPlugin({
						use: 'webp',
						test: /\.webp$/,
					}),
					new ImageMinimizerPlugin({
						use: 'avif',
						test: /\.avif$/,
					}),
					new ImageMinimizerPlugin({
						use: 'svg',
						test: /\.svg$/,
					}),
			  ],
	},
	performance: {
		hints: 'warning',
	},
};

export default config;
