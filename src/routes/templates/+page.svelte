<script lang="ts">
	import TemplateList from '$lib/input/templates/components/TemplateList.svelte';
	import { templateSets } from '$lib/input/templates/sets/templates';
</script>

<div class="layout">
	<div class="sidebar">
		<div class="description">
			<h1>Templates</h1>
			Pick from prefined labels.
		</div>
		<TemplateList templates={templateSets} />
	</div>
</div>

<style lang="scss">
	.layout {
		height: 100%;
	}

	.sidebar {
		height: 100%;
		padding: var(--pico-spacing) 0;
		overflow-y: auto;
	}

	.description {
		padding-bottom: calc(var(--pico-spacing) * 3);
	}
</style>
