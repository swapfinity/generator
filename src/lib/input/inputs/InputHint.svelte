<script lang="ts">
	import type { FieldNotification } from '$lib/generation/general/notifications';

	// props
	interface InputHintProps {
		notification?: FieldNotification | null;
		description?: string;
	}
	let { notification, description }: InputHintProps = $props();
</script>

{#if notification}
	<small class={notification.level.toLowerCase()}>{notification.message}</small>
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
