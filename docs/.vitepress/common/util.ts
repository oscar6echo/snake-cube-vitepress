import d3 from "../assets/d3";

const fmtNb = d3.format(",d");
const fmtPct = d3.format(".2f");

const buildStyle = (arr: string[]): string => {
  return arr.join(" ");
};

export { fmtNb, fmtPct, buildStyle };
