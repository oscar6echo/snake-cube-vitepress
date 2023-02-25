<template>
  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt">Nb Solutions:</button>
    <select v-model="fNbSol" :class="styleSelect">
      <option
        v-for="(value, i) in nbSolOptions"
        :key="i"
        :value="value"
        :active="value === fNbSol"
      >
        {{ value }}
      </option>
    </select>

    <button :class="styleBtnTxt">Nb Straights:</button>
    <select v-model="fNbStraight" :class="styleSelect">
      <option
        v-for="(value, i) in nbStraightOptions"
        :key="i"
        :value="value"
        :active="value === fNbStraight"
      >
        {{ value }}
      </option>
    </select>

    <button :class="styleBtnTxt">Only Palindrome:</button>
    <select v-model="fPal" :class="styleSelect">
      <option
        v-for="(value, i) in [true, false]"
        :key="i"
        :value="value"
        :active="value === fPal"
      >
        {{ value }}
      </option>
    </select>
  </div>

  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt">Sequence Start:</button>
    <input
      v-model="fSeqStart"
      type="text"
      placeholder=" optional: to narrow down search"
      :class="stylePrefix"
    />
    <button :class="styleBtnFiltered">
      Nb Snakes: {{ fmtNb(solutionsFiltered?.size || 0) }}
    </button>
  </div>

  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt">Select Snake (nb Sol):</button>
    <select v-model="selectedSnake" :class="styleSelectSnake">
      <option
        v-for="(item, i) in snakeOptions"
        :key="i"
        :value="item.value"
        :active="item.value === selectedSnake"
      >
        {{ item.text }}
      </option>
    </select>

    <button :class="styleBtnTxt">Sort by:</button>
    <select v-model="fSnakeSort" :class="styleSelectSort">
      <option
        v-for="(value, i) in ['nb Sol <', 'nb Sol >', 'Lexico <', 'Lexico >']"
        :key="i"
        :value="value"
        :active="value === fSnakeSort"
      >
        {{ value }}
      </option>
    </select>
  </div>

  <VizFlat :seq="selectedSnake" />

  <VizFold
    :path="selectedPath"
    :step="pathStep"
    :curved="pathCurved"
    :rotSpeed="rotSpeed"
  />

  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt2">Rotation Speed:</button>
    <ButtonRotation v-model="rotSpeed" class="mr-4" />

    <button :class="styleBtnTxt">Curved Path:</button>
    <select v-model="pathCurved" :class="styleSelect">
      <option
        v-for="(value, i) in [true, false]"
        :key="i"
        :value="value"
        :active="value === pathCurved"
      >
        {{ value }}
      </option>
    </select>
  </div>
  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt2">Path step:</button>
    <Player
      v-model="pathStep"
      :values="pathStepsOptions"
      :width="200"
      :index="true"
    />
  </div>
  <div class="flex justify-start items-center mb-2">
    <button :class="styleBtnTxt2">Solution:</button>
    <Player
      v-model="selectedSolution"
      :values="snakeSolutionsOptions"
      :width="200"
      :index="true"
    />
  </div>

  <!-- 
  <br />
  {{ rotSpeed }}
  <br />
  {{ pathStep }}
  <br />
  {{ selectedSolution }}
  <br />

  <br />
  {{ nbSolOptions }}
  <br />
  {{ nbStraightOptions }}
  <br />
  {{ solutionsFiltered.size }}
  <br />
  {{ selectedSnake }} -->
</template>

<script setup lang="ts">
import { inBrowser } from "vitepress";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import d3 from "../assets/d3";
import { buildStyle, fmtNb } from "../common/util";
import { MapCoord, useSnakeStore } from "../store/snake";
import { IStateViewer, useStateViewer } from "../store/state-viewer";
import ButtonRotation from "./ButtonRotation.vue";
import Player from "./Player.vue";
import VizFlat from "./VizFlat.vue";
import VizFold from "./VizFold.vue";

let store: ReturnType<typeof useSnakeStore>;
if (inBrowser && store == null) {
  store = useSnakeStore();
  store.loadData();
}

const state = useStateViewer();

const pathSteps = d3.range(1, 27 + 1);
const pathStepsOptions = pathSteps.map((e) => ({ value: e, text: String(e) }));

const styleBtnTxt = ref(
  buildStyle([
    "text-sm font-mono font-light",
    "text-black dark:text-light bg-light dark:bg-dark",
    "py-1 px-2 mr-1",
    "btn-no-click",
  ])
);
const styleBtnFiltered = ref(styleBtnTxt.value + " text-left w-40");
const styleBtnTxt2 = ref(styleBtnTxt.value + " text-left w-36");
const styleSelect = ref(
  buildStyle([
    "bg-light dark:bg-dark",
    "w-12",
    "b-solid b-1 b-lightgray dark:b-blue",
    "px-2 ml-0 mr-4",
  ])
);
const stylePrefix = ref(
  buildStyle([
    "bg-light dark:bg-dark",
    "w-60",
    "b-solid b-1 b-lightgray dark:b-blue",
    "px-2 ml-0 mr-4",
  ])
);
const styleSelectSnake = ref(
  buildStyle([
    "bg-light dark:bg-dark",
    "w-62",
    "b-solid b-1 b-lightgray dark:b-blue",
    "px-2 ml-0 mr-4",
  ])
);
const styleSelectSort = ref(styleSelect.value + " w-21 px-2");

