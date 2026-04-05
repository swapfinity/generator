<script lang="ts">
	import { FieldNotifications } from '$lib/generation/general/notifications';
	import type { TextInputDefinition } from '../input-types';
	import InputHint from './InputHint.svelte';

	interface TextInputProps {
		inputDefinition: TextInputDefinition;
		value: string;
		onchange: (value: string) => void;
		disabled?: boolean;
		notifications?: FieldNotifications | null;
	}
	let {
		inputDefinition,
		value,
		onchange,
		disabled = false,
		notifications
	}: TextInputProps = $props();

	const notification = $derived(notifications?.getFirst(inputDefinition.fieldName) ?? null);
</script>

<div class="input-container" style={`flex: ${inputDefinition.rowWeight ?? 1} 1 0;`}>
	<label for={inputDefinition.fieldName}>{inputDefinition.viewName}</label>
	<input
		type="text"
		id={inputDefinition.fieldName}
		name={inputDefinition.fieldName}
		{value}
		oninput={(e) => onchange((e.currentTarget as HTMLInputElement).value)}
		{disabled}
		placeholder={inputDefinition.description}
		aria-invalid={notification?.level === 'ERROR' ? 'true' : undefined}
		class={notification?.level === 'WARN' ? 'warn' : undefined}
	/>
	<InputHint {notification} description={inputDefinition.description} />
</div>

<style lang="scss">
	.input-container {
		min-width: 100px;
	}
</style>
