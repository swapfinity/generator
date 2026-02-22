<script lang="ts">
	import ModelStlExporter from '$lib/exporter/ModelStlExporter.svelte';
	import {
		loadOverpassBoldFont,
		loadOverpassExtraBoldFont,
		loadOverpassRegularFont
	} from '$lib/generation/font-utils';
	import { generateLabelGeometry } from '$lib/generation/label-gen';
	import { ScrewLabelSchema } from '$lib/generation/screws/screw-schema';
	import SchemaBasedUserInput from '$lib/input/SchemaBasedUserInput.svelte';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';

	let text = 'Key Chains';
	let lastValidText = text;
	const fontPromise = loadOverpassExtraBoldFont();
	$: geometryPromise = fontPromise.then((font) => {
		let textForLabel: string;
		if (!text) {
			//TODO better validity check
			textForLabel = lastValidText;
		} else {
			textForLabel = text;
			lastValidText = text;
		}
		return generateLabelGeometry(textForLabel, font, font);
	});
</script>

<main class="container">
	<h1>Swapfinity Label Generator</h1>
	<p>Generate a custom label fitting your needs.</p>
	<input type="text" name="text" placeholder="Test" aria-label="Text" bind:value={text} />
	{#await geometryPromise}
		<span aria-busy="true">Loading…</span>
	{:then geometryToRender}
		<ModelViewer {geometryToRender} />
		<SchemaBasedUserInput schema={ScrewLabelSchema} />
		<ModelStlExporter {geometryToRender} fileName="label.stl" />
	{/await}
</main>
