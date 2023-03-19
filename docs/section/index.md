# Snake Cube

## Game

A **snake cube** is a sequence of 27 small cubes connected by an elastic that goes through each cube.  
The elastic goes either straight through the cube, from one face to the opposite, or turns inside the cube and goes from one face to an adjacent one.

The aim of the game is to fold the **snake cube** into a 3x3x3 cube, if a solution exists. In technical terms such a solution is an undirected [Hamiltonian path](https://en.wikipedia.org/wiki/Hamiltonian_path) in the 3x3x3 grid graph.

![missing](/img/snake-cube-solution.png)
_Sample snake cube solution_

## Definitions

The following definition help clarify this document:

- **cubelet**: One small cube, among the 27 that make up a snake cube.
- **turn cubelet**: A **cubelet** linked to previous/next **cubelet** by adjacent faces.
- **straight cubelet**: A **cubelet** linked to previous/next **cubelet** by opposite faces.
- **end cubelet**: A **cubelet** linked to only one other **cubelet**, positioned at an end.
- **snake cube**: A chain of 27 **cubelets**, irrespective of its position in space, flat or folded.
- **snake**: A synonym of **snake cube**.
- **sequence**: The representation of a **snake cube** as a list of 27 "_0_" or "_1_".  
  EXAMPLE: the sequence for the snake cube above is "001010110111010111101010100".
  | Code | Description |
  | ---- | ----------------------------------- |
  | 1 | **turn cubelet** |
  | 0 | **straight cubelet** or **end cubelet** |

- **path:**: A path in 3D space coordinate {x, y, z} each an element of P=[0, 1, 2], representing a snake cube in folded position.  
  EXAMPLE: the sample **snake cube** solution **path** is :

  ```json
  // [x, y, z]
  // axis direction: x -> right, y-> reader, z-> down
  [
    [[1,16,23],[18,17,22],[19,20,21]],
    [[2,15,24],[5,6,7],[10,9,8]],
    [[3,14,25],[4,13,26],[11,12,27]]]
  ]
  ```

- **direction:**: The representation of a **path** as a list of 26 steps in 3D from **start position**.  
   EXAMPLE: the sample **snake cube** solution **direction** is : `[1,1,2,-1,3,3,2,-3,-3,1,3,-2,-2,-1,-1,2,-3,2,3,3,-2,-2,1,1,2,2]`
  | Code | Axis | Direction |
  |------ |------ |----------- |
  | +1 | x | positive |
  | -1 | x | negative |
  | +2 | y | positive |
  | -2 | y | negative |
  | +3 | z | positive |
  | -3 | z | negative |

- **start position:**: The coordinates of the first element of a **path**.  
   EXAMPLE: the sample **snake cube** solution **start position** is : `[0,0,0]`

- **solution:**: A way to fold a **snake cube**. It can be represented as follows. Both unambiguously define a way to fold a **snake cube**:

  - A **path**
  - A **start position** and a **direction**.

- **palindrome:**: A snake which sequence is the same as its reverse.

<script setup lang="ts">

import Counter from  '../.vitepress/components/Counter.vue'

</script>
