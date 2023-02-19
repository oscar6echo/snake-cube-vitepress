import * as THREE from "three";

const buildCube = (vec: THREE.Vector3, no: number, T: number) => {
  const geometry = new THREE.BoxGeometry(T, T, T);
  //   const faceColor = "#1f2937";
  const faceColor = "#404040";
  //   const faceColor = "#0c4a6e";
  //   const faceColor = "#156289";
  //   const faceColor = no % 2 === 0 ? "#4c1d95" : "#404040";

  const material = buildFaceMaterial(faceColor, String(no));

  const cube = new THREE.Mesh(geometry, material);

  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: false,
    opacity: 0.8,
    linewidth: 1,
  });
  const line = new THREE.LineSegments(edges, lineMaterial);

  const group = new THREE.Group();
  group.add(cube);
  group.add(line);

  group.position.x = vec.x;
  group.position.y = vec.y;
  group.position.z = vec.z;

  group.name = `snake-cubelet-${no}`;
  return group;
};

const buildFaceMaterial = (
  color: string,
  text: string
): THREE.MeshBasicMaterial => {
  const ctx = document
    .createElement("canvas")
    .getContext("2d") as CanvasRenderingContext2D;
  const size = 200;
  const fontSize = 190;
  ctx.canvas.width = size;
  ctx.canvas.height = size;

  drawFacelet(ctx, { x: 0, y: 0 }, size, fontSize, color, text);

  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: false,
    depthWrite: true,
  });
  return mat;
};

const drawFacelet = (
  ctx: CanvasRenderingContext2D,
  pos: { x: number; y: number },
  size: number,
  fontSize: number,
  color: string,
  text: string
) => {
  ctx.save();
  ctx.translate(pos.x, pos.y);

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(size / 2, 0);

  ctx.font = `${fontSize}px serif`;

  ctx.fillStyle = "white";

  ctx.fillText(text, 0, size / 2);
  ctx.restore();

  return ctx.canvas;
};

const initMsg = (container: HTMLCanvasElement) => {
  const canvas = container as HTMLCanvasElement;
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;

  var ctx = canvas.getContext("2d");

  const x = canvas.width / 2;
  const y = canvas.height / 2;

  ctx.fillStyle = "red";
  ctx.font = "25px mono";

  ctx.textAlign = "center";
  ctx.fillText("Select Snake", x, y);
};

export { buildCube, buildFaceMaterial, drawFacelet, initMsg };
