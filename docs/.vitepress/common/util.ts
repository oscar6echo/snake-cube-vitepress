import d3 from "../assets/d3";

const fmtNb = d3.format(",d");
const fmtPct = d3.format(".2f");

const buildStyle = (arr: string[]): string => {
  return arr.map((e) => e.trim()).join(" ");
};

const rndUuid = () => String(Math.floor(Math.random() * 1e6));

export { fmtNb, fmtPct, buildStyle, rndUuid };
