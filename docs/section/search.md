# Search

[[toc]]

## Input

The search algorithm takes as input a partial [sequence](./index.md#definitions) of 0 to 27 elements, together constraining the universe of possible [snake cubes](./index.md#definitions) to search:

- full contraint: 27 elements represent one **snake cube** exactly.
- no constraint: 0 element represents all possible **snake cubes**
- between 1 and 26 elements represent a section of **snake cube** universe.  
  EXAMPLE: partial **sequence** `01101` represents all snake cubes starting with cubelets [**end**, **turn**, **turn**, **straight**,**turn**] and not contraint on the following ones.

## Method

<ShowImage img="/img/snake-cube-done.jpg" width="250" caption="Looking for solutions !" />

The search is [recursive](<https://en.wikipedia.org/wiki/Recursion_(computer_science)>) starting from a given [start position](./index.md#definitions) among the 27 possible.  
In a typical [branch and bound](https://en.wikipedia.org/wiki/Branch_and_bound) approach the algo is described in the 3 main functions:

- [step()](#step): move on one **cubelet** in developing **path**.
- [branch()](#branch): decide and launch recursive exploration all possible next steps for **path**.
- [bound: isValidPosition()](#bound): stops if candidate position is invalid i.e. lies outside cube or overlaps with **path** so far.

See commented code for these 3 functions below.

### Breaking Symmetries

The search is careful to avoid counting the same solutions multiple times. Indeed a cube can be rotated into itself in 24 distinct ways. Each such rotated cube has 10 symmetrical positions (intial position + 9 axes of symmetry). Moreover a **snake cube** is unordered i.e. a **snake cube** and its reverse are the same object.

To do so the algo uses 2 tricks:

1. It break geometric symmetries by
   - ordering:
     - dimensions `x (0) < y (1) < z (2)`.
     - directions `positive (0) < negative (1)`.
   - then forcing exploration in this order:
     - parameter `exploredDim` enforces the dimensions order
     - function `branch()` explores direction `+k` before `-k`
1. It keeps a **solution** only if its **direction** is **lexicographically _smaller_ or _equal_** to that of the reverse solution, which must also be valid and consequently will be discovered in the search. This filtering avoids counting all solutions twice. The **"_equal_"** case covers palindromic **snake cubes** i.e. identical in reverse order.

### Golang

The search is implemented in [go](https://go.dev/) which has many benefits, among them:

- Easy to learn/read/write
- High performance
- Builtin [concurrency](https://www.golang-book.com/books/intro/10)
  - This allows to run the search from each 27 [start position](./index.md#definitions) in parallel.  
    See function [RunParallel](https://github.com/oscar6echo/snake-cube-go/blob/29be92c5a5f4f547fde431a5521b4435dad061ae/solver/search.go#L379)

### Step()

```go
// https://github.com/oscar6echo/snake-cube-go/blob/main/solver/search.go

func (state *SolverState) step(
    n int,              // stage from 0 to 26
    pos Pos,            // current position as [x, y, z]
    direct int,         // direction
    exploredDim int     // 0, 1, 2 for x, y, z
    ) {
    // direction sign give the direction move: positive or negative
    sign := signInt(direct)
    // abs(direction) gives direction axis: 1, 2, 3 -> x, y, z
    newPos := pos
    newPos[abs(direct)-1] += sign

    // discard if invalid position i.e. out of cube or overlap
    if state.isValidPosition(newPos) {

        // grow path
        state.path[newPos[0]][newPos[1]][newPos[2]] = n + 2
        state.direction[n] = direct

        // start branch
        state.branch(n+1, newPos, direct, exploredDim)

        // reset after branch complete
        state.path[newPos[0]][newPos[1]][newPos[2]] = 0
        state.direction[n] = 0
    }
}
```

### Branch()

```go
// https://github.com/oscar6echo/snake-cube-go/blob/main/solver/search.go


func (state *SolverState) branch(
    n int,              // stage from 0 to 26
    pos Pos,            // current position as [x, y, z]
    direct int,         // direction
    exploredDim int     // 0, 1, 2 for x, y, z
    ) {

    var k int
    // L = 27
    if n == state.L-1 {
        // path is complete
        state.sequence[n] = 0
        isLexicographicallySmallerOrEqual, isPalindrome := state.checkSolution()

        if isLexicographicallySmallerOrEqual {
            // only keep solutions if lexicographically smaller or equal
            //  to discard symmetrical solutions

            // sequence = snake cube uuid
            sequence := buildLexicographicSmallerSequence(state.sequence)
            direction := copySlice(state.direction)
            path := state.copyPath(state.path)
            startPos := state.StartPos

            solution := Solution{
                Sequence:   sequence,
                Direction:  direction,
                Path:       path,
                StartPos:   startPos,
                Palindrome: isPalindrome,
            }
            state.SolutionStore = append(state.SolutionStore, solution)
        }
    } else {
        // apply constraints in sequenceIn = input sequence
        if n >= len(state.sequenceIn) || state.sequenceIn[n] == 0 {
            // go straight
            state.sequence[n] = 0
            state.step(n, pos, direct, exploredDim)
        }
        // apply constraints in sequenceIn = input sequence
        if n >= len(state.sequenceIn) || state.sequenceIn[n] == 1 {
            // make turn
            state.sequence[n] = 1
            // explore under exploredDim constraint
            for k = 1; k <= min(exploredDim, 3); k++ {
                // turn orthogonal to current direction
                if k != abs(direct) {
                    // explore both direction, starting with positive
                    state.step(n, pos, +k, exploredDim)
                    state.step(n, pos, -k, exploredDim)

                }
            }
            if exploredDim < 3 {
                // only after exploration is done increase exploredDim by one
                state.step(n, pos, exploredDim+1, exploredDim+1)
            }
        }
    }
}
```

### Bound()

```go
// https://github.com/oscar6echo/snake-cube-go/blob/main/solver/search.go

func (state *SolverState) isValidPosition(pos Pos) bool {
    // lies within cube 0<=x,y,z<3
    if pos[0] >= 0 && pos[0] < 3 && pos[1] >= 0 && pos[1] < 3 && pos[2] >= 0 && pos[2] < 3 {
        // must be vacant position
        if state.path[pos[0]][pos[1]][pos[2]] == 0 {
            return true
        }
        return false
    }
    return false
}
```

## Run

The execution is very fast.  
The exhaustive search is completed in about 0.5s :tada:

```sh
./solver
start RunParallel
...
==> 1906 solutions for [0 1 1]
==> 1301 solutions for [1 0 1]
==> 8779 solutions for [1 1 0]
==> 39718 solutions for [0 0 0]
search time: 530.422995ms
shape time: 157.973112ms
nb sequences: 11487
nb solutions: 51704
solutions saved to: solutions.json - done in 108.953654ms
```

The solutions available for postprocessing in file [solutions.json](https://github.com/oscar6echo/snake-cube-go/raw/main/solutions.json).
