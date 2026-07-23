<script lang="ts">
	import { packageStore } from '$lib/input/package/package.svelte';
	import { Package, PackageCheck, PackagePlus } from 'lucide-svelte';
	import type { TemplateSet } from '../types/template-types';
	import OpenInEditorButton from '$lib/shared/components/OpenInEditorButton.svelte';

	// props
	interface Props {
		templates: TemplateSet[];
	}
	let { templates }: Props = $props();

	let searchQuery = $state('');
	const filteredTemplates = $derived(
		templates.filter((template) => {
			const query = searchQuery.toLowerCase();
			return (
				template.displayName.toLowerCase().includes(query) ||
				template.description?.toLowerCase()?.includes(query) ||
				template.tags.some((tag) => tag.toLowerCase().includes(query))
			);
		})
	);

	const getLabelDefinitions = (templateSet: TemplateSet) =>
		templateSet.entries.map((entry) => entry.labelDefinition);
</script>

<input type="search" bind:value={searchQuery} placeholder="Search templates..." />

<div>
	{#each filteredTemplates as template}
		<article>
			<details class="template-card">
				<summary>
					<div class="card-header">
						<h2>{template.displayName}</h2>
						<button
							class="secondary"
							onclick={(e) => {
								e.preventDefault();
								packageStore.addAll(getLabelDefinitions(template));
							}}
							disabled={!packageStore.mayAddAmount(template.entries.length) ||
								packageStore.containsAll(getLabelDefinitions(template))}
						>
							{#if packageStore.containsAll(getLabelDefinitions(template))}
								<PackageCheck /> Already in Package
							{:else if !packageStore.mayAddAmount(template.entries.length)}
								<Package /> Package is too full
							{:else}
								<PackagePlus /> Add Full Set to Package ({template.entries.length})
							{/if}
						</button>
					</div>
					<p class="description">
						{template.description}
					</p>
				</summary>

				<div class="entries-list">
					{#each template.entries as entry}
						<div class="entry-item">
							<span>{entry.displayName}</span>
							<div class="action-container">
								<OpenInEditorButton label={entry.labelDefinition} />
								<button
									class="icon-button"
									onclick={() => packageStore.add(entry.labelDefinition)}
									disabled={packageStore.isFull || packageStore.contains(entry.labelDefinition)}
								>
									<PackagePlus />
								</button>
							</div>
						</div>
					{/each}
				</div>
			</details>
		</article>
	{/each}
</div>

<style lang="scss">
	.template-card {
		summary {
			display: flex;
			flex-direction: column;
			gap: var(--pico-spacing);
			user-select: none;

			.description {
				user-select: text;
				width: fit-content;
			}
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--pico-muted-border-color);
		padding-bottom: var(--pico-spacing);
	}

	.entries-list {
		display: flex;
		flex-direction: column;
		gap: var(--pico-spacing);
	}

	.entry-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--pico-muted-border-color);
	}

	.action-container {
		display: flex;
		align-items: center;
	}
</style>
