<script lang="ts">
	import type { Geom3 } from '@jscad/modeling/src/geometries/types';
	import * as jscad from '@jscad/modeling';
	const { measurements } = jscad;
	import { onDestroy, onMount } from 'svelte';
	import { Focus } from 'lucide-svelte';

	// props
	interface ModelViewerProps {
		geometryToRender: Geom3 | Geom3[];
	}
	let { geometryToRender }: ModelViewerProps = $props();

	let containerElement: HTMLDivElement;
	let resizeObserver: ResizeObserver;

	let rendererFunction: any = null;
	let renderOptions: any = null;
	let entitiesFromSolidsFunction: any = null;
	let camera;
	let perspectiveCamera;
	let preRenderState;
	let orbitControls;
	let updateView;

	let ready = $state(false);

	$effect(() => {
		if (!ready) return;
		const newEntities = entitiesFromSolidsFunction({}, geometryToRender);
		renderOptions.entities = [...newEntities];
		rendererFunction(renderOptions);
	});

	onMount(async () => {
		if (!containerElement) {
			return;
		}

		// 1. Load JSCAD modules
		const jscadRegl = await import('@jscad/regl-renderer');
		const { prepareRender, drawCommands, cameras, controls, entitiesFromSolids } = jscadRegl;
		entitiesFromSolidsFunction = entitiesFromSolids;

		// init camera
		const cameraStateOverride = { position: [5, -20, 30] };

		perspectiveCamera = cameras.perspective;
		camera = Object.assign({}, perspectiveCamera.defaults, cameraStateOverride);
		perspectiveCamera.setProjection(camera, camera, {
			width: containerElement.clientWidth,
			height: containerElement.clientHeight
		});
		perspectiveCamera.update(camera, camera);

		orbitControls = controls.orbit;

		preRenderState = {
			camera: camera,
			controls: orbitControls.defaults
		};

		// convert models to renderable entities
		const entities = entitiesFromSolids({}, geometryToRender);

		// 4. Renderer Setup
		rendererFunction = prepareRender({
			glOptions: { container: containerElement }
		});

		renderOptions = {
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
		rendererFunction(renderOptions);
		// --------------------

		// 5. Interaction variables
		let rotateDelta = [0, 0];
		let zoomDelta = 0;
		let pointerDown = false;
		let lastX = 0;
		let lastY = 0;

		updateView = false;

		// 6. The Loop
		const updateAndRender = () => {
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
				updateView = false;

				const updates = orbitControls.update({
					controls: preRenderState.controls,
					camera: preRenderState.camera
				});
				preRenderState.controls = { ...preRenderState.controls, ...updates.controls };
				preRenderState.camera.position = updates.camera.position;
				perspectiveCamera.update(preRenderState.camera);
				rendererFunction(renderOptions);
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

		resizeObserver = new ResizeObserver(() => {
			const width = containerElement.clientWidth;
			const height = containerElement.clientHeight;

			perspectiveCamera.setProjection(camera, camera, { width, height });
			perspectiveCamera.update(camera);
			fitCameraToGeometry();
		});

		resizeObserver.observe(containerElement);

		window.requestAnimationFrame(updateAndRender);

		ready = true;
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	const fitCameraToGeometry = () => {
		const [[minX, minY, minZ], [maxX, maxY, maxZ]] =
			measurements.measureBoundingBox(geometryToRender)[0];
		const width = maxX - minX;
		const height = maxY - minY;
		const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];

		const aspect = containerElement.clientWidth / containerElement.clientHeight;
		const verticalFov = camera.fov;
		const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);

		const distanceForHeight = height / (2 * Math.tan(verticalFov / 2));
		const distanceForWidth = width / (2 * Math.tan(horizontalFov / 2));
		const distance = Math.max(distanceForHeight, distanceForWidth);

		console.log({ width, height, distanceForHeight, distanceForWidth, distance, aspect });

		camera.target = [...center];
		camera.position = [center[0], center[1] - distance * 0.5, center[2] + distance * 1.2];

		preRenderState.controls = { ...orbitControls.defaults };
		preRenderState.camera = camera;

		perspectiveCamera.update(camera);
		updateView = true;
	};
</script>

<div class="viewer-container">
	<div bind:this={containerElement} class="jscad-container"></div>
	<button class="reset-view-button outline secondary" onclick={fitCameraToGeometry}>
		<Focus />
	</button>
</div>

<style lang="scss">
	.viewer-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.jscad-container {
		width: 100%;
		height: 100%;
		background: var(--pico-background-color);
		touch-action: none;
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-card-background-color);
		border: var(--pico-border-width) solid var(--pico-card-border-color);
	}

	.reset-view-button {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
		border: none;
	}
</style>
