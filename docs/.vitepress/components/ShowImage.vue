<template>
  <div style="display: block; margin: 0 auto; width: {{ props.width }}">
    <figure>
      <img
        :src="props.img"
        alt="missing22"
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
const props = defineProps({
  img: { type: String, required: true },
  width: { type: String, required: true },
  caption: { type: String, required: true },
});
</script>

<style scoped>
.container {
  border: 1px solid red;
}
</style>
