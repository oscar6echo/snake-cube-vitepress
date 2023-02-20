<template>
  <div>
    <canvas
      v-show="!isDefinedPath"
      ref="container2d"
      class="mt-5 mb-2 b-1 b-solid b-truegray-900 dark:b-truegray-600"
      :style="styleCanvas"
    ></canvas>
    <canvas
      v-show="isDefinedPath"
      ref="container3d"
      class="mt-5 mb-2 b-1 b-solid b-truegray-900 dark:b-truegray-600"
      :style="styleCanvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch } from "vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import d3 from "../assets/d3";
import { buildCube, initMsg } from "../common/threejs";
import { MapCoord, Pos } from "../store/snake";

const props = defineProps({
  path: { type: Object as PropType<MapCoord>, required: true },
  step: { type: Number, required: false, default: 26 },
  curvy: { type: Boolean, required: false, default: false },
  rotSpeed: { type: Number, required: false, default: 1 },
  rotUnit: { type: Number, required: false, default: 2 }, // deg per sec ?
  width: { type: Number, required: false, default: 600 },
  height: { type: Number, required: false, default: 600 },
});
const { path, step, curvy, rotSpeed } = toRefs(props);

const styleCanvas = ref(`width: ${props.width}px; height: ${props.height}px;`);

const container2d = ref(null);
const container3d = ref(null);

const isDefinedPath = computed(() => path.value.size > 0);

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  matLine: LineMaterial;

let rendererWidth: number, rendererHeight: number;

const init = () => {
  renderer = new THREE.WebGLRenderer({
    canvas: container3d.value as HTMLCanvasElement,
    antialias: true,
  });

  rendererWidth = props.width;
  rendererHeight = props.height;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x333333, 1);
  renderer.setSize(rendererWidth, rendererHeight);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(33, 1, 1, 100);
  camera.position.set(-35, 25, 50);
  camera.aspect = rendererWidth / rendererHeight;
  camera.updateProjectionMatrix();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 80;
};

const S = 10;
const T = S / 7;
const scale = (c: number) => S * (c - 1);

const addSnakeToScene = (snake: ISnake) => {
  const { line, cubelets } = snake;
  if (line) scene.add(line);
  cubelets.forEach((e) => scene.add(e));
};

const removeSnakeFromScene = () => {
  const line = scene.getObjectByName("snake-line");
  scene.remove(line);

  d3.range(1, 27 + 1).forEach((i) => {
    const cubelet = scene.getObjectByName(`snake-cubelet-${i}`);
    if (cubelet) scene.remove(cubelet);
  });
};

interface ISnake {
  line: Line2;
  cubelets: THREE.Group[];
}

const buildSnake = (): ISnake => {
  const positions = [];
  const colors = [];

  const points = d3
    .range(1, path.value.size + 1)
    .filter((i) => i <= step.value + 1)
    .map((k) => {
      const pos = path.value.get(k) as Pos;
      const point = new THREE.Vector3(
        scale(pos[0]),
        scale(pos[1]),
        scale(pos[2])
      );
      return point;
    });

  const cubelets = points.map((e, i) => buildCube(e, i + 1, T));

  let line: Line2 | null;

  if (points.length > 1) {
    const spline = new THREE.CatmullRomCurve3(points);

    let divisions: number;
    if (curvy.value) {
      divisions = Math.round(12 * points.length);
    } else {
      divisions = Math.round(points.length - 1);
    }
    const point = new THREE.Vector3();

    const interpol = d3.interpolateHslLong("red", "blue");

    for (let i = 0, l = divisions; i <= l; i++) {
      const t = i / l;
      spline.getPoint(t, point);
      positions.push(point.x, point.y, point.z);
      //   const c = d3.hsl(interpol(t)).rgb();
      const c = d3.hsl(interpol(t * (points.length / 27))).rgb();
      colors.push(c.r / 255, c.g / 255, c.b / 255);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(positions);
    geometry.setColors(colors);

    matLine = new LineMaterial({
      color: 0xffffff,
      linewidth: 10,
      vertexColors: true,
      dashed: false,
      alphaToCoverage: false,
    });

    line = new Line2(geometry, matLine);
    line.name = "snake-line";
    line.computeLineDistances();
    line.scale.set(1, 1, 1);
  } else {
    line = null;
  }

  return { line, cubelets };
};

const maxFPS = 60;
const timeStep = 1000 / maxFPS;
let lastFrameTimeMs = 0;

const axisY = new THREE.Vector3(0, 1, 0).normalize();
const rad = computed(
  () => (rotSpeed.value * props.rotUnit * (2 * Math.PI)) / 360 / timeStep
);

const vizLoop = (timestamp: number) => {
  if (timestamp < lastFrameTimeMs + timeStep) {
    requestAnimationFrame(vizLoop);
    return;
  }
  lastFrameTimeMs = timestamp;

  matLine.resolution.set(rendererWidth, rendererHeight);
  renderer.render(scene, camera);

  scene.rotateOnAxis(axisY, rad.value);

  window.requestAnimationFrame(vizLoop);
};

const update = () => {
  removeSnakeFromScene();
  if (isDefinedPath.value) {
    const snake = buildSnake();
    addSnakeToScene(snake);
    vizLoop(0);
  }
};

onMounted(() => {
  initMsg(container2d.value);
  init();
});

watch(path, () => {
  if (!isDefinedPath.value) return;
  update();
});

watch(step, () => {
  if (!isDefinedPath.value) return;
  update();
});
watch(curvy, () => {
  if (!isDefinedPath.value) return;
  update();
});
</script>

<style scoped></style>
