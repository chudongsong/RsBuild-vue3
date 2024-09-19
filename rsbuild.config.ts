import type { RsbuildPlugins } from '@rsbuild/core'; // rsbuild 核心库类型
import { defineConfig } from '@rsbuild/core'; // rsbuild 核心库
import { pluginVue } from '@rsbuild/plugin-vue'; // vue 插件
import { pluginBabel } from '@rsbuild/plugin-babel'; // babel处理 https://rsbuild.dev/zh/plugins/list/plugin-babel
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx'; // jsx处理 https://github.com/rspack-contrib/rsbuild-plugin-vue-jsx
import { pluginSass } from '@rsbuild/plugin-sass'; // sass处理 https://rsbuild.dev/zh/plugins/list/plugin-sass
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'; // 类型检查插件 https://github.com/rspack-contrib/rsbuild-plugin-type-check
import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl'; // ssl 插件
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser'; // html压缩插件

import DevTools from './config/panel.build'; // 配置文件

import { FileMapsPlugin as pluginFileMaps, FileReplacePlugin as pluginFileReplace } from './config/compatible.plugin'; // 文件映射插件

const { proxyConfig: proxy, htmlConfig: html, sourceConfig: source, proxyInfo, isDev } = new DevTools();

// 插件配置
const otherPlugin: RsbuildPlugins = [];
// 是否开启https
if (proxyInfo.https) otherPlugin.push(pluginBasicSsl());

export default defineConfig({
	// 插件处理
	plugins: [
		...otherPlugin,
		pluginBabel({
			include: /\.(?:jsx|tsx)$/,
		}),
		pluginVue(),
		pluginVueJsx(),
		pluginSass(),
		pluginTypeCheck(),
		pluginHtmlMinifierTerser(),
		// 文件路径处理
		pluginFileMaps([
			{ entry: './font/**/*', export: './static/vite/font' }, // 字体文件
			{ entry: './*.html', export: './templates/default' }, // html文件
			{ entry: './favicon.ico', export: './static' }, // 图标文件
		]),
		// 文件内容处理
		pluginFileReplace([
			{ entry: './templates/default/*.html', replaceList: [{ replace: /\/static\/vite/g, content: '/tests/vite' }] }, // 替换html
		]),
	],
	// 构建配置
	dev: {
		lazyCompilation: true, // 是否开启	懒编译
	},
	// html模板配置
	html,
	// 入口文件配置
	source,
	// 服务配置
	server: {
		port: 3000, // 服务端口
		compress: true, // 是否启用gzip压缩
		proxy, // 代理配置
	},
	// 输出配置
	output: {
		// 地图配置输出
		sourceMap: {
			js: !isDev ? 'source-map' : 'cheap-module-source-map',
		},
		// 兼容性输入-入口注入
		polyfill: 'entry',
		// 浏览器兼容性配置
		overrideBrowserslist: ['> 0.1%', 'not ie 6-11', 'Firefox > 40', 'Chrome > 40', 'safari > 10'],
		// 配置 legal comment 注释
		legalComments: 'none',
		// 配置文件名
		filename: {
			js: isDev ? '[name].js?v=[chunkhash:8]' : '[name].js',
			css: isDev ? '[name].css?v=[chunkhash:8]' : '[name].css',
		},
		// 配置文件编译路径(将所有类型的文件移动dist目录下)
		distPath: ((path: string) => {
			const typeList = ['js', 'jsAsync', 'css', 'cssAsync', 'svg', 'font', 'image', 'wasm', 'media'];
			const obj: { [key: string]: string } = {};
			for (const key of typeList) {
				obj[key] = `${path}${key}`;
			}
			console.log('obj', obj);
			return obj;
		})('static/vite/'),
	},
	tools: {
		// 配置文件路径
		htmlPlugin(config, { entryName }) {
			if (!isDev && entryName.includes('index')) {
				config.filename = 'index1.html';
			}
		},
	},
});
