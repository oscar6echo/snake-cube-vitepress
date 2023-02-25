<template>
  <div class="flex items-center h-5">
    <button type="button" :class="styleIcon" @click="clickPlayPause">
      <div v-if="!_playing" class="i-fa6-solid:play"></div>
      <div v-else class="i-fa6-solid:pause"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickStop">
      <div class="i-fa6-solid:stop"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickStepLeft">
      <div class="i-fa6-solid:backward-step"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickStepRight">
      <div class="i-fa6-solid:forward-step"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickSpeedUp">
      <div class="i-fa6-solid:chevron-up"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickSpeedDown">
      <div class="i-fa6-solid:chevron-down"></div>
    </button>
    <button type="button" :class="styleIcon" @click="clickToggleWay">
      <div v-if="_forward" class="i-fa6-solid:arrow-right"></div>
      <div v-else class="i-fa6-solid:arrow-left"></div>
    </button>
    <button type="button" :class="styleIconBounce" @click="clickToggleBounce">
      <div class="i-fa-solid:exchange-alt"></div>
    </button>
    <button type="button" :class="styleIconLoop" @click="clickToggleLoop">
      <div class="i-fa-solid:redo"></div>
    </button>

    <div class="flex align-center">
      <input
        type="range"
        :min="0"
        :max="rangeMax"
        v-model.number="_rangePos"
        :step="1"
        :class="styleRange"
        :style="widthRange"
      />
      <output name="o" :class="styleOutput">{{ output }}</output>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRefs, watch } from "vue";
import { buildStyle } from "../common/util";

const props = defineProps({
  values: { type: Array<{ value: any; text: string }>, required: true },
  modelValue: { type: Number, required: false, default: 0 },
  forward: { type: Boolean, required: false, default: true },
  delay: { type: Number, required: false, default: 400 },
  speedFactor: { type: Number, required: false, default: 1.5 },
  autoplay: { type: Boolean, required: false, default: false },
  bounce: { type: Boolean, required: false, default: false },
  loop: { type: Boolean, required: false, default: false },
  index: { type: Boolean, required: false, default: false },
  rangeMin: { type: Number, required: false, default: 1 },
  buttons: { type: Array<string>, required: false, default: [] },
  width: { type: Number, required: false, default: 300 },
  time: { type: Boolean, required: false, default: false },
  debug: { type: Boolean, required: false, default: false },
});
const { values, modelValue } = toRefs(props);
const emit = defineEmits(["update:modelValue"]);

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

const _rangePos = ref(0);
const _playing = ref(false);
const _delay = ref(100);
const _forward = ref(true);
const _bounce = ref(false);
const _loop = ref(false);

const rangeMax = computed(() => values.value.length - 1);

const output = computed(() =>
  values.value && values.value.length ? values.value[_rangePos.value].text : ""
);

watch(modelValue, () => {
  _rangePos.value = modelValue.value;
});
watch(_rangePos, () => {
  emit(
    "update:modelValue",
    props.index ? _rangePos.value : values.value[_rangePos.value].value
  );
});
watch(values, async () => {
  if (modelValue.value && rangeMax.value) {
    // --------------- ARTIFICIAL TRIGGER
    _rangePos.value += 1;
    await nextTick();
    _rangePos.value -= 1;
  }

  emit(
    "update:modelValue",
    props.index ? _rangePos.value : values.value[_rangePos.value].value
  );
});

onMounted(() => {
  _playing.value = props.autoplay;
  _forward.value = props.forward;
  _delay.value = props.delay;
  _bounce.value = props.bounce;
  _loop.value = props.loop;
  widthRange.value = `width: ${props.width}px;`;
  //   _rangePos.value = modelValue.value;
});

let timerId = null;

const clickPlayPause = (): void => {
  _playing.value = !_playing.value;
  if (_playing.value) {
    walk();
  } else {
    stop();
  }
};

const walk = (): void => {
  const carryon = step();
  if (carryon) timerId = setTimeout(walk, _delay.value);
};

const stop = (): void => {
  clearTimeout(timerId);
};

const step = (): boolean => {
  if (_forward.value) {
    if (_rangePos.value < rangeMax.value) {
      _rangePos.value += 1;
    } else {
      if (_loop.value) {
        if (_bounce.value) {
          _rangePos.value = rangeMax.value - 1;
          _forward.value = false;
        } else {
          _rangePos.value = 0;
        }
      } else {
        _playing.value = false;
        return false;
      }
    }
  } else {
    if (_rangePos.value > 0) {
      _rangePos.value -= 1;
    } else {
      if (_loop.value) {
        if (_bounce.value) {
          _rangePos.value = 1;
          _forward.value = true;
        } else {
          _rangePos.value = rangeMax.value;
        }
      } else {
        _playing.value = false;
        return false;
      }
    }
  }
  return true;
};

const clickStop = (): void => {
  clearTimeout(timerId);
  _rangePos.value = 0;
  _playing.value = false;
};
const clickStepLeft = (): void => {
  const _forward_current = _forward.value;
  _forward.value = false;
  step();
  _forward.value = _forward_current;
};
const clickStepRight = (): void => {
  const _forward_current = _forward.value;
  _forward.value = true;
  step();
  _forward.value = _forward_current;
};
const clickSpeedUp = (): void => {
  _delay.value /= props.speedFactor;
};
const clickSpeedDown = (): void => {
  _delay.value *= props.speedFactor;
};
const clickToggleWay = (): void => {
  _forward.value = !_forward.value;
};
const clickToggleBounce = (): void => {
  _bounce.value = !_bounce.value;
};
const clickToggleLoop = (): void => {
  _loop.value = !_loop.value;
};
</script>

<style scoped></style>
