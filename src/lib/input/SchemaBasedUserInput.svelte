<script lang="ts">
	import z, { ZodObject } from 'zod';
	import type { BaseInput, InputDefinition } from './input-types';

	interface SchemaBasedUserInputProps {
		schema: ZodObject<any>;
	}

	let { schema }: SchemaBasedUserInputProps = $props();

	const inputDefinitions: InputDefinition[] = $derived(
		Object.entries(schema.shape)
			.map(([key, value]) => {
				let optional = false;
				let nullable = false;
				let defaultValue = undefined;

				console.log('field key: ', key, ' value: ', value, ' type: ', typeof value);
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
						viewName: (value?.meta()?.viewName as string) ?? key, //TODO doesnt work yet
						description: value?.meta()?.description,
						optional: optional,
						nullable: nullable,
						default: defaultValue
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
	);
	console.log(inputDefinitions);
</script>

<div>
	{#each inputDefinitions as input (input.fieldName)}
		{#if input.type === 'TEXT'}
			<label for={input.fieldName}>{input.viewName}</label>
			<input type="text" placeholder={input.description} name={input.fieldName} />
		{:else if input.type === 'BOOLEAN'}
			<input type="checkbox" />
		{:else if input.type === 'ENUM'}
			<label for={input.fieldName}>{input.viewName}</label>
			<select name={input.fieldName}>
				{#each input.options as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{/if}
	{/each}
</div>
