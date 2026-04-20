<script lang="ts">
	import z from 'zod';
	import type { BaseInputDefinition, GroupedInputs, InputDefinition } from './input-types';
	import {
		LABEL_SCHEMA_MAP,
		type LabelDefinition,
		type ObjectMeta
	} from './schemas/general-schemas';
	import { ListRestart } from 'lucide-svelte';
	import SelectInput from './inputs/SelectInput.svelte';
	import RadioInput from './inputs/RadioInput.svelte';
	import CheckboxInput from './inputs/CheckboxInput.svelte';
	import NumberInput from './inputs/NumberInput.svelte';
	import type { RowDefinition, RowDefinitions } from './row-types';
	import ShareButton from '$lib/shared/components/ShareButton.svelte';
	import type { GenerationResult } from '$lib/generation/types/generation-result';
	import TextInput from './inputs/TextInput.svelte';

	// props
	interface SchemaBasedUserInputProps {
		initialValue?: LabelDefinition;
		onChange: (updated: LabelDefinition) => void;
		generationResult: GenerationResult | null;
	}
	let { initialValue, onChange, generationResult }: SchemaBasedUserInputProps = $props();

	const initialKey = (initialValue?.type ??
		Object.keys(LABEL_SCHEMA_MAP)[0]) as keyof typeof LABEL_SCHEMA_MAP;

	let selectedKey = $state<keyof typeof LABEL_SCHEMA_MAP>(initialKey);

	let derivedSchema = $derived(LABEL_SCHEMA_MAP[selectedKey].schema);
	let result = $state<LabelDefinition & Record<string, any>>(
		LABEL_SCHEMA_MAP[initialKey].schema.parse(initialValue ?? {})
	);

	$effect(() => {
		const currentResult = $state.snapshot(result);

		onChange(currentResult as LabelDefinition);
	});

	const groupByRow = (inputs: InputDefinition[]): Record<string, InputDefinition[]> => {
		const rows: Record<string, InputDefinition[]> = {};

		for (const input of inputs) {
			const rowKey = input.rowName ?? input.fieldName;

			if (!rows[rowKey]) {
				rows[rowKey] = [];
			}

			rows[rowKey].push(input);
		}

		return rows;
	};

	const rowGroupedInputs: GroupedInputs = $derived(
		groupByRow(
			Object.entries(derivedSchema.shape)
				.map(([key, value]) => {
					let optional = false;
					let nullable = false;
					let defaultValue = undefined;
					// @ts-ignore
					const meta = value?.meta();
					if (meta && meta.hidden) {
						return null;
					}

					while (true) {
						if (value instanceof z.ZodOptional) {
							optional = true;
							value = value.unwrap();
						} else if (value instanceof z.ZodNullable) {
							nullable = true;
							value = value.unwrap();
						} else if (value instanceof z.ZodDefault) {
							defaultValue = value.def.defaultValue;
							value = value.unwrap();
						} else {
							break;
						}
					}

					if (value instanceof z.ZodLiteral) {
						return null;
					} else if (value instanceof z.ZodType) {
						const baseInput: BaseInputDefinition = {
							fieldName: key,
							viewName: (meta?.viewName as string) ?? key,
							description: meta?.description,
							optional: optional,
							nullable: nullable,
							default: defaultValue,
							rowName: meta?.rowName,
							rowWeight: meta?.rowWeight,
							disabledWhen: meta?.disabledWhen
						};

						if (value instanceof z.ZodString) {
							return { ...baseInput, type: 'TEXT', patterns: meta?.patterns };
						} else if (value instanceof z.ZodNumber) {
							return {
								...baseInput,
								type: 'NUMBER',
								softMin: meta?.softMin,
								softMax: meta?.softMax,
								min: meta?.min,
								max: meta?.max,
								step: meta?.step
							};
						} else if (value instanceof z.ZodBoolean) {
							return { ...baseInput, type: 'BOOLEAN' };
						} else if (value instanceof z.ZodEnum) {
							if (meta?.asRadio) {
								return {
									...baseInput,
									type: 'RADIO',
									options: value.options,
									labelMap: meta?.labelMap
								};
							} else {
								return {
									...baseInput,
									type: 'SELECT',
									options: value.options,
									labelMap: meta?.labelMap
								};
							}
						}
					}

					return null;
				})
				.filter((x): x is InputDefinition => x != null)
		)
	);

	const rowDefinitions = $derived<RowDefinitions>(
		(derivedSchema.meta?.() as ObjectMeta | undefined)?.rows ?? {}
	);

	const handleOnSchemaSelect = (event: Event) => {
		const target = event.currentTarget as HTMLSelectElement;
		selectedKey = target.value as keyof typeof LABEL_SCHEMA_MAP;
		result = LABEL_SCHEMA_MAP[selectedKey].schema.parse({});
	};

	const reset = () => {
		result = LABEL_SCHEMA_MAP[selectedKey].schema.parse({});
	};

	const isInputDisabled = (input: InputDefinition) =>
		input.disabledWhen ? result[input.disabledWhen.field] === input.disabledWhen.when : false;
