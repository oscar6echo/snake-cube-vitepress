<template>
  <div>
    <div class="sf">
      <button name="p" type="button" :class="styleIcon" @click="clickPlayPause">
        <div class="i-fa6-solid:play"></div>
      </button>
      <button name="s" type="button" :class="styleIcon" @click="clickStop">
        <div class="i-fa6-solid:stop"></div>
      </button>
      <button name="l" type="button" :class="styleIcon" @click="clickStepLeft">
        <div class="i-fa6-solid:backward-step"></div>
      </button>
      <button name="r" type="button" :class="styleIcon" @click="clickStepRight">
        <div class="i-fa6-solid:forward-step"></div>
      </button>
      <button name="u" type="button" :class="styleIcon" @click="clickSpeedUp">
        <div class="i-fa6-solid:chevron-up"></div>
      </button>
      <button name="d" type="button" :class="styleIcon" @click="clickSpeedDown">
        <div class="i-fa6-solid:chevron-down"></div>
      </button>
      <button
        name="w"
        type="button"
        :class="styleIcon"
        @click="clickToggleDirection"
      >
        <div class="i-fa6-solid:arrow-right"></div>
      </button>
      <button
        name="b"
        type="button"
        :class="styleIcon"
        @click="clickToggleBounce"
      >
        <div class="i-fa-solid:exchange-alt"></div>
      </button>
      <button
        name="a"
        type="button"
        :class="styleIcon"
        @click="clickToggleRedo"
      >
        <div class="i-fa-solid:redo"></div>
      </button>

      <div style="display: flex; align-items: center">
        <input
          name="i"
          type="range"
          :min="rangeMin"
          :max="rangeMax"
          v-model="rangePos"
          :step="rangeStep"
          :class="styleRange"
        />
        <output name="o" :class="styleOutput">{{
          values[rangePos].text
        }}</output>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { buildStyle } from "../common/util";

const props = defineProps({
  values: { type: Array<{ value: any; text: string }>, required: true },
  index: { type: Boolean, required: false, default: false },
  initial: { type: Number, required: false, default: 0 },
  delay: { type: Number, required: false, default: 1000 / 60 },
  autoplay: { type: Boolean, required: false, default: true },
  loop: { type: Boolean, required: false, default: false },
  alternate: { type: Boolean, required: false, default: false },
  width: { type: Number, required: false, default: 300 },
  time: { type: Boolean, required: false, default: false },
  speedFactor: { type: Number, required: false, default: 1.5 },
  show: { type: Array<string>, required: false, default: [] },
  debug: { type: Boolean, required: false, default: false },
});

const styleIcon = ref(
  buildStyle([
    "flex justify-center items-center w-5 h-5 mr-1",
    "b-1 b-solid b-gray dark:b-gray",
    "bg-light dark:bg-dark",
    "hover:bg-truegray",
  ])
);
const styleRange = ref(buildStyle(["w-50", "accent-coolgray"]));
const styleOutput = ref(buildStyle(["ml-2"]));

const rangeMin = ref(0);
const rangeMax = ref(100);
const rangeStep = ref(1);
const rangePos = ref(0);

const output = computed(() => props.values[rangePos.value].text);

const clickPlayPause = () => {
  console.log("clickPlayPause");
};
const clickStop = () => {
  console.log("clickStop");
};
const clickStepLeft = () => {
  console.log("clickStepLeft");
};
const clickStepRight = () => {
  console.log("clickStepRight");
};
const clickSpeedUp = () => {
  console.log("clickSpeedUp");
};
const clickSpeedDown = () => {
  console.log("clickSpeedDown");
};
const clickToggleDirection = () => {
  console.log("clickToggleDirection");
};
const clickToggleBounce = () => {
  console.log("clickToggleBounce");
};
const clickToggleRedo = () => {
  console.log("clickToggleRedo");
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

.sb {
  margin-right: 0.3em;
  width: 2em;
  border-radius: 0;
  background-color: #f5f5f5;
  border: 1px solid #bbb;
  outline: none;
}
</style>
