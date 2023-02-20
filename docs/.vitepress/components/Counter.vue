<template>
  <keep-alive>
    <button @click="increment">Count is: {{ count }}</button>
  </keep-alive>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const count = ref(0);

const increment = () => {
  count.value++;
  console.log(count.value);
};

onMounted(() => {
  console.log("onMounted");
  console.log(count.value);
});

onUnmounted(() => {
  console.log("onUnmounted");
});
</script>
