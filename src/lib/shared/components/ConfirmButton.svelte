<script lang="ts">
	import { ClockAlert } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	// props
	interface ConfirmButtonProps {
		onConfirm: () => void;
		children: Snippet;
		confirmContent?: Snippet;
		disabled?: boolean;
	}
	let { confirmContent, onConfirm, children, disabled = false }: ConfirmButtonProps = $props();

	let armed = $state(false);
	let timeout: ReturnType<typeof setTimeout>;

	const handleClick = () => {
		if (!armed) {
			armed = true;
			timeout = setTimeout(() => {
				armed = false;
			}, 3000);
		} else {
			armed = false;
			clearTimeout(timeout);
			onConfirm();
		}
	};

	const handleBlur = () => {
		armed = false;
		clearTimeout(timeout);
	};
</script>

{#snippet defaultConfirm()}
	<ClockAlert class="warn-icon" /> Click to confirm
{/snippet}

<button
	onclick={handleClick}
	onblur={handleBlur}
	class="red-button"
	class:armed
	{disabled}
	style:min-width={'10.5rem'}
>
	{#if armed}
		{@render (confirmContent ?? defaultConfirm)()}
	{:else}
		{@render children()}
	{/if}
</button>

<style lang="scss">
	.red-button {
		white-space: nowrap;
		--pico-background-color: var(--pico-color-red-500);
		--pico-border-color: var(--pico-color-red-500);

		&:hover {
			--pico-background-color: var(--pico-color-red-400);
			--pico-border-color: var(--pico-color-red-400);
		}

		&:disabled {
			--pico-background-color: var(--pico-color-red-400);
			--pico-border-color: var(--pico-color-red-400);
		}
	}

	button.armed :global(.lucide) {
		animation: pulse 0.8s ease-in-out infinite alternate;
	}
	@keyframes pulse {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.4;
		}
	}
</style>
