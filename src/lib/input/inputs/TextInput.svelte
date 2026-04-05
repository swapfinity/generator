<script lang="ts">
	import { GenerationNotifications } from '$lib/generation/general/notifications';
	import type { TextInputDefinition } from '../input-types';
	import InputHint from '$lib/input/inputs/InputHint.svelte';
	import type { LocalNotification } from '../local-notification-types';

	interface TextInputProps {
		inputDefinition: TextInputDefinition;
		value: string;
		onchange: (value: string) => void;
		disabled?: boolean;
		notifications?: GenerationNotifications | null;
	}
	let {
		inputDefinition,
		value,
		onchange,
		disabled = false,
		notifications
	}: TextInputProps = $props();

	const generationNotification = $derived(
		notifications?.getFirst(inputDefinition.fieldName) ?? null
	);

	let localNotification = $state<LocalNotification | null>(null);
	let errorTimeout: ReturnType<typeof setTimeout> | null = null;

	const handleInput = (e: Event) => {
		const newValue = (e.currentTarget as HTMLInputElement).value;

		for (const { pattern, message } of inputDefinition.patterns ?? []) {
			if (!new RegExp(pattern).test(newValue)) {
				(e.currentTarget as HTMLInputElement).value = value;
				localNotification = { level: 'ERROR', message };
				if (errorTimeout) {
					clearTimeout(errorTimeout);
				}
				errorTimeout = setTimeout(() => (localNotification = null), 3000);
				return;
			}
		}
		localNotification = null;
		onchange(newValue);
	};
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<label for={inputDefinition.fieldName}>{inputDefinition.viewName}</label>
	<input
		type="text"
		id={inputDefinition.fieldName}
		name={inputDefinition.fieldName}
		{value}
		oninput={handleInput}
		{disabled}
		placeholder={inputDefinition.description}
		aria-invalid={generationNotification?.level === 'ERROR' || localNotification?.level === 'ERROR'
			? 'true'
			: undefined}
		class={generationNotification?.level === 'WARN' || localNotification?.level === 'WARN'
			? 'warn'
			: undefined}
	/>
	<InputHint
		{generationNotification}
		{localNotification}
		description={inputDefinition.description}
	/>
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}
</style>
