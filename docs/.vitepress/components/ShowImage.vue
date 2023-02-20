<template>
  <div style="display: block; margin: 0 auto; width: {{ props.width }}">
    <figure>
      <img
        :src="_img"
        alt="missing"
        :width="props.width"
        style="display: block; margin: 0 auto; margin-bottom: 10px"
      />
      <figcaption style="text-align: center; font-style: italic">
        {{ props.caption }}
      </figcaption>
    </figure>
  </div>
</template>

<script setup lang="ts">
import { withBase } from "vitepress";
import { onMounted, ref } from "vue";
const props = defineProps({
  img: { type: String, required: true },
  width: { type: String, required: true },
  caption: { type: String, required: true },
});

const _img = ref("");

onMounted(() => {
  _img.value = withBase(props.img);
});
</script>

<style scoped></style>
