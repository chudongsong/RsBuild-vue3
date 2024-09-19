import minimist from 'minimist';
import humps from 'humps'; // 驼峰转换

import aliasInfo from './json/alias.config.json'; // 别名配置
import proxyInfo from './json/proxy.config.json'; // 代理配置

// 代理信息类型
type ProxyInfoType = {
	[key: string]: {
		HTTPS: boolean;
		IP: string;
		API: string;
		PORT: number;
		SSH_PORT: number;
		SSH_USER: string;
		SSH_PASSWORD: string;
	};
};

/**
 * @description 开发工具类
 */
export default class DevTools {
	// 命令行参数
	public commandLineArgs: { [key: string]: string };

	// 代理信息
	public proxyInfo: { [key: string]: string | number | boolean } = {
		https: true,
		proxyIp: '192.168.1.196',
		proxyPort: '8888',
		proxyKey: '',
		sshPort: '22',
		sshUser: 'root',
		sshPassword: 'www.bt.cn',
	};

	// 是否是开发环境
	public isDev = false;

	// 环境变量
	public prefixEnv: { [key: string]: string } = {};

	// 代理配置
	public proxyConfig: { [key: string]: AnyObject } = {
		'/api': {
			target: '',
			changeOrigin: true,
			pathRewrite: { '^/api': '' },
		},
	};

	// html配置
	public htmlConfig: { [key: string]: AnyObject | string } = {
		title: 'Vue App',
	};

	// 别名配置
	public sourceConfig: { [key: string]: AnyObject } = {
		alias: {},
		define: {},
		entry: {},
	};

	// 页面模板
	public pagetemplate: { [key: string]: string[] } = {
		index: ['./index.html', './src/main.ts'],
		login: ['./src/page/login/index.html', './src/page/login/main.ts'],
		software: ['./src/page/software/index.html', './src/page/software/main.ts'],
	};

	constructor() {
		// 获取命令行参数
		this.commandLineArgs = this.getCommandLineArgs(['ip', 'git']);
		// 获取代理信息
		this.proxyInfo = this.getProxyInfo(this.commandLineArgs.ip);
		// 获取环境变量
		this.prefixEnv = this.getEnvPrefixVal();
		// 是否是开发环境
		this.isDev = this._isDevelop();
		// 生成代理配置
		this.proxyConfig = this.createProxyConfig();
		// 生成html模板配置
		this.htmlConfig = this.createHtmlConfig();
		// 生成别名配置
		this.sourceConfig = this.createSourceConfig();
	}

	/**
	 * @description 获取代理信息
	 */
	public getProxyInfo = (ip: string) => {
		try {
			const info = (proxyInfo as unknown as ProxyInfoType)[ip]; // 获取代理信息，非标准写法
			if (info) {
				const { HTTPS, IP, PORT, SSH_PORT, SSH_USER, SSH_PASSWORD, API } = info;
				// console.log('proxyInfo', info, HTTPS);
				return {
					https: HTTPS,
					proxyIp: IP,
					proxyPort: PORT,
					proxyKey: API,
					sshPort: SSH_PORT,
					sshUser: SSH_USER,
					sshPassword: SSH_PASSWORD,
				};
			}
		} catch (error) {
			return this.proxyInfo;
		}
		return this.proxyInfo;
	};

	/**
	 * @description 是否是开发环境
	 * @returns
	 */

	private _isDevelop = (): boolean => {
		return process.env.NODE_ENV === 'development';
	};

	/**
	 * @description 获取命令行参数
	 * @param {string[]} config 配置
	 */
	public getCommandLineArgs = (config: string[] = ['ip', 'git']) => {
		// 获取命令所有的参数
		const argv = minimist(process.argv.slice(3));
		const params: { [key: string]: string } = {};
		// 获取自定义参数
		const customParams: string[] = argv._;
		// biome-ignore lint/complexity/noForEach: <explanation>
		config.forEach((item: string) => {
			const index = customParams.indexOf(`--${item}`);
			const value = customParams[index + 1];
			// 如果存在参数,并且参数不为空，就添加到参数中
			if (index > -1 && value && !value?.includes('--')) {
				params[item] = customParams[index + 1];
			}
		});
		return params;
	};

	/**
	 * @description 获取环境变量
	 * @param {string} key 环境变量key
	 */
	public getEnvPrefixVal = (prefix = 'RS_APP_') => {
		const env = process.env;
		const result: { [key: string]: string } = {};
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.keys(env).forEach(key => {
			if (key.startsWith(prefix)) {
				const newKey = humps.camelize(key.replace(prefix, '').toLowerCase());
				result[newKey] = env[key] as string;
			}
		});
		return result;
	};

	/**
	 * @description 生成代理配置
	 */
	public createProxyConfig = () => {
		const { ip, port } = this.proxyInfo; // 获取代理信息
		const { https } = this.proxyInfo; // 获取代理信息
		// console.log('proxyInfo', https);
		const proxyConfig = {
			'/api': {
				target: `${https ? 'https' : 'http'}://${ip || '192.168.1.196'}:${port || 8888}`, // 代理地址
				changeOrigin: false, // 是否跨域
				secure: false, // 不验证证书
				pathRewrite: { '^/api': '' }, // 重写路径
			},
		};
		return proxyConfig;
	};

	/**
	 * @description 生成html模板配置
	 */
	public createHtmlConfig = () => {
		// 配置页面映射关系
		const {
			index: [index],
			software: [software],
			login: [login],
		} = this.pagetemplate;
		const prefixEnv = this.prefixEnv;
		const proxyInfo = this.proxyInfo;
		return {
			// 根据入口文件名称，返回对应的html模板
			template({ entryName }: { entryName: string }) {
				const templates: { [key: string]: string } = { index, software, login };
				return templates[entryName] || index;
			},
			// 指定标题
			title: prefixEnv.title || 'Vue App',
			// 指定挂载点ID
			mountId: 'root',
			// 指定favicon
			favicon: './public/favicon.ico',
			// 指定元数据和配置数据
			meta: {
				charset: 'UTF-8',
				'X-UA-Compatible': 'IE=edge',
				referer: 'no-referrer, never, webkit',
				viewport: 'width=device-width, initial-scale=1.0',
			},
			// 标签注入
			tags: [{ tag: 'link', attrs: { rel: 'stylesheet', href: `${this.isDev ? '/public/font' : '/static/vite/font'}/svgtofont.css` }, injectTo: 'head' }],
			// 模板参数注入
			// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
			templateParameters: (defaultValue: Record<string, unknown>, { entryName }: { entryName: string }): Record<string, unknown> | void => {
				// 默认值
				const defaultVal = {
					...defaultValue,
					...prefixEnv,
					...proxyInfo,
				};
				const params: { [key: string]: Record<string, unknown> } = {
					index: defaultVal,
					software: defaultVal,
					login: defaultVal,
				};
				return params[entryName] || defaultVal;
			},
		};
	};

	/**
	 * @description 生成别名配置
	 * @returns
	 */
	public createSourceConfig = () => {
		// 配置页面映射关系
		const {
			index: [, index],
			software: [, software],
			login: [, login],
		} = this.pagetemplate;
		return {
			// 定义别名，方便引入
			alias: aliasInfo,
			// 替换指定变量和值
			define: {},
			// 根据入口文件名称，返回对应的入口文件
			entry: { index, software, login },
		};
	};
}
