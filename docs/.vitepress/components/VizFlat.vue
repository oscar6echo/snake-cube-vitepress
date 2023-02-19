<template>
  <div>
    <canvas
      v-show="!isDefinedSeq"
      ref="container2d"
      class="mt-5 mb-2 b-1 b-solid b-truegray-900 dark:b-truegray-600"
      :style="styleCanvas"
    ></canvas>
    <canvas
      v-show="isDefinedSeq"
      ref="container3d"
      class="mt-5 mb-2 b-1 b-solid b-truegray-900 dark:b-truegray-600"
      :style="styleCanvas"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from "vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import d3 from "../assets/d3";
import { buildCube, initMsg } from "../common/threejs";

const props = defineProps({
  seq: { type: String, required: true },
  width: { type: Number, required: false, default: 600 },
  height: { type: Number, required: false, default: 150 },
});
const { seq } = toRefs(props);

const styleCanvas = ref(`width: ${props.width}px; height: ${props.height}px;`);

const container2d = ref(null);
const container3d = ref(null);

const _seq = computed(() => {
  if (seq.value.length === 0) return null;

  return seq.value.split("").map((e) => Number(e));
});
const isDefinedSeq = computed(() => _seq.value && _seq.value.length > 0);

let renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls;

let rendererWidth: number, rendererHeight: number;

let centerX: number, centerY: number, endX: number, endY: number;

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

  camera = new THREE.PerspectiveCamera(35, 1, 1, 1000);
  camera.position.set(0, 0, 90);
  camera.aspect = rendererWidth / rendererHeight;
  camera.updateProjectionMatrix();

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 15;
  controls.maxDistance = 110;
};

const S = 10;
const T = S / 1.2;

const addSnakeToScene = (snake: ISnake) => {
  const { cubelets } = snake;
  cubelets.forEach((e) => scene.add(e));
};

const removeSnakeFromScene = () => {
  d3.range(1, 27 + 1).forEach((i) => {
    const cubelet = scene.getObjectByName(`snake-cubelet-${i}`);
    scene.remove(cubelet);
  });
};

interface ISnake {
  cubelets: THREE.Group[];
}

const buildSnake = (): ISnake => {
  const _points = [{ x: 0, y: 0, idx: 1 }];
  let x = 0;
  let y = 0;
  let isIncrX = true;

  _seq.value.slice(0, -1).forEach((e, i) => {
    if (e === 1) {
      isIncrX = !isIncrX;
    }
    if (isIncrX) {
      x += 1;
    } else {
      y += 1;
    }
    const p = { x, y, idx: i + 2 };
    _points.push(p);
    if (i === 13) {
      centerX = x;
      centerY = y;
    }
  });
  endX = _points[_points.length - 1].x;
  endY = _points[_points.length - 1].y;

  const scaleX = (x: number) => S * (x - centerX);
  const scaleY = (y: number) => S * (y - centerY);

  const points = _points.map(
    (e) => new THREE.Vector3(scaleX(e.x), scaleY(e.y), 0)
  );

  const cubelets = points.map((e, i) => buildCube(e, i + 1, T));

  return { cubelets };
};

const rotateScene = () => {
  const axisY = new THREE.Vector3(0, 0, 1).normalize();
  scene.setRotationFromAxisAngle(axisY, 0);

  const rad = -(Math.PI / 4) * (endY / endX);
  scene.rotateOnAxis(axisY, rad);

  scene.translateOnAxis(scene.position.normalize(), -scene.position.length());

  const translateAxis = new THREE.Vector3(
    centerX - endX / 2,
    centerY - endY / 2,
    0
  );
  scene.translateOnAxis(translateAxis.normalize(), S * translateAxis.length());
};

const maxFPS = 60;
const timeStep = 1000 / maxFPS;
let lastFrameTimeMs = 0;

const vizLoop = (timestamp: number) => {
  if (timestamp < lastFrameTimeMs + timeStep) {
    requestAnimationFrame(vizLoop);
    return;
  }
  lastFrameTimeMs = timestamp;

  renderer.render(scene, camera);

  window.requestAnimationFrame(vizLoop);
};

const update = () => {
  removeSnakeFromScene();
  if (isDefinedSeq.value) {
    const snake = buildSnake();
    addSnakeToScene(snake);
    rotateScene();
    vizLoop(0);
  }
};

onMounted(() => {
  initMsg(container2d.value);
  init();
});

watch(seq, () => {
  if (!isDefinedSeq.value) return;
  update();
});
</script>

<style scoped></style>
