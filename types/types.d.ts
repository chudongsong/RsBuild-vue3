declare type AnyFunction<T = any> = (...args: any) => T;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
declare interface AnyObject extends Object {
	[anyKey: PropertyKey]: any;
}

declare module 'asciinema-player';

declare module 'v-contextmenu';

declare module 'vue-top-progress';

declare module 'qrcode';

declare module 'element-plus/dist/locale/zh-cn.mjs';

declare module 'vue-virtual-scroller';
