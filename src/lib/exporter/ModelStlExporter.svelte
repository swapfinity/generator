<script lang="ts">
	import type { Geom3 } from '@jscad/modeling/src/geometries/types';
	import { Download } from 'lucide-svelte';
	// @ts-ignore
	import * as stlSerializer from '@jscad/stl-serializer';
	const { serialize, mimeType } = stlSerializer;

	interface ModelStlExporterProps {
		geometryToRender: Geom3 | Geom3[] | null;
		fileName: string;
	}
	let { geometryToRender, fileName = 'model' }: ModelStlExporterProps = $props();
	const fullFileName = $derived(`${fileName}.stl`);

	const generateMesh = () => {
		return serialize({}, geometryToRender);
	};

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
		const serializedGeometry = generateMesh();
		downloadAsFile(serializedGeometry, fullFileName, mimeType);
	};
</script>

<button onclick={handleButtonClick} disabled={!geometryToRender} class="download-button">
	{#if geometryToRender}
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
