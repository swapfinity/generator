<script lang="ts">
	import { PackageCheck, PackagePlus } from 'lucide-svelte';
	import type { LabelDefinition } from '../../schemas/general-schemas';
	import { packageStore } from '../package.svelte';

	// props
	interface AddToPackageButtonProps {
		labelDefinition: LabelDefinition | null;
	}
	let { labelDefinition }: AddToPackageButtonProps = $props();

	const labelDefinitionInPackage = $derived(packageStore.contains(labelDefinition));
</script>

<button
	disabled={labelDefinitionInPackage}
	class="add-button secondary"
	onclick={() => packageStore.add(labelDefinition)}
>
	{#if !labelDefinition}
		<span aria-busy="true"></span>
	{:else if labelDefinitionInPackage}
		<PackageCheck /> Already in Package
	{:else}
		<PackagePlus /> Add to Package
	{/if}
</button>

<style lang="scss">
	.add-button {
		width: 100%;
		min-width: 12rem;
	}
</style>
