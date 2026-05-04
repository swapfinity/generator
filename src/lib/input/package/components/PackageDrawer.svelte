<script lang="ts">
	import { FileBox, Package, Trash, X } from 'lucide-svelte';
	import { packageStore } from '../package.svelte';
	import { fly } from 'svelte/transition';
	import type { LabelDefinition } from '../../schemas/general-schemas';
	import { goto } from '$app/navigation';
	import { USER_INPUT_PARAM_NAME } from '$lib/shared/utils/url-util';
	import PackageStlExporter from '$lib/exporter/components/PackageStlExporter.svelte';
	import ClearPackageButton from './ClearPackageButton.svelte';

	let isOpen = $state(false);

	const toggleDrawer = () => {
		isOpen = !isOpen;
	};

	const closeDrawer = () => {
		isOpen = false;
	};

	const openInEditor = (labelDefinition: LabelDefinition) => {
		const encoded = btoa(JSON.stringify(labelDefinition));
		closeDrawer();
		goto(`?${USER_INPUT_PARAM_NAME}=${encoded}`, {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	};
</script>

<button class="icon-button" onclick={toggleDrawer}>
	<Package />
	{#if packageStore.count > 0}
		<span class="badge">{packageStore.count}</span>
	{/if}
</button>

{#if isOpen}
	<button class="backdrop" onclick={closeDrawer} aria-label="Close package drawer"></button>
	<div class="drawer" in:fly={{ x: 640, duration: 250 }} out:fly={{ x: 640, duration: 250 }}>
		<div class="drawer-header">
			<h2>Package</h2>
			<button class="icon-button" onclick={closeDrawer}><X /></button>
		</div>
		<div class="drawer-content">
			{#if packageStore.isEmpty}
				<div class="empty-state">No labels added yet.</div>
			{:else}
				{#each packageStore.entries as { label, filename }, i}
					<div class="drawer-item">
						<span>{filename}</span>
						<div class="action-container">
							<button class="icon-button" onclick={() => openInEditor(label)}>
								<FileBox />
							</button>
							<button class="icon-button" onclick={() => packageStore.remove(i)}>
								<Trash />
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
		<div class="drawer-footer">
			<PackageStlExporter />
			<ClearPackageButton />
		</div>
	</div>
{/if}

<style lang="scss">
	.badge {
		position: absolute;
		top: 0.7rem;
		right: 0.8rem;
		background: var(--pico-primary);
		color: white;
		border-radius: 50%;
		font-size: 0.7rem;
		width: 1.2rem;
		height: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 10;
		padding: 0;
		cursor: default;
		border-radius: 0;
		border: none;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: 768px;
		background: var(--pico-background-color);
		z-index: 11;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		box-shadow: -4px 0 12px rgba(0, 0, 0, 0.2);
	}

	.drawer-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.drawer-content {
		overflow-y: auto;
	}

	.drawer-footer {
		margin-top: calc(var(--pico-spacing) * 2);
		display: flex;
		gap: var(--pico-spacing);
	}

	.drawer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}

	.action-container {
		display: flex;
		align-items: center;
	}

	.empty-state {
		color: var(--pico-muted-color);
	}
</style>
