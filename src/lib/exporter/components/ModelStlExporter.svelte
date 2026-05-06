<script lang="ts">
	import { Download } from 'lucide-svelte';

	import type { GenerationResult } from '$lib/generation/types/generation-result';
	import { downloadBinaryAsFile } from '../util/download-util';
	import { serializeToStlBinary, STL_MIME_TYPE } from '../util/stl-export-util';

	interface ModelStlExporterProps {
		generationResult: GenerationResult | null;
		fileName: string;
	}
	let { generationResult, fileName = 'model' }: ModelStlExporterProps = $props();
	const fullFileName = $derived(`${fileName}.stl`);

	const handleButtonClick = () => {
		if (!generationResult?.geometry) {
			return;
		}

		const serializedGeometry = serializeToStlBinary(generationResult.geometry);
		downloadBinaryAsFile(serializedGeometry, fullFileName, STL_MIME_TYPE);
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
