<script lang="ts">
	import { Download } from 'lucide-svelte';

	import { downloadAsZip } from '../util/download-util';
	import { packageStore } from '$lib/input/package/package.svelte';
	import { runBulkExport } from '../workers/bulk-export-worker-client.svelte';

	let loading = $state(false);

	const handleButtonClick = async () => {
		if (loading) {
			return;
		}
		loading = true;
		try {
			const files = await runBulkExport(packageStore.entries);
			downloadAsZip(files, 'labels.zip');
		} finally {
			loading = false;
		}
	};
</script>

<button
	onclick={handleButtonClick}
	disabled={loading || packageStore.isEmpty}
	class="download-button"
>
	{#if loading}
		<span aria-busy="true">Loading…</span>
	{:else}
		<Download /> Download all as ZIP
	{/if}
</button>

<style lang="scss">
	.download-button {
		width: 100%;
	}
</style>