const fNbSol = ref(null as number);
const fNbStraight = ref(null as number);
const fPal = ref(false);
const fSeqStart = ref("");
const selectedSnake = ref("");
const fSnakeSort = ref("nb Sol >");
const nTruncate = ref(2000);
const pathStep = ref(26);
const pathCurved = ref(false);
const rotSpeed = ref(1);
const selectedSolution = ref(0);
const mounting = ref(true);

const nbSolOptions = computed(() => {
  if (solutionsFiltered.value.size === 0) return [null];

  const _options = new Set<number>();
  for (const [seqS, v] of solutionsFiltered.value) {
    const nSol = v.solutions.length;
    _options.add(nSol);
  }
  const options = [null, ...[..._options].sort(d3.ascending)];
  return options;
});

const nbStraightOptions = computed(() => {
  if (solutionsFiltered.value.size === 0) return [null];

  const _options = new Set<number>();
  for (const [seqS, v] of solutionsFiltered.value) {
    const seqN = v.sequence;
    const nStraight = 27 - 2 - d3.sum(seqN);
    _options.add(nStraight);
  }
  const options = [null, ...[..._options].sort(d3.ascending)];
  return options;
});

const snakeOptions = computed(() => {
  if (solutionsFiltered.value.size === 0) return [];

  const _arr = [];
  let arr: typeof _arr;
  for (const [seqS, v] of solutionsFiltered.value) {
    const nSol = v.solutions.length;
    _arr.push({ value: seqS, nSol, text: `${seqS} (${nSol})` });
  }
  if (fSnakeSort.value === "nb Sol <") {
    arr = _arr.sort((a, b) => d3.ascending(a.nSol, b.nSol));
  }
  if (fSnakeSort.value === "nb Sol >") {
    arr = _arr.sort((a, b) => d3.descending(a.nSol, b.nSol));
  }
  if (fSnakeSort.value === "Lexico <") {
    arr = _arr.sort((a, b) => d3.ascending(a.value, b.value));
  }
  if (fSnakeSort.value === "Lexico >") {
    arr = _arr.sort((a, b) => d3.descending(a.value, b.value));
  }

  if (arr.length < nTruncate.value) return arr;

  const first = {
    value: "",
    text: `truncated at ${nTruncate.value} snakes`,
  };
  return [first, ...arr.slice(0, nTruncate.value)];
});

const solutionsFiltered = computed(() => {
  if (!store.solutions) return new Map();

  const m: typeof store.solutions = new Map();

  for (const [seqS, v] of store.solutions) {
    const seqN = v.sequence;
    const nbSol = v.solutions.length;
    const nbStraight = 27 - 2 - d3.sum(seqN);

    const matchSol = !fNbSol.value || nbSol === fNbSol.value;
    const matchStraight =
      !fNbStraight.value || nbStraight === fNbStraight.value;
    const matchPal = !fPal.value || v.palindrome;
    const matchPrefix =
      fSeqStart.value === "" || seqS.startsWith(fSeqStart.value);

    if (matchSol && matchStraight && matchPal && matchPrefix) {
      m.set(seqS, v);
    }
  }

  return m;
});

const snakeSolutionsOptions = computed(() => {
  if (!solutionsFiltered.value || solutionsFiltered.value.size === 0) return [];
  if (!selectedSnake.value) return [];

  const { solutions } = solutionsFiltered.value.get(selectedSnake.value);
  return solutions.map((e: any, i: number) => ({
    value: e.path,
    text: `${i + 1}/${solutions.length}`,
  }));
});

const selectedPath = computed((): MapCoord => {
  let m: MapCoord = new Map();
  if (!solutionsFiltered.value || solutionsFiltered.value.size === 0) return m;
  if (!selectedSnake.value) return m;

  return snakeSolutionsOptions.value[selectedSolution.value].value;
});

const reset = () => {
  if (mounting.value) {
    console.log("VIEWER reset");
    selectedSnake.value = "";
    selectedSolution.value = 0;
  }
};

watch(fNbSol, () => reset());
watch(fNbStraight, () => reset());
watch(fPal, () => reset());
watch(fSeqStart, () => reset());

onMounted(() => {
  console.log("VIEWER onMounted");

  if (!state.empty) {
    console.log("VIEWER load state from store");

    const s = state.data;
    console.log(s);

    fNbSol.value = s.fNbSol;
    fNbStraight.value = s.fNbStraight;
    fPal.value = s.fPal;
    fSeqStart.value = s.fSeqStart;
    fSnakeSort.value = s.fSnakeSort;
    selectedSnake.value = s.selectedSnake;
    rotSpeed.value = s.rotSpeed;
    pathCurved.value = s.pathCurved;
    pathStep.value = s.pathStep;
    selectedSolution.value = s.selectedSolution;

    mounting.value = false;
  }
});

onUnmounted(() => {
  console.log("VIEWER onUnmounted");

  const s: IStateViewer = {
    fNbSol: fNbSol.value,
    fNbStraight: fNbStraight.value,
    fPal: fPal.value,
    fSeqStart: fSeqStart.value,
    fSnakeSort: fSnakeSort.value,
    selectedSnake: selectedSnake.value,
    rotSpeed: rotSpeed.value,
    pathCurved: pathCurved.value,
    pathStep: pathStep.value,
    selectedSolution: selectedSolution.value,
  };

  state.save(s);
});
</script>

<style scoped></style>
