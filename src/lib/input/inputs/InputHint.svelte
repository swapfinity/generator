<script lang="ts">
	import type { GenerationNotification } from '$lib/generation/general/notifications';
	import type { LocalNotification } from '../local-notification-types';

	// props
	interface InputHintProps {
		generationNotification?: GenerationNotification | null;
		localNotification?: LocalNotification | null;
		description?: string;
	}
	let { generationNotification, localNotification, description }: InputHintProps = $props();
</script>

{#if localNotification}
	<small class={localNotification.level.toLowerCase()}>{localNotification.message}</small>
{:else if generationNotification}
	<small class={generationNotification.level.toLowerCase()}>{generationNotification.message}</small>
{:else if description}
	<small>{description}</small>
{/if}

<style lang="scss">
	small.warn {
		color: var(--color-warn);
	}

	small.error {
		color: var(--color-error);
	}
</style>
