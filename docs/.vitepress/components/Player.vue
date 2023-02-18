<template>
  <div>
    <div class="sf">
      <button name="p" type="button" :class="styleIcon" @click="clickPlayPause">
        <div v-if="!_playing" class="i-fa6-solid:play"></div>
        <div v-else class="i-fa6-solid:pause"></div>
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
      <button name="w" type="button" :class="styleIcon" @click="clickToggleWay">
        <div v-if="_forward" class="i-fa6-solid:arrow-right"></div>
        <div v-else class="i-fa6-solid:arrow-left"></div>
      </button>
      <button
        name="b"
        type="button"
        :class="styleIconBounce"
        @click="clickToggleBounce"
      >
        <div class="i-fa-solid:exchange-alt"></div>
      </button>
      <button
        name="a"
        type="button"
        :class="styleIconLoop"
        @click="clickToggleLoop"
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
          :step="1"
          :class="styleRange"
          :style="widthRange"
        />
        <output name="o" :class="styleOutput">{{
          values[rangePos].text
        }}</output>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from "vue";
import { buildStyle } from "../common/util";

const props = defineProps({
  values: { type: Array<{ value: any; text: string }>, required: true },
  initial: { type: Number, required: false, default: 0 },
  forward: { type: Boolean, required: false, default: true },
  delay: { type: Number, required: false, default: 400 },
  speedFactor: { type: Number, required: false, default: 1.5 },
  autoplay: { type: Boolean, required: false, default: false },
  bounce: { type: Boolean, required: false, default: false },
  loop: { type: Boolean, required: false, default: false },
  index: { type: Boolean, required: false, default: false },
  buttons: { type: Array<string>, required: false, default: [] },
  width: { type: Number, required: false, default: 300 },
  time: { type: Boolean, required: false, default: false },
  debug: { type: Boolean, required: false, default: false },
});
const { values, initial, delay } = toRefs(props);

const styleIcon = ref(
  buildStyle([
    "flex justify-center items-center w-5 h-5 mr-1",
    "b-1 b-solid b-gray dark:b-gray",
    "bg-light dark:bg-dark",
    "hover:filter-sepia",
  ])
);
const styleIconOn = ref(
  buildStyle([
    "flex justify-center items-center w-5 h-5 mr-1",
    "b-1 b-solid b-gray dark:b-gray",
    "bg-opacity-60 bg-truegray dark:bg-truegray",
    "hover:filter-sepia",
  ])
);
const styleIconBounce = computed(() =>
  _bounce.value ? styleIconOn.value : styleIcon.value
);
const styleIconLoop = computed(() =>
  _loop.value ? styleIconOn.value : styleIcon.value
);
const styleRange = ref(buildStyle(["accent-coolgray"]));
const widthRange = ref("width: 300px;");
const styleOutput = ref(buildStyle(["ml-2"]));

const rangeMin = ref(0);
const rangeMax = computed(() => values.value.length - 1);
const rangePos = ref(0);
const _playing = ref(false);
const _delay = ref(100);
const _forward = ref(true);
const _bounce = ref(false);
const _loop = ref(false);

const output = computed(() => props.values[rangePos.value].text);

watch(initial, () => (rangePos.value = initial.value));

onMounted(() => {
  _playing.value = props.autoplay;
  _forward.value = props.forward;
  _delay.value = props.delay;
  _bounce.value = props.bounce;
  _loop.value = props.loop;
  widthRange.value = `width: ${props.width}px;`;
});

let timerId = null;

const clickPlayPause = () => {
  console.log("clickPlayPause");
  _playing.value = !_playing.value;
  if (_playing.value) {
    walk();
  } else {
    stop();
  }
};

const walk = () => {
  const carryon = step();
  if (carryon) timerId = setTimeout(walk, _delay.value);
};

const stop = () => {
  clearTimeout(timerId);
};

const step = (): boolean => {
  if (_forward.value) {
    if (rangePos.value < rangeMax.value) {
      rangePos.value += 1;
    } else {
      if (_loop.value) {
        if (_bounce.value) {
          rangePos.value = rangeMax.value - 1;
          _forward.value = false;
        } else {
          rangePos.value = 0;
        }
      } else {
        _playing.value = false;
        return false;
      }
    }
  } else {
    if (rangePos.value > 0) {
      rangePos.value -= 1;
    } else {
      if (_loop.value) {
        if (_bounce.value) {
          rangePos.value = 1;
          _forward.value = true;
        } else {
          rangePos.value = rangeMax.value;
        }
      } else {
        _playing.value = false;
        return false;
      }
    }
  }
  return true;
};

const clickStop = () => {
  clearTimeout(timerId);
  rangePos.value = 0;
  _playing.value = false;
};
const clickStepLeft = () => {
  const _forward_current = _forward.value;
  _forward.value = false;
  step();
  _forward.value = _forward_current;
};
const clickStepRight = () => {
  const _forward_current = _forward.value;
  _forward.value = true;
  step();
  _forward.value = _forward_current;
};
const clickSpeedUp = () => {
  _delay.value /= props.speedFactor;
};
const clickSpeedDown = () => {
  _delay.value *= props.speedFactor;
};
const clickToggleWay = () => {
  _forward.value = !_forward.value;
};
const clickToggleBounce = () => {
  _bounce.value = !_bounce.value;
};
const clickToggleLoop = () => {
  _loop.value = !_loop.value;
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