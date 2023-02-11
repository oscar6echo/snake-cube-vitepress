<template>
  <button
    un-bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
    un-text="sm white"
    un-font="mono light"
    un-p="y-2 x-4"
    un-border="2 rounded blue-200"
    @click="onClick"
  >
    Increase ({{ count }})
  </button>

  <!-- <button
    class="bg-blue-400 hover:bg-blue-500 text-sm text-white font-mono font-light py-2 px-4 rounded border-2 border-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600"
    @click="onClick"
  >
    Increase ({{ count }})
  </button> -->

  <div>Nb solutions: "{{ snakeData?.length }}"</div>
  <div class="w-md flex flex-col items-center">
    <div class="w-6 h-6 i-mdi-alarm text-orange-400 hover:text-teal-400" />
    <div
      class="w-8 h-8 i-ic-sharp-alarm-on text-orange-400 hover:text-teal-400"
    />
    <div class="w-10 h-10 i-carbon-logo-github" />
    <div class="w-10 h-10 i-ph-cube-light text-yellow-400" />
    <div class="w-10 h-10 i-logos-vue op-30 hover:op80" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import { useSnakeData } from "../composables/useSnakeData";

const { snakeData } = useSnakeData();
const nbSnake = computed(() => (!!snakeData ? snakeData.value.length : 99));

const count = ref(0);
const onClick = (): void => {
  count.value++;
};
</script>

<style scoped>
.my-btn {
  border: 1px solid red;
}
</style>
