import exp from 'node:constants';

// 文件映射处理，用于重新调整文件路径,entry: 入口文件路径,export: 导出文件路径,replacePath: 是否替换文件中的资源路径
export interface FileMapsRules {
	entry: string; // 入口文件路径,支持glob匹配
	export: string; // 导出文件路径
	replacePath?: boolean; // 是否替换文件中的资源路径
}

// 文件替换规则，用于替换文件中的内容，处理文件中的路径或非标准的内容
interface FileReplaceDefalutRules {
	entry?: string; // 入口文件路径,支持glob匹配
}

// 默认替换
export interface FileReplaceAloneRules extends FileReplaceDefalutRules {
	replace: string | RegExp; // 替换内容,支持正则表达式
	content: string; // 替换后的内容
}

// 组替换
export interface FileReplaceGroupRules extends FileReplaceDefalutRules {
	replaceList: FileReplaceAloneRules[]; // 替换列表
}

// 文件替换规则，用于替换文件中的内容，处理文件中的路径或非标准的内容
export type FileReplaceRules = FileReplaceAloneRules | FileReplaceGroupRules;
