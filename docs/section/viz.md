# Viewer

## User Guide

Explore the **snake cubes** and their **solutions** below.

Give the large number of snakes/solutions, you can filter **snakes** on:

- Number of **solutions**
- Number of **straight cubelets**
- Only **palindromic snakes** or all snakes

These filters are the same as those in the [stats tables](./stats.md).

Additionally you can filter **snakes** on the first few elements of their **sequence**.  
This allows to narrow down the search and avoid the truncated list.  
For example, for `Sequence Start`: `0110` wil filter out all snakes whose sequence does not start with [**end cubelet**, **turn cubelet**, **turn cubelet**, **straight cubelet** ].

## Explore

<Viewer />

<script setup>

import Viewer from '../.vitepress/components/Viewer.vue'

</script>
