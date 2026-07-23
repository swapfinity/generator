<script lang="ts">
	import { goto } from '$app/navigation';
	import type { LabelDefinition } from '$lib/input/schemas/general-schemas';
	import { FileBox } from 'lucide-svelte';
	import { USER_INPUT_PARAM_NAME } from '../utils/url-util';
	import { hover } from '../has-hover.svelte';

	// props
	interface Props {
		label: LabelDefinition;
		baseEditorPath?: string;
		action?: () => void;
	}
	let { label, baseEditorPath = '/', action }: Props = $props();

	const openInEditor = (labelDefinition: LabelDefinition) => {
		const encoded = btoa(JSON.stringify(labelDefinition));
		action?.();
		goto(`${baseEditorPath}?${USER_INPUT_PARAM_NAME}=${encoded}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	};
</script>

<button
	class="icon-button"
	onclick={() => openInEditor(label)}
	data-tooltip={hover.present ? 'Open in Editor' : undefined}
>
	<FileBox />
</button>
