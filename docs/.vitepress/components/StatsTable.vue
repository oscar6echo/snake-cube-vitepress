<template>
  <div :id="id"></div>
</template>

<script setup lang="ts">
import * as Plot from "@observablehq/plot";
import { useData } from "vitepress";
import { computed, onMounted, ref, watch } from "vue";

import d3 from "../assets/d3";
import { ISnakeStats, useSnakeStore } from "../store/snake";

const store = useSnakeStore();
const { isDark } = useData();

const props = defineProps({
  palindrome: { type: Boolean, required: true },
});

const dataStore = computed(() =>
  props.palindrome ? store.statsPal : store.statsAll
);

const id = ref(`plot-stats-${props.palindrome}`);
const data = ref({} as IData);

interface ICoreCell {
  nbSol: number;
  nbStraight: number;
  nbSnake: number;
}

interface ITotalCell {
  x: number;
  y: number;
  total: number;
}

interface IData {
  core: Array<ICoreCell>;
  totalSeq: Array<ITotalCell>;
  totalSol: Array<ITotalCell>;
  totalRow: Array<ITotalCell>;
}

const buildData = (dataIn: ISnakeStats): IData => {
  const coreKey = (nbSol: number, nbStraight: number): string =>
    `${nbSol}-${nbStraight}`;

  const core: ICoreCell[] = [];
  const totalSeq: ITotalCell[] = [];
  const totalSol: ITotalCell[] = [];
  const totalRow: ITotalCell[] = [];

  if (!dataIn) {
    return { core, totalSeq, totalSol, totalRow };
  }

  for (const nbSol of dataIn.nbSol) {
    for (const nbStraight of dataIn.nbStraight) {
      const key = coreKey(nbSol, nbStraight);
      const nbSnake = dataIn.lookup.get(key);
      if (nbSnake) {
        core.push({
          nbSol,
          nbStraight,
          nbSnake,
        });
      }
    }
  }

  dataIn.totalSeq.forEach((e, i) => {
    totalSeq.push({
      x: dataIn.nbStraight[dataIn.nbStraight.length - 1] + 1,
      y: dataIn.nbSol[i],
      total: e,
    });
  });

  dataIn.totalSol.forEach((e, i) => {
    totalSol.push({
      x: dataIn.nbStraight[dataIn.nbStraight.length - 1] + 2,
      y: dataIn.nbSol[i],
      total: e,
    });
  });

  dataIn.nbStraight.forEach((e) => {
    totalRow.push({
      x: e,
      y: dataIn.nbSol[dataIn.nbSol.length - 1] + 1,
      total: d3.sum(
        core.filter((f) => f.nbStraight === e).map((e) => e.nbSnake)
      ),
    });
  });
  totalRow.push({
    x: dataIn.nbStraight[dataIn.nbStraight.length - 1] + 1,
    y: dataIn.nbSol[dataIn.nbSol.length - 1] + 1,
    total: d3.sum(dataIn.totalSeq),
  });
  totalRow.push({
    x: dataIn.nbStraight[dataIn.nbStraight.length - 1] + 2,
    y: dataIn.nbSol[dataIn.nbSol.length - 1] + 1,
    total: d3.sum(dataIn.totalSol),
  });

  return { core, totalSeq, totalSol, totalRow };
};

const buildOptions = (): any => {
  const dCore = data.value.core;
  const dTotalSeq = data.value.totalSeq;
  const dTotalSol = data.value.totalSol;
  const dTotalRow = data.value.totalRow;

  if (!dCore.length) return;

  const nTotalSeqCol = dTotalSeq[0].x;
  const nTotalSolCol = dTotalSol[0].x;
  const nTotalRow = d3.max(dCore.map((e) => e.nbSol)) + 1;

  const buildWidth = (): number =>
    (dataStore.value?.nbStraight.length || 0) * 65;
  const buildHeight = (): number => (dataStore.value?.nbSol.length || 0) * 25;

  const opts = {
    width: buildWidth(),
    height: buildHeight(),
    padding: 0.05,
    grid: true,
    x: {
      axis: "top",
      label: "nb straights",
      tickFormat: (d: any) => {
        if (d < nTotalSeqCol) return d;
        if (d == nTotalSeqCol) return "tot seq";
        if (d == nTotalSolCol) return "tot sol";
      },
    },
    y: {
      label: "nb solutions",
      tickFormat: (d: any) => {
        if (d < nTotalRow) return d;
        if (d == nTotalRow) return "total";
      },
    },
    color: {
      type: "linear",
      scheme: "warm",
      //   scheme: "cool",
      //   scheme: "gnbu",
      //   scheme: "spectral",
      //   scheme: "rdylbu"
      //   scheme: "PiYG",
    },
    style: {
      background: isDark.value ? "#222222" : "white",
    },
    marks: [
      Plot.cell(dCore, {
        x: "nbStraight",
        y: "nbSol",
        fill: "nbSnake",
        // rx: 20, // comment for squares
      }),
      Plot.text(dCore, {
        x: "nbStraight",
        y: "nbSol",
        text: (d: ICoreCell) => d.nbSnake,
        fontSize: 13,
      }),
      Plot.cell(dTotalSeq, {
        x: "x",
        y: "y",
        fill: isDark.value ? "darkgrey" : "lightgrey",
      }),
      Plot.text(dTotalSeq, {
        x: "x",
        y: "y",
        text: (d: ITotalCell) => d.total,
        fontSize: 13,
      }),
      Plot.cell(dTotalSol, {
        x: "x",
        y: "y",
        fill: isDark.value ? "darkgrey" : "lightgrey",
      }),
      Plot.text(dTotalSol, {
        x: "x",
        y: "y",
        text: (d: ITotalCell) => d.total,
        fontSize: 13,
      }),
      Plot.cell(dTotalRow, {
        x: "x",
        y: "y",
        fill: isDark.value ? "darkgrey" : "lightgrey",
      }),
      Plot.text(dTotalRow, {
        x: "x",
        y: "y",
        text: (d: ITotalCell) => d.total,
        fontSize: 13,
      }),
    ],
  };

  return opts;
};

const buildPlot = (): void => {
  data.value = buildData(dataStore.value);
  if (!data.value) return;

  const opts = buildOptions();
  if (!opts) return;

  if (opts) {
    const chart = Plot.plot(opts);
    const selector = `#${id.value}`;
    d3.select(selector).selectAll("*").remove();
    const anchor = d3.select(selector)?.node() as Element;
    anchor.append(chart);
  }
};

watch(dataStore, () => {
  buildPlot();
});

watch(isDark, () => {
  buildPlot();
});

onMounted(() => {
  buildPlot();
});
</script>

<style scoped></style>
