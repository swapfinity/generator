<script lang="ts">
	import type { Geom3 } from '@jscad/modeling/src/geometries/types';
	// @ts-ignore
	import * as stlSerializer from '@jscad/stl-serializer';
	const { serialize, mimeType, fileExtension } = stlSerializer;

	interface ModelStlExporterProps {
		geometryToRender: Geom3 | Geom3[];
		fileName: string | undefined;
	} //TODO error if fileName doesnt end on fileExtension

	let { geometryToRender, fileName = 'model.' + fileExtension }: ModelStlExporterProps = $props();

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
		downloadAsFile(serializedGeometry, fileName, mimeType);
	};
</script>

<button onclick={handleButtonClick}>Download as STL</button>
