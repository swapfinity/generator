<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ModelStlExporter from '$lib/exporter/components/ModelStlExporter.svelte';
	import { globalGenerator } from '$lib/generation/util/global-generator-util';
	import AddToPackageButton from '$lib/input/package/components/AddToPackageButton.svelte';
	import SchemaBasedUserInput from '$lib/input/SchemaBasedUserInput.svelte';
	import { type LabelDefinition } from '$lib/input/schemas/general-schemas';
	import { getFonts, loadFonts } from '$lib/shared/font-store.svelte';
	import { safeParseFromBase64, USER_INPUT_PARAM_NAME } from '$lib/shared/utils/url-util';
	import ModelViewer from '$lib/viewer/ModelViewer.svelte';
	import { onMount } from 'svelte';

	let loading = $state<boolean>(true);

	const userInput: LabelDefinition = $derived.by(() => {
		const param = $page.url.searchParams.get(USER_INPUT_PARAM_NAME); //TODO fix deprecated
		return safeParseFromBase64<LabelDefinition>(param) ?? ({} as LabelDefinition);
	});

	onMount(async () => {
		await loadFonts();
		loading = false;
	});

	const generationResult = $derived.by(() => {
		const fonts = getFonts();
		if (!fonts) {
			return null;
		}

		return globalGenerator.generate(userInput, fonts);
	});

	const handleFormChange = (updatedUserInput: LabelDefinition) => {
		const encoded = btoa(JSON.stringify(updatedUserInput));
		goto(`?${USER_INPUT_PARAM_NAME}=${encoded}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	};
</script>

<div class="layout">
	<div class="sidebar">
		<div>
			<div class="description">
				<h1>Custom Labels</h1>
				Create any custom label you need.
			</div>
			<SchemaBasedUserInput value={userInput} onChange={handleFormChange} {generationResult} />
		</div>
		<div class="action-container">
			<div class="download-button-container">
				<ModelStlExporter {generationResult} fileName="label" />
			</div>
			<div class="add-to-package-button-container">
				<AddToPackageButton labelDefinition={userInput} />
			</div>
		</div>
	</div>
	<div class="viewer">
		{#if loading}
			<span aria-busy="true">Loading…</span>
		{:else if generationResult}
			<ModelViewer {generationResult} />
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

	.action-container {
		display: flex;
		align-items: center;
		gap: var(--pico-spacing);
	}
	.download-button-container {
		flex: 3 0 auto;
	}

	.add-to-package-button-container {
		flex: 1 0 auto;
	}
</style>
