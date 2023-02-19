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

    <!-- <br />
    {{ path }}
    <br />
    {{ step }}
    <br />
    {{ rotSpeed }}
    <br /> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch } from "vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";

import d3 from "../assets/d3";
import { Sequence } from "../store/snake";

const props = defineProps({
  seq: { type: Object as PropType<Sequence>, required: true },
  width: { type: Number, required: false, default: 600 },
  height: { type: Number, required: false, default: 250 },
});
const { seq } = toRefs(props);

const styleCanvas = ref(`width: ${props.width}px; height: ${props.height}px;`);

const container2d = ref(null);
const container3d = ref(null);

const isDefinedSeq = computed(() => seq.value.length > 0);

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

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 80;
};

const initMsg = () => {
  const canvas = container2d.value as HTMLCanvasElement;
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;

  var ctx = canvas.getContext("2d");

  const x = canvas.width / 2;
  const y = canvas.height / 2;

  ctx.fillStyle = "red";
  ctx.font = "25px mono";

  ctx.textAlign = "center";
  ctx.fillText("Select Snake", x, y);
};

const S = 10;
const T = S / 7;
const scale = (c: number) => S * (c - 1);

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
  const positions = [];

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

  const cubelets = points.map((e, i) => buildCube(e, i + 1));

  return { cubelets };
};

const buildCube = (vec: THREE.Vector3, no: number) => {
  const geometry = new THREE.BoxGeometry(T, T, T);
  const material = buildFaceMaterial("#156289", String(no));

  const cube = new THREE.Mesh(geometry, material);

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: false,
    opacity: 0.8,
    linewidth: 1,
  });
  const line = new THREE.LineSegments(edges, lineMaterial);

  const group = new THREE.Group();
  group.add(cube);
  group.add(line);

  group.position.x = vec.x;
  group.position.y = vec.y;
  group.position.z = vec.z;

  group.name = `snake-cubelet-${no}`;
  return group;
};

const buildFaceMaterial = (
  color: string,
  text: string
): THREE.MeshBasicMaterial => {
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;
  const size = 200;
  const fontSize = 190;
  ctx.canvas.width = size;
  ctx.canvas.height = size;

  drawFacelet(ctx, { x: 0, y: 0 }, size, fontSize, color, text);

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
  });
  return mat;
};

const drawFacelet = (
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  size: number,
  fontSize: number,
  color: string,
  text: string
) => {
  ctx.save();
  ctx.translate(pos.x, pos.y);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(size / 2, 0);

  ctx.font = `${fontSize}px serif`;

  ctx.fillStyle = "white";

  ctx.fillText(text, 0, size / 2);
  ctx.restore();

  return ctx.canvas;
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

  matLine.resolution.set(rendererWidth, rendererHeight); // resolution of the viewport
  renderer.render(scene, camera);

  window.requestAnimationFrame(vizLoop);
};

const update = () => {
  removeSnakeFromScene();
  if (isDefinedSeq.value) {
    const snake = buildSnake();
    addSnakeToScene(snake);
    vizLoop(0);
  }
};

onMounted(() => {
  initMsg();
  init();
});

watch(seq, () => {
  if (!isDefinedSeq.value) return;
  update();
});
</script>

<style scoped></style>
