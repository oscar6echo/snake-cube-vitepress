# Stats

[[toc]]

## Observations

We can make the following observations after the full search:

- Totals:

  | Quantity            | Value       |
  | ------------------- | ----------- |
  | Number of solutions | {{ nbSol }} |
  | Number of snakes    | {{ nbSeq }} |

- Number of paths with start/end positions:

  | Start/End Cubelet | Value             | Fraction               |
  | ----------------- | ----------------- | ---------------------- |
  | Corner            | {{ nbEndCorner }} | {{ fracEndCorner  }} % |
  | Face              | {{ nbEndFace }}   | {{ fracEndFace }} %    |
  | Edge              | {{ nbEndEdge }}   | {{ fracEndEdge }} %    |
  | Center            | {{ nbEndCenter }} | {{ fracEndCenter}} %   |

## Distribution

To get an overview of the distribution of solutions, the snakes are aggregated by:

- number of **straight cubelets** on the horizontal axis
- number of **solutions** on the vertical axix

The right most colmuns are for each line i.e. a given number of **solutions**:

- the total number of **sequences**
- the total number of **solutions**

The bottom row is the sum of each column. We can check that in total:

- the number of snakes is the expected {{ nbSeq }}
- the number of solutions is the expected {{ nbSol }}

This operation is done for:

- all snakes
- only palindromic snakes

## All Snakes

Distribution of solutions for all snakes:

<StatsTable  :palindrome=false />

## Palindromic Snakes

Distribution of solutions for palindromic snakes only, i.e. those which are symmetrical by reversing cubelet order:

<StatsTable  :palindrome=true />

<script setup lang="ts">

import { computed, ref } from 'vue'
import { useSnakeStore } from '../.vitepress/store/snake'
import { fmtNb, fmtPct } from '../.vitepress/common/util'

const store = useSnakeStore()
store.loadData()

const nbSeq = computed(() => fmtNb(store.statsMisc?.nbSeq || 0));
const nbSol = computed(() => fmtNb(store.statsMisc?.nbSol || 0));

const nbEndCenter = computed(() => fmtNb(store.statsMisc?.nbEndCenter || 0));
const nbEndFace = computed(() => fmtNb(store.statsMisc?.nbEndFace || 0));
const nbEndEdge = computed(() => fmtNb(store.statsMisc?.nbEndEdge || 0));
const nbEndCorner = computed(() => fmtNb(store.statsMisc?.nbEndCorner || 0));

const fracEndCenter = computed(() => fmtPct(100 *store.statsMisc?.fracEndCenter || 0));
const fracEndFace = computed(() => fmtPct(100* store.statsMisc?.fracEndFace || 0));
const fracEndEdge = computed(() => fmtPct(100 *store.statsMisc?.fracEndEdge || 0));
const fracEndCorner = computed(() => fmtPct(100* store.statsMisc?.fracEndCorner || 0));

</script>
