// uno.config.ts
import { defineConfig, presetAttributify, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss';
import presetRemToPx from '@unocss/preset-rem-to-px';

export default defineConfig({
	shortcuts: {
		btCustomForm: 'px-[2rem] py-[2.4rem]',
	},
	content: {
		filesystem: ['./src/**/*.{html,vue,jsx,tsx,ts}'],
	},
	theme: {
		colors: {
			white: '#fff',
			orange: '#fc6d26',
			primary: '#20a53a',
			primaryLight: '#f0f9eb',
			warning: '#e6a23c',
			danger: '#ef0808',
			black: '#000',
			dark: '#333',
			medium: '#666',
			light: '#999',
			lighter: '#ccc',
			lightest: '#f5f5f5',
		},
		backgroundColor: {
			white: '#fff',
			primary: '#20a53a',
			primaryLight: '#f0f9eb',
			aside: '#3c444d',
			black: '#000',
			dark: '#333',
			medium: '#666',
			light: '#999',
			orange: '#fc6d26',
			warning: '#e6a23c',
			danger: '#ef0808',
		},
		borderColor: {
			white: '#fff',
			primary: '#20a53a',
			primaryLight: '#f0f9eb',
			aside: '#3c444d',
			black: '#000',
			dark: '#333',
			medium: '#666',
			light: '#999',
			orange: '#fc6d26',
			warning: '#e6a23c',
			danger: '#ef0808',
		},
		borderRadius: {
			none: '0',
			sm: '0.125rem',
			default: '0.25rem',
			md: '0.375rem',
			lg: '0.5rem',
			full: '9999px',
		},
	},
	presets: [
		presetRemToPx({
			baseFontSize: 10,
		}), // rem转px
		presetUno(), // 基础配置
		presetAttributify(), // 属性配置，使用属性方式归类参数
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
});
