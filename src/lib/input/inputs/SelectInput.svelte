<script lang="ts">
	import type { SelectInputDefinition } from '../input-types';

	// props
	interface Props {
		inputDefinition: SelectInputDefinition;
		value: string;
		onchange: (value: string) => void;
		disabled: boolean;
	}
	let { inputDefinition, value, onchange, disabled = false }: Props = $props();
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<label for={inputDefinition.fieldName}>{inputDefinition.viewName}</label>
	<select
		name={inputDefinition.fieldName}
		aria-describedby={inputDefinition.fieldName + '-field-id'}
		{value}
		onchange={(e) => onchange((e.currentTarget as HTMLSelectElement).value)}
		{disabled}
	>
		{#each inputDefinition.options as option}
			<option value={option}>{inputDefinition.labelMap?.[option] ?? option}</option>
		{/each}
	</select>
	{#if inputDefinition.description}
		<small id={inputDefinition.fieldName + '-field-id'}>{inputDefinition.description}</small>
	{/if}
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}
</style>
