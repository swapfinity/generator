<script lang="ts">
	import { Package, Trash } from 'lucide-svelte';
	import { packageStore } from './package.svelte';
	import { fly } from 'svelte/transition';

	let isOpen = $state(false);

	const toggleDrawer = () => {
		isOpen = !isOpen;
	};

	const closeDrawer = () => {
		isOpen = false;
	};
</script>

<button class="icon-button" onclick={toggleDrawer}>
	<Package />
	{#if packageStore.count > 0}
		<span class="badge">{packageStore.count}</span>
	{/if}
</button>

{#if isOpen}
	<div class="backdrop" onclick={closeDrawer}></div>
	<div class="drawer" in:fly={{ x: 640, duration: 250 }} out:fly={{ x: 640, duration: 250 }}>
		<div class="drawer-header">
			<h2>Package</h2>
			<button class="icon-button" onclick={closeDrawer}>✕</button>
		</div>
		<div class="drawer-content">
			{#if packageStore.labels.length === 0}
				<p>No labels added yet.</p>
			{:else}
				{#each packageStore.labels as label, i}
					<div class="drawer-item">
						<span>{packageStore.filenames[i]}</span>
						<button class="icon-button" onclick={() => packageStore.remove(i)}>
							<Trash />
						</button>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	.badge {
		position: absolute;
		top: 0.8rem;
		right: 1rem;
		background: var(--pico-primary);
		color: white;
		border-radius: 50%;
		font-size: 0.7rem;
		width: 1.1rem;
		height: 1.1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 10;
	}

	.drawer {
		position: fixed;
		top: 0;
		right: 0;
		height: 100%;
		width: 640px;
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

	.drawer-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}
</style>
