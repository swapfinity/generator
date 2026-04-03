<script lang="ts">
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
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';
	import { onMount } from 'svelte';

	let fonts = $state<Fonts | null>(null);
	let loading = $state<boolean>(true);
	let userInput = $state<LabelDefinition>({});

	onMount(async () => {
		const [regular, bold, extraBold] = await Promise.all([
			loadOverpassRegularFont(),
			loadOverpassBoldFont(),
			loadOverpassExtraBoldFont()
		]);

		fonts = { regular, bold, extraBold };
		loading = false;
	});

	const geometryToRender = $derived.by(() => {
		if (!fonts) {
			return null;
		}

		return generateLabelGeometry(userInput, fonts);
	});

	const handleFormChange = (updatedUserInput: LabelDefinition) => {
		userInput = updatedUserInput;
	};
</script>

<div class="layout">
	<div class="sidebar">
		<div>
			<div class="description">
				<h1>Custom Labels</h1>
				Create any custom label you need.
			</div>
			<SchemaBasedUserInput onChange={handleFormChange} />
		</div>
		<ModelStlExporter {geometryToRender} fileName="label" />
	</div>
	<div class="viewer">
		{#if loading}
			<span aria-busy="true">Loading…</span>
		{:else if geometryToRender}
			<ModelViewer {geometryToRender} />
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
