<template>
  <button @click="increment">Count is: {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);

const increment = () => {
  count.value++;
};
</script>
