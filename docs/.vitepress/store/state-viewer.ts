import { defineStore } from "pinia";

interface IStateViewer {
  fNbSol: number;
  fNbStraight: number;
  fPal: boolean;
  fSeqStart: string;
  fSnakeSort: string;
  selectedSnake: string;
  rotSpeed: number;
  pathCurved: boolean;
  pathStep: number;
  selectedSolution: number;
}

interface IStateViewerFull extends IStateViewer {
  empty: boolean;
}

let empty = true;

let fNbSol: number;
let fNbStraight: number;
let fPal: boolean;
let fSeqStart: string;
let fSnakeSort: string;
let selectedSnake: string;
let rotSpeed: number;
let pathCurved: boolean;
let pathStep: number;
let selectedSolution: number;

const useStateViewer = defineStore("state-viewer", {
  state: (): IStateViewerFull => ({
    empty,
    fNbSol,
    fNbStraight,
    fPal,
    fSeqStart,
    fSnakeSort,
    selectedSnake,
    rotSpeed,
    pathCurved,
    pathStep,
    selectedSolution,
  }),
  getters: {
    data: (state) => ({
      fNbSol: state.fNbSol,
      fNbStraight: state.fNbStraight,
      fPal: state.fPal,
      fSeqStart: state.fSeqStart,
      fSnakeSort: state.fSnakeSort,
      selectedSnake: state.selectedSnake,
      rotSpeed: state.rotSpeed,
      pathCurved: state.pathCurved,
      pathStep: state.pathStep,
      selectedSolution: state.selectedSolution,
    }),
  },
  actions: {
    save(data: IStateViewer): void {
      console.log("STATE-VIEWER STORE save");

      const d = {
        fNbSol: data.fNbSol,
        fNbStraight: data.fNbStraight,
        fPal: data.fPal,
        fSeqStart: data.fSeqStart,
        fSnakeSort: data.fSnakeSort,
        selectedSnake: data.selectedSnake,
        rotSpeed: data.rotSpeed,
        pathCurved: data.pathCurved,
        pathStep: data.pathStep,
        selectedSolution: data.selectedSolution,
      };
      console.log(d);

      this.fNbSol = d.fNbSol;
      this.fNbStraight = d.fNbStraight;
      this.fPal = d.fPal;
      this.fSeqStart = d.fSeqStart;
      this.fSnakeSort = d.fSnakeSort;
      this.selectedSnake = d.selectedSnake;
      this.rotSpeed = d.rotSpeed;
      this.pathCurved = d.pathCurved;
      this.pathStep = d.pathStep;
      this.selectedSolution = d.selectedSolution;

      this.empty = false;
    },
  },
});

export { useStateViewer, IStateViewer };
