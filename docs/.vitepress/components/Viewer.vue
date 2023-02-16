<template>
  <div class="flex justify-start mb-2">
    <button :class="styleBtnTxt">Nb Solutions:</button>
    <select id="select-nbsol" v-model="fNbSol" :class="styleSelect">
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
    <select id="select-nbstraight" v-model="fNbStraight" :class="styleSelect">
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
    <select id="select-pal" v-model="fPal" :class="styleSelect">
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

  <div class="flex justify-start mb-2">
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

  <div class="flex justify-start mb-2">
    <button :class="styleBtnTxt">Select Snake (nb Sol):</button>
    <select id="select-snake" v-model="selectedSnake" :class="styleSelectSnake">
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
    <select id="select-pal" v-model="snakeSort" :class="styleSelectSort">
      <option
        v-for="(value, i) in ['nb Sol <', 'nb Sol >', 'Lexico <', 'Lexico >']"
        :key="i"
        :value="value"
        :active="value === snakeSort"
      >
        {{ value }}
      </option>
    </select>
  </div>

  <br />

  <Player :values="pathSteps" />
  <br />
  {{ nbSolOptions }}
  <br />
  {{ nbStraightOptions }}
  <br />
  {{ solutionsFiltered.size }}
  <br />
  {{ selectedSnake }}
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import d3 from "../assets/d3";
import { buildStyle, fmtNb } from "../common/util";
import { useSnakeStore } from "../store/snake";
import Player from "./Player.vue";

const store = useSnakeStore();
store.loadData();

const styleBtnTxt = ref(
  buildStyle([
    "text-sm font-mono font-light",
    "text-black dark:text-light bg-light dark:bg-dark",
    "py-1 px-2 mr-1",
    "btn-no-click",
  ])
);
const styleBtnFiltered = ref(styleBtnTxt.value + " text-left w-40");
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
    "w-61",
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
const snakeSort = ref("nb Sol >");
const nTruncate = ref(200);

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
  if (snakeSort.value === "nb Sol <") {
    arr = _arr.sort((a, b) => d3.ascending(a.nSol, b.nSol));
  }
  if (snakeSort.value === "nb Sol >") {
    arr = _arr.sort((a, b) => d3.descending(a.nSol, b.nSol));
  }
  if (snakeSort.value === "Lexico <") {
    arr = _arr.sort((a, b) => d3.ascending(a.value, b.value));
  }
  if (snakeSort.value === "Lexico >") {
    arr = _arr.sort((a, b) => d3.descending(a.value, b.value));
  }

  if (arr.length < nTruncate.value) return arr;

  const last = {
    value: "bogus",
    text: `truncated at ${nTruncate.value} snakes`,
  };
  return [...arr.slice(0, nTruncate.value), last];
});

const solutionsFiltered = computed(() => {
  const m: typeof store.solutions = new Map();

  if (!store.solutions) return m;

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

const pathSteps = d3.range(27).map((e) => ({ value: e, text: String(e) }));

// watch(fPal, () => {
//   console.log(fPal.value);
// });
</script>

<style scoped>
.btn-no-click {
  pointer-events: none;
  border-color: lightgrey;
}
</style>
