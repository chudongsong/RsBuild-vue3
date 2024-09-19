import type { RsbuildPlugin } from '@rsbuild/core';
import { glob, type GlobOptionsWithFileTypesUnset } from 'glob'; // 匹配规则
import { promisify } from 'node:util'; // promisify 处理
import fs from 'node:fs'; // 文件处理
import path from 'node:path'; // 路径处理

import type { FileMapsRules, FileReplaceAloneRules, FileReplaceRules } from './type'; // 文件映射规则

const copyFiles = promisify(fs.copyFile); // 文件复制
const rename = promisify(fs.rename); // 重命名
const unlink = promisify(fs.unlink); // 删除文件
const readdir = promisify(fs.readdir); // 读取目录
const mkdir = promisify(fs.mkdir); // 创建目录
const rmdir = promisify(fs.rmdir); // 删除目录
const readFile = promisify(fs.readFile); // 读取文件
const writeFile = promisify(fs.writeFile); // 写入文件

// const globPromise = promisify(glob); // glob 处理
let cachePath: string[] = []; // 缓存文件路径，减少重复获取文件路径

/**
 * @description 文件映射插件，用于处理静态资源路径，例如：将文件移动到指定目录和修改文件移动的路径
 * @param {FileMapsRules[]} rules 文件映射规则
 *
 */
export const FileMapsPlugin = (rules: FileMapsRules[]): RsbuildPlugin => ({
	name: 'panel:file-maps',
	setup(api) {
		api.onAfterBuild(async options => {
			const { stats } = options as AnyObject;
			const { output } = stats.compilation.options; // 输出配置
			const distPath = path.resolve(output.path); // 输出路径
			const relativePath = path.relative(process.cwd(), distPath); // 相对路径
			const promiseList: Promise<void>[] = [];
			for (const rule of rules) {
				const entryPath = path.resolve(relativePath, rule.entry); // 入口路径
				const exportPath = path.resolve(relativePath, rule.export); // 导出路径
				const globFiles = await glob(entryPath); // 匹配的文件信息
				promiseList.push(moveFile(globFiles, exportPath)); // 复制目录
			}
			await Promise.all(promiseList);
		});
	},
});

/**
 * @description 文件内容替换
 * @param {FileMapsRules} rules 文件映射规则
 * @returns
 */
export const FileReplacePlugin = (rules: FileReplaceRules[]): RsbuildPlugin => ({
	name: 'panel:file-replace',
	setup(api) {
		api.onAfterBuild(async options => {
			const { stats } = options as AnyObject;
			const { output } = stats.compilation.options; // 输出配置
			const distPath = path.resolve(output.path); // 输出路径
			const relativePath = path.relative(process.cwd(), distPath); // 相对路径
			const promiseList: Promise<void>[] = [];
			for (const rule of rules) {
				const entryPath = path.resolve(relativePath, rule.entry); // 入口路径
				const globFiles = await glob(entryPath, { ignore: [] }); // 匹配的文件信息
				modifyFileContent(globFiles, rule.replace, rule.content); // 修改文件内容
				// promiseList.push(
				// 	(async () => {
				// 		for (const file of globFiles) {
				// 			const content = await fs.promises.readFile(file, 'utf-8');
				// 			const modifiedContent = content.replace(rule.replace, rule.content);
				// 			await fs.promises.writeFile(file, modifiedContent, 'utf-8');
				// 		}
				// 	},
				// );
			}
		});
	},
}); // 文件内容替换插件

/**
 * @description 文件同步至本地打包目录
 */
export class FileSyncPackLocal {}

/**
 * @description 移动目录
 * @param {string} srcDir 源目录
 * @param {string} destDir 目标目录
 * @param {string[]} ignore 忽略文件
 * @returns
 */
