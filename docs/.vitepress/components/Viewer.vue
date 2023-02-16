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
  <!-- <div
    class="flex items-center bg-red-400 text-white text-sm font-bold px-4 py-1"
  >
    <svg
      class="fill-current w-4 h-4 mr-2"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
    >
      <path
        d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z"
      />
    </svg>
    <div>Something happened that you should know about.</div>
  </div> -->
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
