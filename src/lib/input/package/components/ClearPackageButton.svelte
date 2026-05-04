<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import { packageStore } from '../package.svelte';
</script>

<button class="clear-button" onclick={() => packageStore.clear()}>
	<Trash2 /> Clear All
</button>

<style lang="scss">
	.clear-button {
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
</style>
