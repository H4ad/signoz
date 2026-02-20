import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginLess } from '@rsbuild/plugin-less';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSass } from '@rsbuild/plugin-sass';
import dotenv from 'dotenv';
import { resolve } from 'node:path';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';
const isBundleAnalyzer = process.env.BUNDLE_ANALYSER === 'true';

export default defineConfig({
	source: {
		entry: {
			index: './src/index.tsx',
		},
		tsconfigPath: './tsconfig.json',
		resolve: {
			alias: {
				'react-router-dom': resolve(__dirname, 'node_modules/react-router-dom'),
			},
		},
		define: {
			'process.env': JSON.stringify({
				NODE_ENV: process.env.NODE_ENV || 'development',
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
		},
	},
	html: {
		template: './src/index.html',
		templateParameters: {
			PYLON_APP_ID: process.env.PYLON_APP_ID || '',
			APPCUES_APP_ID: process.env.APPCUES_APP_ID || '',
			POSTHOG_KEY: process.env.POSTHOG_KEY || '',
			SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || '',
			SENTRY_ORG: process.env.SENTRY_ORG || '',
			SENTRY_PROJECT_ID: process.env.SENTRY_PROJECT_ID || '',
			SENTRY_DSN: process.env.SENTRY_DSN || '',
			TUNNEL_URL: process.env.TUNNEL_URL || '',
			TUNNEL_DOMAIN: process.env.TUNNEL_DOMAIN || '',
		},
	},
	output: {
		distPath: {
			root: './build',
		},
		assetPrefix: '/',
		filenameHash: isProd,
		sourceMap: {
			js: isProd ? 'source-map' : 'cheap-module-source-map',
			css: false,
		},
	},
	server: {
		port: 3301,
		open: true,
		historyApiFallback: true,
		publicDir: {
			name: './public',
			copyOnBuild: true,
		},
	},
	plugins: [
		pluginReact(),
		pluginSass(),
		pluginLess({
			lessLoaderOptions: {
				lessOptions: {
					javascriptEnabled: true,
				},
			},
		}),
		pluginBabel({
			include: [/\.(?:jsx|tsx)$/],
		}),
	],
	tools: {
		rspack: async (config, { appendPlugins, addRules }) => {
			addRules({
				test: /\.md$/,
				type: 'asset/source',
			});

			if (isProd && process.env.SENTRY_AUTH_TOKEN) {
				const { sentryWebpackPlugin } = await import('@sentry/webpack-plugin');
				appendPlugins([
					sentryWebpackPlugin({
						authToken: process.env.SENTRY_AUTH_TOKEN,
						org: process.env.SENTRY_ORG,
						project: process.env.SENTRY_PROJECT_ID,
					}),
				]);
			}

			// const { RetryChunkLoadPlugin } = await import(
			// 	'rspack-plugin-retry-chunk-load'
			// );
			// appendPlugins([new RetryChunkLoadPlugin({ maxRetries: 2 })]);

			// if (isProd) {
			// 	const CompressionPlugin = (await import('compression-webpack-plugin'))
			// 		.default;
			// 	appendPlugins([new CompressionPlugin({ exclude: /.map$/ })]);
			// }

			return config;
		},
	},
	performance: {
		bundleAnalyze: isBundleAnalyzer
			? {
					analyzerMode: 'server',
			  }
			: undefined,
	},
});
