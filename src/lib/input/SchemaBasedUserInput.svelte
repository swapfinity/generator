<script lang="ts">
	import z from 'zod';
	import type { BaseInput, GroupedInputs, InputDefinition } from './input-types';
	import { LABEL_SCHEMA_MAP, type LabelDefinition } from './schemas/general-schemas';
	import { ListRestart } from 'lucide-svelte';

	// props
	interface SchemaBasedUserInputProps {
		onChange: (updated: LabelDefinition) => void;
	}
	let { onChange }: SchemaBasedUserInputProps = $props();

	const initialKey = Object.keys(LABEL_SCHEMA_MAP)[0] as keyof typeof LABEL_SCHEMA_MAP;
	let selectedKey = $state<keyof typeof LABEL_SCHEMA_MAP>(initialKey);
	let derivedSchema = $derived(LABEL_SCHEMA_MAP[selectedKey]);
	let result = $state<LabelDefinition & Record<string, any>>(
		LABEL_SCHEMA_MAP[initialKey].parse({})
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
					const meta = value?.meta();

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
						const baseInput: BaseInput = {
							fieldName: key,
							viewName: (meta?.viewName as string) ?? key,
							description: meta?.description,
							optional: optional,
							nullable: nullable,
							default: defaultValue,
							rowName: meta?.rowName,
							rowWeight: meta?.rowWeight
						};

						if (value instanceof z.ZodString) {
							return { ...baseInput, type: 'TEXT' };
						} else if (value instanceof z.ZodNumber) {
							return { ...baseInput, type: 'NUMBER' };
						} else if (value instanceof z.ZodBoolean) {
							return { ...baseInput, type: 'BOOLEAN' };
						} else if (value instanceof z.ZodEnum) {
							return { ...baseInput, type: 'ENUM', options: value.options };
						}
					}

					return null;
				})
				.filter((x): x is InputDefinition => x != null)
		)
	);

	const handleOnSchemaSelect = (event: Event) => {
		const target = event.currentTarget as HTMLSelectElement;
		selectedKey = target.value as keyof typeof LABEL_SCHEMA_MAP;
		result = LABEL_SCHEMA_MAP[selectedKey].parse({});
	};

	const reset = () => {
		result = LABEL_SCHEMA_MAP[selectedKey].parse({});
	};
</script>

<div>
	<div class="type-select">
		<label for="type-select">Label Type</label>
		<select onchange={handleOnSchemaSelect} name="type-select">
			{#each Object.keys(LABEL_SCHEMA_MAP) as key}
				<option value={key}>{key}</option>
			{/each}
		</select>
	</div>
	<div class="properties-label">
		<strong>Properties</strong>
		<button class="icon-button reset-button" onclick={reset}><ListRestart /> </button>
	</div>
	{#each Object.values(rowGroupedInputs) as row}
		<div class="input-container">
			{#each row as input (input.fieldName)}
				{#if input.type === 'TEXT'}
					<div class="text-input" style={`flex: ${input.rowWeight ?? 1} 1 0;`}>
						<label for={input.fieldName}>{input.viewName}</label>
						<input
							type="text"
							placeholder={input.description}
							name={input.fieldName}
							bind:value={result[input.fieldName]}
						/>
					</div>
				{:else if input.type === 'BOOLEAN'}
					<!-- TODO: not yet implemented -->
				{:else if input.type === 'ENUM'}
					<div class="enum-input" style={`flex: ${input.rowWeight ?? 1} 1 0;`}>
						<label for={input.fieldName}>{input.viewName}</label>
						<select
							name={input.fieldName}
							aria-describedby={input.fieldName + '-field-id'}
							bind:value={result[input.fieldName]}
						>
							{#each input.options as option}
								<option value={option}>{option}</option>
							{/each}
						</select>
						{#if input.description}
							<small id={input.fieldName + '-field-id'}>{input.description}</small>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
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
	}

	.reset-button {
		margin-right: 0.25rem;
	}

	.input-container {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1rem;
	}

	.text-input {
		min-width: 100px;
	}

	.enum-input {
		min-width: 100px;
	}
</style>
