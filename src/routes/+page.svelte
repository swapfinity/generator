<script lang="ts">
	import { goto } from '$app/navigation';
	import ModelStlExporter from '$lib/exporter/ModelStlExporter.svelte';
	import {
		loadOverpassBoldFont,
		loadOverpassExtraBoldFont,
		loadOverpassRegularFont,
		type Fonts
	} from '$lib/generation/general/font-utils';
	import { generateLabelGeometry } from '$lib/generation/general/label-gen';
	import SchemaBasedUserInput from '$lib/input/SchemaBasedUserInput.svelte';
	import type { LabelDefinition } from '$lib/input/schemas/general-schemas';
	import { safeParseFromBase64 } from '$lib/shared/utils/url-util';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';
	import { onMount } from 'svelte';

	const URL_PARAM_NAME = 'input';

	let fonts = $state<Fonts | null>(null);
	let loading = $state<boolean>(true);

	const param = new URLSearchParams(window.location.search).get(URL_PARAM_NAME);
	const parsedParam = safeParseFromBase64<LabelDefinition>(param);

	if (param && !parsedParam) {
		goto('', { replaceState: true });
	}

	let userInput = $state<LabelDefinition>(parsedParam as LabelDefinition);

	onMount(async () => {
		const [regular, bold, extraBold] = await Promise.all([
			loadOverpassRegularFont(),
			loadOverpassBoldFont(),
			loadOverpassExtraBoldFont()
		]);

		fonts = { regular, bold, extraBold };
		loading = false;
	});

	const generationResult = $derived.by(() => {
		if (!fonts) {
			return null;
		}

		return generateLabelGeometry(userInput, fonts);
	});

	const handleFormChange = (updatedUserInput: LabelDefinition) => {
		userInput = updatedUserInput;
		const encoded = btoa(JSON.stringify(updatedUserInput));
		goto(`?${URL_PARAM_NAME}=${encoded}`, { replaceState: true, noScroll: true, keepFocus: true });
	};
</script>

<div class="layout">
	<div class="sidebar">
		<div>
			<div class="description">
				<h1>Custom Labels</h1>
				Create any custom label you need.
			</div>
			<SchemaBasedUserInput
				initialValue={userInput}
				onChange={handleFormChange}
				{generationResult}
			/>
		</div>
		<ModelStlExporter {generationResult} fileName="label" />
	</div>
	<div class="viewer">
		{#if loading}
			<span aria-busy="true">Loading…</span>
		{:else if generationResult}
			<ModelViewer {generationResult} />
		{/if}
	</div>
</div>

<style lang="scss">
	.layout {
		display: flex;
		height: 100%;
	}

	.sidebar {
		flex: 1 1 768px;
		padding: var(--pico-spacing) 0;
		overflow-y: auto;
		margin-right: var(--pico-spacing);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow-y: auto;
	}

	.viewer {
		flex: 1 1 400px;
		height: 100%;
		padding: var(--pico-spacing) 0;
	}

	@media (max-width: 1024px) {
		.layout {
			flex-direction: column;
		}
		.viewer {
			order: 1;
			height: 250px;
			flex: none;
		}
		.sidebar {
			order: 2;
			margin-right: 0;
		}
	}

	.description {
		padding-bottom: calc(var(--pico-spacing) * 3);
	}
</style>
