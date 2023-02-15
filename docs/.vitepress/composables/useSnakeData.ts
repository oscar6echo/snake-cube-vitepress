import { withBase } from "vitepress";
import { onMounted, ref } from "vue";
import d3 from "../assets/d3";

type Pos = [number, number, number];

type Sequence = Array<number>;
type Direction = Array<number>;
type Path = Array<Array<Array<number>>>;
type MapCoord = Map<number, Pos>;

interface ISolution {
  path: MapCoord;
  direction: Direction;
  startPos: Pos;
}

type ISnakesIn = Map<string, ISolution[]>;

type ISnakes = Map<
  string,
  { sequence: Sequence; palindrome: boolean; solutions: ISolution[] }
>;

interface ISample {
  name: string;
  sequence: string;
  color: string;
}

interface ISamplesIn {
  snakes: ISample[];
}

type ISamples = Array<ISample>;

// shared data across instances so load only once
const snakeSolutions = ref(new Map() as ISnakes);
const snakeSamples = ref([] as ISamples);
const snakeStatsAll = ref({} as IStats);
const snakeStatsPalindrome = ref({} as IStats);

let started = false;

const useSnakeSolutions = () => {
  console.log("start useSnakeSolutions");
  onMounted(async () => {
    console.log("=====");
    if (!started && snakeSolutions.value.size > 0) {
      // if (snakeSolutions.value.size > 0) {
      started = true;
      return;
    }

    const snakeSolutionsUrl = withBase(`/data/snake-solutions.json`);
    const result = await fetch(snakeSolutionsUrl);
    const data: ISnakesIn = await result.json();
    const value = buildSnakeSolutionsValue(data);
    snakeSolutions.value = value;

    snakeStatsAll.value = buildSnakeStats(value, false);
    snakeStatsPalindrome.value = buildSnakeStats(value, true);
  });

  return {
    snakeSolutions,
    snakeStatsAll,
    snakeStatsPalindrome,
  };
};

const useSnakeSamples = () => {
  onMounted(async () => {
    if (snakeSamples.value.length > 0) {
      return;
    }

    const snakeSamplesUrl = withBase(`/data/snake-samples.json`);
    const result = await fetch(snakeSamplesUrl);
    const data: ISamplesIn = await result.json();
    const value = buildSnakeSamplesValue(data);
    snakeSamples.value = value;

    console.log(value);
  });

  return {
    snakeSamples,
  };
};

const buildSnakeSolutionsValue = (data: ISnakesIn): ISnakes => {
  console.time("buildSnakeSolutionsValue");
  const s: ISnakes = new Map();

  for (const [seqS, v] of Object.entries(data)) {
    const seqN = seqS.split("").map((e) => Number(e));

    const revSeqS = seqS.split("").reverse().join("");
    const palindrome = seqS === revSeqS;

    const solutions = v.map((e) => ({
      startPos: e.startPos,
      direction: e.direction,
      path: buildMapCoord(e.path),
    }));

    s.set(seqS, { sequence: seqN, palindrome, solutions });
  }
  console.timeEnd("buildSnakeSolutionsValue");
  console.log({ snakeSolutions: s });
  return s;
};

const buildMapCoord = (path: Path): MapCoord => {
  const m: MapCoord = new Map();
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        m.set(path[i][j][k], [i, j, k]);
      }
    }
  }
  return m;
};

const buildSnakeSamplesValue = (data: ISamplesIn): ISamples => {
  console.time("buildSnakeSamplesValue");
  const arr: ISamples = data.snakes;

  console.timeEnd("buildSnakeSamplesValue");
  return arr;
};

interface IStats {
  nbSol: number[];
  nbStraight: number[];
  totalSol: number[];
  totalSeq: number[];
  lookup: Map<string, number>;
}

const convert = {
  sequence: {
    toKey: (seq: number[]): string => seq.join(""),
    fromKey: (key: string): number[] => key.split("").map((e) => Number(e)),
  },
  nSolStraigth: {
    toKey: (nSol: number, nStraight: number): string =>
      [nSol, nStraight].join("-"),
    fromKey: (key: string): number[] => key.split("-").map((e) => Number(e)),
  },
};

const buildSnakeStats = (
  snakeSolutions: ISnakes,
  onlyPalindrome = false
): IStats => {
  const timerName = `buildSnakeStats-onlyPalindrome=${onlyPalindrome}`;
  console.time(timerName);
  const mSol = new Map() as Map<string, number>;

  for (const [seqS, v] of snakeSolutions) {
    if (!onlyPalindrome || v.palindrome) {
      mSol.set(seqS, v.solutions.length);
    }
  }

  const mSolStraight = new Map() as Map<string, number>;

  for (const [seqS, nSol] of mSol.entries()) {
    const seqN = convert.sequence.fromKey(seqS);
    const nStraight = 27 - 2 - d3.sum(seqN);
    const key = convert.nSolStraigth.toKey(nSol, nStraight);
    mSolStraight.set(key, (mSolStraight.get(key) || 0) + 1);
  }

  let arrSol = [] as number[];
  let arrStraight = [] as number[];

  for (const e of mSolStraight.keys()) {
    const [nSol, nStraight] = convert.nSolStraigth.fromKey(e);
    arrSol.push(nSol);
    arrStraight.push(nStraight);
  }

  arrSol = [...new Set(arrSol)].sort(d3.ascending);
  arrStraight = [...new Set(arrStraight)].sort(d3.ascending);

  const totalSeq = arrSol.map((e) =>
    d3.sum(
      arrStraight.map((f) => {
        const key = convert.nSolStraigth.toKey(e, f);
        return mSolStraight.get(key) || 0;
      })
    )
  );
  const totalSol = arrSol.map(
    (e) =>
      e *
      d3.sum(
        arrStraight.map((f) => {
          const key = convert.nSolStraigth.toKey(e, f);
          return mSolStraight.get(key) || 0;
        })
      )
  );

  const stats = {
    nbSol: arrSol,
    nbStraight: arrStraight,
    lookup: mSolStraight,
    totalSeq,
    totalSol,
  };

  console.timeEnd(timerName);
  console.log(stats);
  return stats;
};

export { useSnakeSolutions, ISnakes, useSnakeSamples, ISamples, IStats };
