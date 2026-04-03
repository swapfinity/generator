<script lang="ts">
	import type { CheckboxInputDefinition } from '../input-types';

	interface Props {
		inputDefinition: CheckboxInputDefinition;
		value: boolean;
		onchange: (value: boolean) => void;
		disabled?: boolean;
	}

	let { inputDefinition, value, onchange, disabled = false }: Props = $props();
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<fieldset>
		<legend>{inputDefinition.viewName}</legend>
		<input
			type="checkbox"
			id={inputDefinition.fieldName}
			name={inputDefinition.fieldName}
			checked={value}
			onchange={(e) => onchange((e.currentTarget as HTMLInputElement).checked)}
			{disabled}
		/>
	</fieldset>
	{#if inputDefinition.description}
		<small class="description" id={inputDefinition.fieldName + '-field-id'}>
			{inputDefinition.description}
		</small>
	{/if}
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}

	.description {
		display: block;
		margin-top: 15px;
	}
</style>
