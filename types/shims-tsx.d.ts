import Vue, { VNode } from 'vue'
import { ComponentRenderProxy } from '@vue/composition-api'

declare global {
	namespace JSX {
		interface Element extends VNode {}
		interface ElementClass extends ComponentRenderProxy {}
		interface ElementAttributesProperty {
			$props: Record<string, unknown> // specify the property name to use
		}
		interface IntrinsicElements {
			[elem: string]: any
		}
	}
}
