<script lang="ts">
	import ModelStlExporter from '$lib/exporter/ModelStlExporter.svelte';
	import {
		loadOverpassBoldFont,
		loadOverpassExtraBoldFont,
		loadOverpassRegularFont
	} from '$lib/generation/general/font-utils';
	import { generateLabelGeometry } from '$lib/generation/general/label-gen';
	import SchemaBasedUserInput from '$lib/input/SchemaBasedUserInput.svelte';
	import type { LabelDefinition } from '$lib/input/schemas/general-schemas';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';

	let geometryPromise = $state<Promise<any> | null>(null);
	const fontPromise = loadOverpassExtraBoldFont();
	const handleFormChange = (updated: LabelDefinition) => {
		geometryPromise = fontPromise
			.then((font) => generateLabelGeometry(updated, font, font))
			.catch((err) => {
				console.error('Failed to generate geometry', err);
				return null;
			});
	};
</script>

{#await geometryPromise}
	<span aria-busy="true">Loading…</span>
{:then geometryToRender}
	<ModelViewer {geometryToRender} />
	<ModelStlExporter {geometryToRender} fileName="label.stl" />
{/await}
<SchemaBasedUserInput onChange={handleFormChange} />
