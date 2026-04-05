<script lang="ts">
	import { Download } from 'lucide-svelte';
	// @ts-ignore
	import * as stlSerializer from '@jscad/stl-serializer';
	const { serialize, mimeType } = stlSerializer;
	import type { GenerationResult } from '$lib/generation/types/generation-result';

	interface ModelStlExporterProps {
		generationResult: GenerationResult | null;
		fileName: string;
	}
	let { generationResult, fileName = 'model' }: ModelStlExporterProps = $props();
	const fullFileName = $derived(`${fileName}.stl`);

	const downloadAsFile = (content: BlobPart[], fileName: string, contentType: string) => {
		const blob = new Blob(content, { type: contentType });
		const url = URL.createObjectURL(blob);

		// create temporary element & trigger download
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		a.style.display = 'none';

		document.body.appendChild(a);
		a.click();

		// clean up
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const handleButtonClick = () => {
		if (!generationResult?.geometry) {
			return;
		}

		const serializedGeometry = serialize({}, generationResult.geometry);
		downloadAsFile(serializedGeometry, fullFileName, mimeType);
	};
</script>

<button onclick={handleButtonClick} disabled={!generationResult?.geometry} class="download-button">
	{#if generationResult?.geometry}
		<Download /> Download as STL
	{:else}
		<span aria-busy="true"></span>
	{/if}
</button>

<style lang="scss">
	.download-button {
		width: 100%;
	}
</style>
