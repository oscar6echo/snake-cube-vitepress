<template>
  <div class="flex items-center h-4">
    <button
      type="button"
      :class="styleIcon"
      @click.exact="clickRotPlus"
      @click.ctrl="clickRotMinus"
    >
      <div
        class="i-mdi:axis-z-rotate-counterclockwise"
        style="font-size: 20px"
      ></div>
      <div class="w-4">
        {{ _rotSpeed }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { buildStyle } from "../common/util";

const props = defineProps({
  rotSpeed: { type: Number, required: false, default: 0 },
  speedUnit: { type: Number, required: false, default: 5 }, // degre per sec
  nbStep: { type: Number, required: false, default: 10 },
});
const emit = defineEmits(["update:modelValue"]);

const styleIcon = ref(
  buildStyle([
    "flex justify-center items-center w-11 h-6 mr-1",
    "font-600",
    "b-1 b-solid b-gray dark:b-gray",
    "bg-light dark:bg-dark",
    "hover:filter-sepia",
  ])
);

const _rotSpeed = ref(0);

watch(_rotSpeed, () => {
  emit("update:modelValue", _rotSpeed.value);
});

onMounted(() => {
  _rotSpeed.value = props.rotSpeed;
});

let timerId = null;

const clickRotPlus = () => {
  if (_rotSpeed.value < props.nbStep - 1) _rotSpeed.value += 1;
  else _rotSpeed.value = 0;
};
const clickRotMinus = () => {
  if (_rotSpeed.value > 0) _rotSpeed.value -= 1;
  else _rotSpeed.value = props.nbStep - 1;
};
</script>

<style scoped>
.sf {
  font: 12px var(--sans-serif);
  font-variant-numeric: tabular-nums;
  display: flex;
  height: 33px;
  align-items: center;
}
</style>