</script>

{#snippet rowContent(rowDef: RowDefinition | undefined, inputs: InputDefinition[])}
	{#if rowDef?.collapsible}
		<details class="collapsable-container" open={!rowDef.defaultCollapsed}>
			<summary class="collapsable-heading bottom-divider">{rowDef.viewName}</summary>
			{@render inputRow(inputs)}
		</details>
	{:else}
		{@render inputRow(inputs)}
	{/if}
{/snippet}

{#snippet inputRow(inputs: InputDefinition[])}
	<div class="input-container">
		{#each inputs as input (input.fieldName)}
			{#if input.type === 'TEXT'}
				<TextInput
					inputDefinition={input}
					value={result[input.fieldName]}
					onchange={(v) => (result[input.fieldName] = v)}
					disabled={isInputDisabled(input)}
					notifications={generationResult?.notifications}
				/>
			{:else if input.type === 'NUMBER'}
				<NumberInput
					inputDefinition={input}
					value={result[input.fieldName]}
					onchange={(v) => (result[input.fieldName] = v)}
					disabled={isInputDisabled(input)}
				/>
			{:else if input.type === 'BOOLEAN'}
				<CheckboxInput
					inputDefinition={input}
					value={result[input.fieldName]}
					onchange={(v) => (result[input.fieldName] = v)}
					disabled={isInputDisabled(input)}
				/>
			{:else if input.type === 'SELECT'}
				<SelectInput
					inputDefinition={input}
					value={result[input.fieldName]}
					onchange={(v) => (result[input.fieldName] = v)}
					disabled={isInputDisabled(input)}
				/>
			{:else if input.type === 'RADIO'}
				<RadioInput
					inputDefinition={input}
					value={result[input.fieldName]}
					onchange={(v) => (result[input.fieldName] = v)}
					disabled={isInputDisabled(input)}
				/>
			{/if}
		{/each}
	</div>
{/snippet}

<div>
	<div class="type-select">
		<label for="type-select">Label Type</label>
		<select value={selectedKey} onchange={handleOnSchemaSelect} name="type-select">
			{#each Object.entries(LABEL_SCHEMA_MAP) as [key, { displayName }]}
				<option value={key}>{displayName}</option>
			{/each}
		</select>
	</div>
	<div class="properties-label bottom-divider">
		<strong>Properties</strong>
		<div class="action-container">
			<ShareButton />
			<button class="icon-button" onclick={reset}><ListRestart /></button>
		</div>
	</div>
	{#each Object.entries(rowGroupedInputs) as [rowKey, inputs]}
		{@const rowDef = rowDefinitions[rowKey]}
		{#if rowDef?.spacingBefore}
			<div style="margin-top: {rowDef.spacingBefore}">
				{@render rowContent(rowDef, inputs)}
			</div>
		{:else}
			{@render rowContent(rowDef, inputs)}
		{/if}
	{/each}
</div>

<style lang="scss">
	.type-select {
		margin-bottom: calc(var(--pico-spacing) * 2);
	}

	.properties-label {
		margin-bottom: var(--pico-spacing);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.action-container {
		display: flex;
		align-items: center;
		margin-right: 0.25rem;
	}

	.input-container {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1rem;
		align-items: flex-start;
	}

	.text-input {
		min-width: 100px;
	}

	.collapsable-container {
		margin: var(--pico-spacing) 0;
	}

	.collapsable-heading {
		user-select: none;
		padding-right: 0.5rem;
		padding-bottom: 1rem;
		list-style: none;

		&:hover {
			color: var(--pico-primary);
		}
	}
</style>
