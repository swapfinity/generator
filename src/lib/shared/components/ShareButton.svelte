<script lang="ts">
	import { Link, Check } from 'lucide-svelte';

	let copied = $state(false);

	const share = () => {
		if (copied) {
			return;
		}

		navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => {
			copied = false;
			(document.activeElement as HTMLElement)?.blur();
		}, 2000);
	};
</script>

<button
	class="icon-button"
	onclick={share}
	data-tooltip={copied ? 'Copied!' : 'Copy shareable link'}
>
	<span class:copied>
		{#if copied}
			<Check />
		{:else}
			<Link />
		{/if}
	</span>
</button>

<style>
	span {
		display: flex;
		transition:
			transform 0.3s ease,
			opacity 0.3s ease;
	}

	span.copied {
		animation: flip 0.3s ease;
	}

	@keyframes flip {
		0% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(90deg);
			opacity: 0;
		}
		100% {
			transform: rotate(0deg);
			opacity: 1;
		}
	}
</style>
