import { defineConfig } from '@rsbuild/core'; // rsbuild 核心库
import { pluginVue } from '@rsbuild/plugin-vue'; // vue 插件
import { pluginBabel } from '@rsbuild/plugin-babel'; // babel处理 https://rsbuild.dev/zh/plugins/list/plugin-babel
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx'; // jsx处理 https://github.com/rspack-contrib/rsbuild-plugin-vue-jsx
import { pluginSass } from '@rsbuild/plugin-sass'; // sass处理 https://rsbuild.dev/zh/plugins/list/plugin-sass
import { pluginTypeCheck } from '@rsbuild/plugin-type-check'; // 类型检查插件 https://github.com/rspack-contrib/rsbuild-plugin-type-check
import { pluginBasicSsl } from '@rsbuild/plugin-basic-ssl'; // ssl 插件
import { pluginHtmlMinifierTerser } from 'rsbuild-plugin-html-minifier-terser'; // html压缩插件

import DevTools from './config/panel.build'; // 配置文件

const { proxyConfig: proxy, htmlConfig: html, sourceConfig: source, proxyInfo, isDev } = new DevTools();

// 插件配置
const otherPlugin: any[] = [];
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
			js: isDev ? 'source-map' : 'cheap-module-source-map',
		},
		// 兼容性输入-入口
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
		// 配置文件编译路径
		distPath: ((path: string) => {
			const typeList = ['js', 'jsAsync', 'css', 'cssAsync', 'svg', 'font', 'image', 'wasm', 'media'];
			const obj: any = { html: 'templates/default' };
			typeList.forEach(type => {
				obj[type] = `${path}${type}`;
			});
			return obj;
		})('static/vite/'),
		// 复制文件
		copy: [{ from: 'public/font', to: './static/vite/font' }],
	},
});
