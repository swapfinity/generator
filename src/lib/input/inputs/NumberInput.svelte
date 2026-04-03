<script lang="ts">
	import type { NumberInputDefinition } from '../input-types';

	interface NumberInputProps {
		inputDefinition: NumberInputDefinition;
		value: number;
		onchange: (value: number) => void;
		disabled: boolean;
	}

	let { inputDefinition, value, onchange, disabled = false }: NumberInputProps = $props();
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<label for={inputDefinition.fieldName}>{inputDefinition.viewName}</label>
	<input
		type="number"
		id={inputDefinition.fieldName}
		name={inputDefinition.fieldName}
		{value}
		onchange={(e) => onchange(Number((e.currentTarget as HTMLInputElement).value))}
		{disabled}
		step={inputDefinition.step}
		min={inputDefinition.min}
		max={inputDefinition.max}
	/>
	{#if inputDefinition.description}
		<small>{inputDefinition.description}</small>
	{/if}
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}
</style>
