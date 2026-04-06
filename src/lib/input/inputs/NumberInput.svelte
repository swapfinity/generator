<script lang="ts">
	import type { GenerationNotification } from '$lib/generation/general/notifications';
	import type { NumberInputDefinition } from '../input-types';
	import type { LocalNotification } from '../local-notification-types';
	import InputHint from './InputHint.svelte';

	// props
	interface NumberInputProps {
		inputDefinition: NumberInputDefinition;
		value: number;
		onchange: (value: number) => void;
		disabled: boolean;
		generationNotification?: GenerationNotification | null;
	}
	let {
		inputDefinition,
		value,
		onchange,
		disabled = false,
		generationNotification
	}: NumberInputProps = $props();

	const softLimitNotification = $derived.by<LocalNotification | null>(() => {
		if (inputDefinition.softMin !== undefined && value < inputDefinition.softMin) {
			return {
				level: 'WARN',
				message: `Value below recommended minimum of ${inputDefinition.softMin}`
			};
		}
		if (inputDefinition.softMax !== undefined && value > inputDefinition.softMax) {
			return {
				level: 'WARN',
				message: `Value above recommended maximum of ${inputDefinition.softMax}`
			};
		}
		return null;
	});

	let localNotification = $state<LocalNotification | null>(null);
	const activeNotification = $derived(localNotification ?? softLimitNotification);

	const handleInput = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		let newValue = input.valueAsNumber;

		if (isNaN(newValue)) {
			localNotification = { level: 'ERROR', message: `Value is not a number` };
			return;
		}

		// hard limits
		if (inputDefinition.min !== undefined && newValue < inputDefinition.min) {
			localNotification = { level: 'ERROR', message: `Minimum value is ${inputDefinition.min}` };
			return;
		} else if (inputDefinition.max !== undefined && newValue > inputDefinition.max) {
			localNotification = { level: 'ERROR', message: `Maximum value is ${inputDefinition.max}` };
			return;
		} else {
			localNotification = null;
		}

		onchange(newValue);
	};
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<label for={inputDefinition.fieldName}>{inputDefinition.viewName}</label>
	<input
		type="number"
		id={inputDefinition.fieldName}
		name={inputDefinition.fieldName}
		{value}
		oninput={handleInput}
		{disabled}
		step={inputDefinition.step}
		min={inputDefinition.softMin}
		max={inputDefinition.softMax}
		aria-invalid={generationNotification?.level === 'ERROR' || activeNotification?.level === 'ERROR'
			? 'true'
			: undefined}
		class={generationNotification?.level === 'WARN' || activeNotification?.level === 'WARN'
			? 'warn'
			: undefined}
	/>
	<InputHint
		{generationNotification}
		localNotification={activeNotification}
		description={inputDefinition.description}
	/>
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}
</style>
