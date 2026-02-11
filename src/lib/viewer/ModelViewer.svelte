<script lang="ts">
	import type { Geom3 } from '@jscad/modeling/src/geometries/types';
	import { onMount } from 'svelte';

	// props
	interface ModelViewerProps {
		geometryToRender: Geom3 | Geom3[];
	}
	let { geometryToRender }: ModelViewerProps = $props();

	let containerElement: HTMLDivElement;

	onMount(async () => {
		if (!containerElement) {
			return;
		}

		// 1. Load JSCAD modules
		const jscadRegl = await import('@jscad/regl-renderer');
		const { prepareRender, drawCommands, cameras, controls, entitiesFromSolids } = jscadRegl;

		// init camera
		const cameraStateOverride = { position: [5, -20, 30] };

		const perspectiveCamera = cameras.perspective;
		const camera = Object.assign({}, perspectiveCamera.defaults, cameraStateOverride);
		perspectiveCamera.setProjection(camera, camera, {
			width: containerElement.clientWidth,
			height: containerElement.clientHeight
		});
		perspectiveCamera.update(camera, camera);

		const orbitControls = controls.orbit;

		let preRenderState = {
			camera: camera,
			controls: orbitControls.defaults
		};

		// convert models to renderable entities
		const entities = entitiesFromSolids({}, geometryToRender);

		// 4. Renderer Setup
		const renderer = prepareRender({
			glOptions: { container: containerElement }
		});

		const renderOptions = {
			camera: preRenderState.camera,
			drawCommands: {
				drawGrid: drawCommands.drawGrid,
				drawMesh: drawCommands.drawMesh,
				drawAxis: drawCommands.drawAxis,
				drawLines: drawCommands.drawLines
			},
			entities: [...entities],
			// sets the background color of the canvas
			rendering: {
				background: [0.12, 0.12, 0.12, 1.0]
			}
		};

		// --- THE KICKSTART ---
		// This forces the very first frame to draw before any mouse interaction
		perspectiveCamera.update(preRenderState.camera);
		renderer(renderOptions);
		// --------------------

		// 5. Interaction variables
		let rotateDelta = [0, 0];
		let zoomDelta = 0;
		let pointerDown = false;
		let lastX = 0,
			lastY = 0;

		// 6. The Loop
		const updateAndRender = () => {
			let updateView = false;

			if (rotateDelta[0] || rotateDelta[1]) {
				const updated = orbitControls.rotate(
					{ controls: preRenderState.controls, camera: preRenderState.camera, speed: 0.002 },
					rotateDelta
				);
				preRenderState.controls = { ...preRenderState.controls, ...updated.controls };
				rotateDelta = [0, 0];
				updateView = true;
			}

			if (zoomDelta) {
				const updated = orbitControls.zoom(
					{ controls: preRenderState.controls, camera: preRenderState.camera, speed: 0.08 },
					zoomDelta
				);
				preRenderState.controls = { ...preRenderState.controls, ...updated.controls };
				zoomDelta = 0;
				updateView = true;
			}

			if (updateView || preRenderState.controls.changed) {
				const updates = orbitControls.update({
					controls: preRenderState.controls,
					camera: preRenderState.camera
				});
				preRenderState.controls = { ...preRenderState.controls, ...updates.controls };
				preRenderState.camera.position = updates.camera.position;
				perspectiveCamera.update(preRenderState.camera);
				renderer(renderOptions);
			}

			window.requestAnimationFrame(updateAndRender);
		};

		// 7. Event Handlers
		containerElement.onpointerdown = (ev) => {
			pointerDown = true;
			lastX = ev.pageX;
			lastY = ev.pageY;
			containerElement.setPointerCapture(ev.pointerId);
		};
		containerElement.onpointermove = (ev) => {
			if (!pointerDown) {
				return;
			}
			rotateDelta[0] -= lastX - ev.pageX;
			rotateDelta[1] -= ev.pageY - lastY;
			lastX = ev.pageX;
			lastY = ev.pageY;
		};
		containerElement.onpointerup = (ev) => {
			pointerDown = false;
			containerElement.releasePointerCapture(ev.pointerId);
		};
		containerElement.onwheel = (ev) => {
			ev.preventDefault();
			zoomDelta += ev.deltaY;
		};

		window.requestAnimationFrame(updateAndRender);
	});
</script>

<div bind:this={containerElement} class="jscad-container"></div>

<style>
	.jscad-container {
		width: 100%;
		height: 600px;
		background: var(--pico-background-color);
		touch-action: none;
		outline: 1px solid #ccc;
	}
</style>
