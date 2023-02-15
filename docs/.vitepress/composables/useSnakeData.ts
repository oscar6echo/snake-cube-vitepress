import { withBase } from "vitepress";
import { onMounted, ref } from "vue";

type Pos = [number, number, number];

type Sequence = Array<number>;
type Direction = Array<number>;
type Path = Array<Array<Array<number>>>;
type MapCoord = Map<number, Pos>;

interface Solution {
  path: MapCoord;
  direction: Direction;
  startPos: Pos;
}

type SnakesIn = Map<string, Solution[]>;

type Snakes = Map<
  string,
  { sequence: Sequence; palindrome: boolean; solutions: Solution[] }
>;

// shared data across instances soload only once
const snakeData = ref();

const dataUrl = withBase(`/data/solutions.json`);

const useSnakeData = () => {
  onMounted(async () => {
    if (snakeData.value) {
      return;
    }

    const result = await fetch(dataUrl);
    // console.log(result);

    const data: SnakesIn = await result.json();
    // console.log(data);

    const value = buildValue(data);
    console.log(value);

    snakeData.value = value;
    // console.log(snakeData.value);
  });

  return {
    snakeData,
  };
};

const buildValue = (data: SnakesIn): Snakes => {
  console.time("buildValue");
  const s: Snakes = new Map();

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
  console.timeEnd("buildValue");
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

export { useSnakeData, Snakes };
