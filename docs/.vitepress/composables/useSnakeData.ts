import { withBase } from "vitepress";
import { onMounted, ref } from "vue";

type Pos = [number, number, number];

type Sequence = Array<number>;
type Direction = Array<number>;
type Path = Array<Array<Array<number>>>;
type MapCoord = Map<number, Pos>;

interface SnakeRaw {
  Sequence: Sequence;
  Direction: Direction;
  Path: Path;
  StartPos: number[];
  Palindrome: Boolean;
}

interface Snake {
  sequence: Sequence;
  direction: Direction;
  path: MapCoord;
  start: number[];
  palindrome: Boolean;
}

// shared data across instances so we load only once.
const snakeData = ref();

// const dataUrl = `/data-snake-cubes.json`;
const dataUrl = withBase(`/data-snake-cubes-full.json`);

const useSnakeData = () => {
  onMounted(async () => {
    console.log("onMounted");
    if (snakeData.value) {
      return;
    }

    const result = await fetch(dataUrl);

    // console.log(result);
    const json = await result.json();
    console.log(json);

    snakeData.value = (json as SnakeRaw[]).map((e) => buildSnake(e));
    console.log(snakeData.value);
  });

  return {
    snakeData,
  };
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

const buildSnake = (snakeRaw: SnakeRaw): Snake => ({
  sequence: snakeRaw.Sequence,
  direction: snakeRaw.Direction,
  path: buildMapCoord(snakeRaw.Path),
  start: snakeRaw.StartPos,
  palindrome: snakeRaw.Palindrome,
});

export { useSnakeData };
