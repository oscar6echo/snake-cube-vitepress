<template>
  <div>
    START VIZFOLD

    <br />
    {{ path }}
    <br />
    {{ step }}
    <br />
    {{ rotSpeed }}
    <br />

    END VIZFOLD
  </div>
</template>

<script setup lang="ts">
import { PropType, toRefs } from "vue";
import { MapCoord } from "../store/snake";

const props = defineProps({
  path: { type: Object as PropType<MapCoord>, required: true },
  step: { type: Number, required: false, default: 0 },
  rotSpeed: { type: Number, required: false, default: 0 },
});
const { path, step, rotSpeed } = toRefs(props);

console.log({ path, step, rotSpeed });
</script>

<style scoped></style>
