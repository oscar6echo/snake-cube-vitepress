import { defineStore } from "pinia";
import { withBase } from "vitepress";
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

type ISnakeSolutions = Map<
  string,
  { sequence: Sequence; palindrome: boolean; solutions: ISolution[] }
>;

interface ISnakeSample {
  name: string;
  sequence: string;
  color: string;
}

interface ISnakeSamplesIn {
  snakes: ISnakeSample[];
}

type ISnakeSamples = Array<ISnakeSample>;

interface ISnakeStats {
  nbSol: number[];
  nbStraight: number[];
  totalSol: number[];
  totalSeq: number[];
  lookup: Map<string, number>;
}

interface ISnakeMisc {
  nbSeq: number;
  nbSol: number;
  nbEndCenter: number;
  nbEndFace: number;
  nbEndEdge: number;
  nbEndCorner: number;
  fracEndCenter: number;
  fracEndFace: number;
  fracEndEdge: number;
  fracEndCorner: number;
  nbCandidate: number;
  nbPlausible: number;
  fracPlausibleOverCandidate: number;
  fracRealOverPlausible: number;
}

let started = false;
let solutions: ISnakeSolutions;
let samples: ISnakeSamples;
let statsAll: ISnakeStats;
let statsPal: ISnakeStats;
let statsMisc: ISnakeMisc;

const useSnakeStore = defineStore("poker", {
  state: (): {
    started: boolean;
    solutions: ISnakeSolutions;
    samples: ISnakeSamples;
    statsAll: ISnakeStats;
    statsPal: ISnakeStats;
    statsMisc: ISnakeMisc;
  } => ({
    started,
    solutions,
    samples,
    statsAll,
    statsPal,
    statsMisc,
  }),
  getters: {},
  actions: {
    async loadData(): Promise<void> {
      if (this.started) {
        // console.log("already started");
        return;
      }
      console.log("SNAKE STORE start loadData");
      this.started = true;

      const data1 = await loadSolutions();
      this.solutions = data1;

      const data2 = await loadSamples();
      this.samples = data2;

      const data3 = buildSnakeStats(this.solutions, false);
      this.statsAll = data3;

      const data4 = buildSnakeStats(this.solutions, true);
      this.statsPal = data4;

      const data5 = buildSnakeMisc(this.solutions);
      this.statsMisc = data5;

      console.log("SNAKE STORE end loadData");
    },
  },
});

const loadSolutions = async (): Promise<ISnakeSolutions> => {
  const snakeSolutionsUrl = withBase(`/data/snake-solutions.json`);
  const result = await fetch(snakeSolutionsUrl);
  const data: ISnakesIn = await result.json();
  const value = buildSnakeSolutionsValue(data);
  return value;
};

const loadSamples = async (): Promise<ISnakeSamples> => {
  const snakeSamplesUrl = withBase(`/data/snake-samples.json`);
  const result = await fetch(snakeSamplesUrl);
  const data: ISnakeSamplesIn = await result.json();
  const value = buildSnakeSamplesValue(data);
  return value;
};

const buildSnakeSolutionsValue = (data: ISnakesIn): ISnakeSolutions => {
  console.time("buildSnakeSolutionsValue");
  const s: ISnakeSolutions = new Map();

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

const buildSnakeSamplesValue = (data: ISnakeSamplesIn): ISnakeSamples => {
  console.time("buildSnakeSamplesValue");
  const arr: ISnakeSamples = data.snakes;

  console.timeEnd("buildSnakeSamplesValue");
  console.log(arr);
  return arr;
};

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
  snakeSolutions: ISnakeSolutions,
  onlyPalindrome = false
): ISnakeStats => {
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

const buildSnakeMisc = (snakeSolutions: ISnakeSolutions): ISnakeMisc => {
  const timerName = `buildSnakeMisc`;
  console.time(timerName);

  const nbSeq = snakeSolutions.size;

  let nbSol = 0;
  let nbEndCorner = 0;
  let nbEndFace = 0;
  let nbEndEdge = 0;
  let nbEndCenter = 0;

  for (const e of snakeSolutions.values()) {
    nbSol += e.solutions.length;
    for (const sol of e.solutions) {
      const start = sol.path.get(1);
      //   console.log({ start });
      const startKind = getPosKind(start);
      if (startKind === "O") {
        nbEndCenter += 1;
      }
      if (startKind === "F") {
        nbEndFace += 1;
      }
      if (startKind === "E") {
        nbEndEdge += 1;
      }
      if (startKind === "C") {
        nbEndCorner += 1;
      }

      const end = sol.path.get(27);
      //   console.log({ end });
      const endKind = getPosKind(end);
      if (endKind === "O") {
        nbEndCenter += 1;
      }
      if (endKind === "F") {
        nbEndFace += 1;
      }
      if (endKind === "E") {
        nbEndEdge += 1;
      }
      if (endKind === "C") {
        nbEndCorner += 1;
      }
    }
  }

  const fracEndCenter = nbEndCenter / 2 / nbSol;
  const fracEndFace = nbEndFace / 2 / nbSol;
  const fracEndEdge = nbEndEdge / 2 / nbSol;
  const fracEndCorner = nbEndCorner / 2 / nbSol;

  const nbCandidate = Math.pow(2, 27 - 2) / 2;

  const searchPlausible = (snake: number[]): number => {
    if (snake.length === 25) return 1;
    let resStraight: number;
    if (snake[snake.length - 1] === 0) {
      resStraight = searchPlausible([...snake, 1]);
    } else {
      resStraight = 0;
    }
    const resTurn = searchPlausible([...snake, 0]);
    return resStraight + resTurn;
  };

  const nbPlausible = (searchPlausible([0]) + searchPlausible([1])) / 2;

  const fracPlausibleOverCandidate = nbPlausible / nbCandidate;
  const fracRealOverPlausible = nbSeq / nbPlausible;

  const misc = {
    nbSeq,
    nbSol,
    nbEndCenter,
    nbEndFace,
    nbEndEdge,
    nbEndCorner,
    fracEndCenter,
    fracEndFace,
    fracEndEdge,
    fracEndCorner,
    nbCandidate,
    nbPlausible,
    fracPlausibleOverCandidate,
    fracRealOverPlausible,
  };

  console.timeEnd(timerName);
  console.log(misc);
  return misc;
};

const getPosKind = (pos: Pos): string => {
  const _i = Math.abs(pos[0] - 1);
  const _j = Math.abs(pos[1] - 1);
  const _k = Math.abs(pos[2] - 1);
  const _s = _i + _j + _k;
  if (_s === 0) {
    return "O";
  }
  if (_s === 1) {
    return "F";
  }
  if (_s === 2) {
    return "E";
  }
  if (_s === 3) {
    return "C";
  }
};

// const getPosKind = (pos: Pos): string => {
//   for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//       for (let k = 0; k < 3; k++) {
//         const _i = Math.abs(i - 1);
//         const _j = Math.abs(j - 1);
//         const _k = Math.abs(k - 1);
//         const _s = _i + _j + _k;
//         if (_s === 0) {
//           return "O";
//         }
//         if (_s === 1) {
//           return "F";
//         }
//         if (_s === 2) {
//           return "E";
//         }
//         if (_s === 3) {
//           return "C";
//         }
//       }
//     }
//   }
// };

export { useSnakeStore, ISnakeStats };
