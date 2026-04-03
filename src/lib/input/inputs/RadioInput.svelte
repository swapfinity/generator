<script lang="ts">
	import type { RadioInputDefinition } from '../input-types';

	// props
	interface RadioInputProps {
		inputDefinition: RadioInputDefinition;
		value: string;
		onchange: (value: string) => void;
		disabled: boolean;
	}
	let { inputDefinition, value, onchange, disabled = false }: RadioInputProps = $props();
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<fieldset>
		<legend>{inputDefinition.viewName}</legend>
		{#each inputDefinition.options as option}
			<input
				type="radio"
				id={`${inputDefinition.fieldName}-${option}`}
				name={inputDefinition.fieldName}
				checked={value === option}
				onchange={() => onchange(option)}
				{disabled}
			/>
			<label for={`${inputDefinition.fieldName}-${option}`}>
				{inputDefinition.labelMap?.[option] ?? option}
			</label>
		{/each}
	</fieldset>
	{#if inputDefinition.description}
		<small class="description">{inputDefinition.description}</small>
	{/if}
</div>

<style lang="scss">
	.input-container {
		min-width: max-content;

		fieldset {
			width: 100%;
			padding: 0.45rem 0;

			input[type='radio'] {
				overflow: visible;
			}
		}
	}

	.description {
		margin-top: 6px;
	}
</style>
