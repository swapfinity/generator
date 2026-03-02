<script lang="ts">
	import ModelStlExporter from '$lib/exporter/ModelStlExporter.svelte';
	import {
		loadOverpassBoldFont,
		loadOverpassExtraBoldFont,
		loadOverpassRegularFont
	} from '$lib/generation/font-utils';
	import { generateLabelGeometry } from '$lib/generation/label-gen';
	import type { LabelDefinition } from '$lib/generation/screws/screw-schema';
	import SchemaBasedUserInput from '$lib/input/SchemaBasedUserInput.svelte';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';

	let geometryPromise = $state<Promise<any> | null>(null);
	const fontPromise = loadOverpassExtraBoldFont();
	const handleFormChange = (updated: LabelDefinition) => {
		console.log('UPDATE2: ', updated);
		geometryPromise = fontPromise
			.then((font) => generateLabelGeometry(updated, font, font))
			.catch((err) => {
				console.error('Failed to generate geometry', err);
				return null;
			});
	};
</script>

<main class="container">
	<h1>Swapfinity Label Generator</h1>
	<p>Generate a custom label fitting your needs.</p>
	{#await geometryPromise}
		<span aria-busy="true">Loading…</span>
	{:then geometryToRender}
		<ModelViewer {geometryToRender} />
		<ModelStlExporter {geometryToRender} fileName="label.stl" />
	{/await}
	<SchemaBasedUserInput onChange={handleFormChange} />
</main>