async function moveDir(srcDir: string, destDir: string): Promise<void> {
	try {
		// 判断是否为目录
		if (fs.statSync(srcDir).isFile()) {
			await moveFile(srcDir, destDir);
			return;
		}

		// 检查源目录是否存在
		if (!fs.existsSync(srcDir)) {
			throw new Error(`源目录不存在: ${srcDir}`);
		}

		// 检查目标目录是否存在，如果不存在则创建
		if (!fs.existsSync(destDir)) {
			await mkdir(destDir, { recursive: true });
		}

		const files = await readdir(srcDir);
		for (const file of files) {
			const srcFile = path.join(srcDir, file);
			const destFile = path.join(destDir, file);
			const stat = fs.statSync(srcFile);
			if (stat.isDirectory()) {
				await moveDir(srcFile, destFile); // 递归移动子目录
			} else {
				await rename(srcFile, destFile); // 移动文件
			}
		}
		await fs.promises.rmdir(srcDir); // 删除空目录
	} catch (error) {
		console.error('移动目录时出错:', error);
	}
}

/**
 * @description 删除目录及其内容
 * @param {string} dirPath 目录路径
 * @returns
 */
const deleteDir = async (dirPath: string) => {
	try {
		const files = await readdir(dirPath);
		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const stat = fs.statSync(filePath);
			console.log('filePath:', filePath);
			if (stat.isDirectory()) {
				await deleteDir(filePath); // 递归删除子目录
			} else {
				await unlink(filePath); // 删除文件
			}
		}
		await rmdir(dirPath); // 删除空目录
	} catch (error) {
		console.error('deleteDir error:', error);
	}
};

/**
 * @description 复制文件
 * @param {string} srcFile 源文件
 * @param {string} destFile 目标文件
 * @returns
 */
const copyFile = async (srcFile: string, destFile: string) => {
	try {
		await copyFiles(srcFile, destFile);
	} catch (error) {
		console.error('copyFile error:', error);
	}
};

/**
 * @description 移动文件
 * @param {string} srcFile 源文件
 * @param {string} destDir 目标目录
 */
const moveFile = async (srcFile: string | string[], destDir: string) => {
	try {
		let srcFiles = srcFile;
		if (typeof srcFile === 'string') srcFiles = [srcFile] as string[];
		// 遍历文件
		for (const file of srcFiles) {
			// 检查源文件是否存在
			if (!fs.existsSync(file)) throw new Error(`源文件不存在: ${file}`);
			// 检查目标目录是否存在，如果不存在则创建
			if (!fs.existsSync(destDir)) {
				await mkdir(destDir, { recursive: true });
			}
			const fileName = path.basename(file); // 获取文件名
			const destFile = path.join(destDir, fileName); // 构建目标文件路径
			await rename(file, destFile); // 移动文件
		}
	} catch (error) {
		console.error('移动文件时出错:', error);
	}
};

/**
 * @description 修改文件内容
 * @param {string} file 文件路径
 * @param {string | RegExp} replace 替换内容
 * @param {string} content 替换后的内容
 * @returns
 */
const modifyFileContent = async (file: string | string[], replace: string | RegExp, content: string) => {
	try {
		let files = file;
		let replaceList: FileReplaceAloneRules[] = [];
		if (typeof file === 'string') files = [file] as string[];
		if (!Array.isArray(replace)) replaceList = [{ replace, content }];
		// 遍历文件
		for (const fileItem of files) {
			// 检查文件是否存在
			if (!fs.existsSync(fileItem)) throw new Error(`文件不存在: ${fileItem}`); // 文件不存在
			let fileContent = await readFile(fileItem, 'utf-8'); // 读取文件内容
			for (const item of replaceList) {
				fileContent = fileContent.replace(item.replace, item.content); // 替换内容
			}
			await writeFile(fileItem, fileContent, 'utf-8'); // 写入文件
		}
	} catch (error) {
		console.error('modifyFileContent error:', error);
	}
};

/**
 * @description 文件内容替换插件
 * @param {FileReplaceRules} rules 文件替换规则
 * @returns
 */
// export const FileContentReplacePlugin = (rules: FileMapsRules): RsbuildPlugin => ({});

export const getFileList = async (pattern: string, options?: GlobOptionsWithFileTypesUnset) => {
	const files = await glob(pattern, options);
	return files;
};
