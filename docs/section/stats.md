---
toto: az
titi: 20
---

# Stats

TBD

<pre>{{ mydata }}</pre>

---

<Playground />

:tada:

end.

<script setup>
import { useData } from 'vitepress'

// const mydata = useData()
const { page: mydata } = useData()
</script>
