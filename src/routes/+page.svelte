<script lang="ts">
	import ModelStlExporter from '$lib/exporter/ModelStlExporter.svelte';
	import { generateLabelGeometry } from '$lib/util/label-gen';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';

	const geometryToRender = generateLabelGeometry();
</script>

<main class="container">
	<h1>Welcome to SvelteKit</h1>
	<p>
		Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation
	</p>
	<input type="text" name="text" placeholder="Test" aria-label="Text" />
	<ModelViewer {geometryToRender} />
	<ModelStlExporter {geometryToRender} fileName={'label.stl'} />
</main>
