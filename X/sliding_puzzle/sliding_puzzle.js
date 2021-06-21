const slidingPuzzleLength = 4;
const width = slidingPuzzleLength;
const height = slidingPuzzleLength;
const size = height * width;
let slidingPuzzle = createSlidingPuzzle();

console.log(slidingPuzzleToString(slidingPuzzle));

function createSlidingPuzzle() {
  const slidingPuzzle = new Array(width * height)
    .fill(null)
    .map((value, index) => index);
  slidingPuzzle[0] = null;
  return slidingPuzzle;
}

function slidingPuzzleToString(slidingPuzzle) {
  let output = "";
  for (let row = 0; row < height; row++) {
    output +=
      slidingPuzzle
        .slice(row * width, (row + 1) * width)
        .map(slidingPuzzleValueToString)
        .join(" ") + "\n";
  }
  return output;
}

function slidingPuzzleValueToString(value) {
  return (value === null ? "" : String(value)).padStart(3, " ");
}

function movePiece(slidingPuzzle, indexOrPosition) {
  let index;
  if (typeof indexOrPosition === "object") {
    index = positionToIndex(indexOrPosition);
  } else {
    index = indexOrPosition;
  }
  const emptySlotIndex = slidingPuzzle.indexOf(null);
  slidingPuzzle = [...slidingPuzzle];
  slidingPuzzle[emptySlotIndex] = slidingPuzzle[index];
  slidingPuzzle[index] = null;
  return slidingPuzzle;
}

function isValidMove(fromIndex, toIndex) {
  const fromPosition = indexToPosition(fromIndex);
  const toPosition = indexToPosition(toIndex);
  return (
    (Math.abs(toPosition.row - fromPosition.row) === 1 &&
      Math.abs(toPosition.column - fromPosition.column) === 0) ||
    (Math.abs(toPosition.row - fromPosition.row) === 0 &&
      Math.abs(toPosition.column - fromPosition.column) === 1)
  );
}

function shuffleTimes(slidingPuzzle, numberOfTimes) {
  const solution = [0];
  for (let shuffleNumber = 1; shuffleNumber <= numberOfTimes; shuffleNumber++) {
    const { slidingPuzzle: nextSlidingPuzzle, index } = shuffle(slidingPuzzle);
    slidingPuzzle = nextSlidingPuzzle;
    solution.unshift(index);
  }
  return {
    slidingPuzzle,
    solution,
  };
}

let lastShuffleToIndex = null;

function shuffle(slidingPuzzle) {
  const emptySlotIndex = slidingPuzzle.indexOf(null);
  const movableIndexes = series(0, slidingPuzzle.length - 1).filter(
    (index) =>
      index !== lastShuffleToIndex && isValidMove(index, emptySlotIndex)
  );
  const index =
    movableIndexes[Math.floor(Math.random() * movableIndexes.length)];
  slidingPuzzle = movePiece(slidingPuzzle, index);
  lastShuffleToIndex = emptySlotIndex;
  return {
    slidingPuzzle,
    index,
  };
}

function indexToPosition(index) {
  return {
    row: Math.floor(index / width),
    column: index % width,
  };
}

function positionToIndex(position) {
  return position.row * width + position.column;
}

function isValidPosition(position) {
  return isValidRow(position.row) && isValidColumn(position.column);
}

function isValidRow(row) {
  return row >= 0 && row < width;
}

function isValidColumn(column) {
  return column >= 0 && column < height;
}

const solvedSlidingPuzzle = createSlidingPuzzle();
function isSolved(slidingPuzzle) {
  return areArraysEqual(slidingPuzzle, solvedSlidingPuzzle);
}

function areArraysEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
}

async function renderSlidingPuzzle(slidingPuzzle) {
  const image = await loadImage("images/cat.jpg");
  let scaledWidth;
  let scaledHeight;
  if (image.naturalWidth < image.naturalHeight) {
    scaledWidth = 256;
    scaledHeight = Math.round(
      (scaledWidth / image.naturalWidth) * image.naturalHeight
    );
  } else {
    scaledHeight = 256;
    scaledWidth = Math.round(
      (scaledHeight / image.naturalHeight) * image.naturalWidth
    );
  }
  const $slidingPuzzle = document.createElement("div");
  $slidingPuzzle.classList.add("sliding-puzzle");
  for (const value of slidingPuzzle) {
    if (value !== null) {
      const $slidingPuzzlePiece = document.createElement("div");
      $slidingPuzzlePiece.classList.add(
        "sliding-puzzle__piece",
        `sliding-puzzle__piece--top-right-${value}`
      );
      // $slidingPuzzlePiece.innerText = value
      $slidingPuzzlePiece.setAttribute("data-value", value);
      $slidingPuzzlePiece.style.backgroundSize = `${scaledWidth}px ${scaledHeight}px`;
      $slidingPuzzle.appendChild($slidingPuzzlePiece);
    }
  }
  return $slidingPuzzle;
}

async function loadImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = url;
  });
}

function series(fromNumberInclusive, toNumberInclusive) {
  const values = [];
  for (let value = fromNumberInclusive; value <= toNumberInclusive; value++) {
    values.push(value);
  }
  return values;
}

function wait(numberOfSeconds) {
  return new Promise((resolve) => setTimeout(resolve, numberOfSeconds * 1000));
}

async function main() {
  const $slidingPuzzle = await renderSlidingPuzzle(slidingPuzzle);

  const $slidingPuzzlePieces = Array.from($slidingPuzzle.children);

  function updatePositions() {
    for (const $slidingPuzzlePiece of $slidingPuzzlePieces) {
      let className = "sliding-puzzle__piece";
      const value = Number($slidingPuzzlePiece.getAttribute("data-value"));
      const slotIndex = slidingPuzzle.indexOf(value);
      className += ` sliding-puzzle__piece--top-right-${value}`;
      className += ` sliding-puzzle__piece--position-${slotIndex}`;
      $slidingPuzzlePiece.className = className;
    }
  }

  async function animatedShuffle() {
    const numberOfShuffles = 100;
    for (
      let shuffleNumber = 1;
      shuffleNumber <= numberOfShuffles;
      shuffleNumber++
    ) {
      slidingPuzzle = shuffle(slidingPuzzle);
      updatePositions();
      await wait(1);
    }
  }

  updatePositions();
  document.body.appendChild($slidingPuzzle);
  // await animatedShuffle()
  const numberOfShuffles = 50;
  const { slidingPuzzle: shuffledSlidingPuzzle, solution } = shuffleTimes(
    slidingPuzzle,
    numberOfShuffles
  );
  console.log("Shuffled sliding puzzle:", shuffledSlidingPuzzle);
  slidingPuzzle = shuffledSlidingPuzzle;
  // slidingPuzzle = [5, 4, 2, 3, 8, null, 7, 10, 9, 1, 6, 11, 12, 13, 14, 15]
  // const solution = [5, 9, 13, 14, 15, 11, 7, 6, 10, 11, 15, 14, 13, 9, 8, 4, 0, 1, 5, 4, 0]
  console.log("Solution:", solution);
  updatePositions();

  let zIndex = 1;
  /*
  $slidingPuzzle.addEventListener('click', (event) => {
    const target = event.target
    if (target.classList.contains('sliding-puzzle__piece')) {
      const $slidingPuzzlePiece = target
      const value = Number($slidingPuzzlePiece.getAttribute('data-value'))
      const slotIndex = slidingPuzzle.indexOf(value)
      const emptySlotIndex = slidingPuzzle.indexOf(null)
      if (isValidMove(slotIndex, emptySlotIndex)) {
        slidingPuzzle = movePiece(slidingPuzzle, slotIndex)
        console.log(slidingPuzzleToString(slidingPuzzle))
        $slidingPuzzlePiece.style.zIndex = zIndex
        zIndex++
        updatePositions()
      }
    }
  })
  */

  let $movingSlidingPuzzlePiece;
  let initialOffsetX;
  let initialOffsetY;
  let lastMousePosition;
  $slidingPuzzle.addEventListener("mousedown", (event) => {
    const target = event.target;
    if (target.classList.contains("sliding-puzzle__piece")) {
      const $slidingPuzzlePiece = target;
      const value = Number($slidingPuzzlePiece.getAttribute("data-value"));
      const slotIndex = slidingPuzzle.indexOf(value);
      const emptySlotIndex = slidingPuzzle.indexOf(null);
      if (isValidMove(slotIndex, emptySlotIndex)) {
        $movingSlidingPuzzlePiece = $slidingPuzzlePiece;
        initialOffsetX = $movingSlidingPuzzlePiece.offsetLeft;
        initialOffsetY = $movingSlidingPuzzlePiece.offsetTop;
        $movingSlidingPuzzlePiece.classList.add(
          "sliding-puzzle__piece--moving"
        );
        lastMousePosition = {
          x: event.pageX,
          y: event.pageY,
        };
      }
    }
  });

  function extracted(
    $movingSlidingPuzzlePiece,
    initialOffsetX,
    initialOffsetY
  ) {
    let translateX = $movingSlidingPuzzlePiece.offsetLeft - initialOffsetX;
    let translateY = $movingSlidingPuzzlePiece.offsetTop - initialOffsetY;

    const value = Number($movingSlidingPuzzlePiece.getAttribute("data-value"));
    const slotIndex = slidingPuzzle.indexOf(value);
    const emptySlotIndex = slidingPuzzle.indexOf(null);
    const slotPosition = indexToPosition(slotIndex);
    const emptySlotPosition = indexToPosition(emptySlotIndex);
    const minimumTranslateX =
      emptySlotPosition.column < slotPosition.column ? -64 : 0;
    const maximumTranslateX =
      emptySlotPosition.column > slotPosition.column ? 64 : 0;
    const minimumTranslateY =
      emptySlotPosition.row < slotPosition.row ? -64 : 0;
    const maximumTranslateY = emptySlotPosition.row > slotPosition.row ? 64 : 0;
    return {
      translateX,
      translateY,
      slotIndex,
      minimumTranslateX,
      maximumTranslateX,
      minimumTranslateY,
      maximumTranslateY,
    };
  }

  window.addEventListener("mousemove", (event) => {
    if ($movingSlidingPuzzlePiece) {
      let {
        translateX,
        translateY,
        minimumTranslateX,
        maximumTranslateX,
        minimumTranslateY,
        maximumTranslateY,
      } = extracted($movingSlidingPuzzlePiece, initialOffsetX, initialOffsetY);

      const mousePosition = {
        x: event.pageX,
        y: event.pageY,
      };
      const deltaX = mousePosition.x - lastMousePosition.x;
      const deltaY = mousePosition.y - lastMousePosition.y;
      translateX += deltaX;
      translateY += deltaY;
      translateX = Math.max(
        minimumTranslateX,
        Math.min(translateX, maximumTranslateX)
      );
      translateY = Math.max(
        minimumTranslateY,
        Math.min(translateY, maximumTranslateY)
      );

      $movingSlidingPuzzlePiece.style.left = initialOffsetX + translateX + "px";
      $movingSlidingPuzzlePiece.style.top = initialOffsetY + translateY + "px";

      lastMousePosition = mousePosition;
    }
  });

  window.addEventListener("mouseup", (event) => {
    if ($movingSlidingPuzzlePiece) {
      let {
        translateX,
        translateY,
        slotIndex,
        minimumTranslateX,
        maximumTranslateX,
        minimumTranslateY,
        maximumTranslateY,
      } = extracted($movingSlidingPuzzlePiece, initialOffsetX, initialOffsetY);

      function hasMoved() {
        return (
          (minimumTranslateX !== 0 && translateX === minimumTranslateX) ||
          (minimumTranslateY !== 0 && translateY === minimumTranslateY) ||
          (maximumTranslateX !== 0 && translateX === maximumTranslateX) ||
          (maximumTranslateY !== 0 && translateY === maximumTranslateY)
        );
      }

      if (hasMoved()) {
        slidingPuzzle = movePiece(slidingPuzzle, slotIndex);
        updatePositions();
      }
      $movingSlidingPuzzlePiece.classList.remove(
        "sliding-puzzle__piece--moving"
      );
      $movingSlidingPuzzlePiece.style.left = null;
      $movingSlidingPuzzlePiece.style.top = null;
      $movingSlidingPuzzlePiece = null;
    }
  });

  async function doMoves(moves) {
    for (const move of moves) {
      slidingPuzzle = movePiece(slidingPuzzle, move);
      updatePositions();
      await wait(1);
    }
  }

  solve(slidingPuzzle, numberOfShuffles + 1, doMoves);
  // doMoves(solution)
}

document.addEventListener("DOMContentLoaded", main);

class Node {
  constructor(slidingPuzzle, depth, moves, solutionMoves) {
    this.slidingPuzzle = slidingPuzzle;
    this.depth = depth;
    this.moves = moves;
    this.solutionMoves = solutionMoves;
    this.children = [];
    this.manhattanDistance = Infinity;
    this.metric = Infinity;
  }
}

class SortedList {
  constructor(comparator) {
    this.comparator = comparator;
    this.list = [];
  }

  insert(value) {
    let index = 0;
    while (
      index < this.list.length - 2 &&
      this.comparator(this.list[index], value) <= 0
    ) {
      index++;
    }
    this.list.splice(index, 0, value);
  }

  remove(index) {
    this.list.splice(index, 1);
  }

  values() {
    return this.list;
  }

  get size() {
    return this.list.length;
  }
}

async function solve(slidingPuzzle, maxDepth, doMoves) {
  debugger;
  console.log("Finding solution...");
  const solution = findSolution(slidingPuzzle);
  if (solution) {
    console.log("Solution found:", solution);
    await doMoves(solution);
  } else {
    console.log("No solution found.");
  }
}

function findSolution(slidingPuzzle) {
  const tree = new Node(solvedSlidingPuzzle, 0, [], []);
  tree.manhattanDistance = manhattanDistance(tree.slidingPuzzle, slidingPuzzle);
  tree.metric = tree.depth + tree.manhattanDistance;
  setAsVisited(tree);
  // console.log(tree.manhattanDistance)
  console.log(generateMovesForSolution(tree));
  if (evaluateIfSolved(tree, slidingPuzzle)) {
    return [];
  }
  let nodes = new SortedList(compareMetric);
  let node = tree;
  while (true) {
    generateChildren(node, slidingPuzzle);
    if (node.children.length >= 1) {
      const nextNodeToVisit = selectNextNodeToVisit(node.children);
      for (const child of node.children) {
        if (child !== nextNodeToVisit) {
          nodes.insert(child);
        }
      }
      node = nextNodeToVisit;
    } else if (nodes.size >= 1) {
      node = selectNextNodeToVisit(nodes.values());
      nodes.remove(node);
    } else {
      debugger;
      return null;
    }
    const moves = generateMovesForSolution(node);
    console.log(moves);
    if (evaluateIfSolved(node, slidingPuzzle)) {
      const moves = generateMovesForSolution(node);
      return moves;
    } else {
      setAsVisited(node);
    }
  }
}

function selectNextNodeToVisit(nodes) {
  if (nodes.length >= 1) {
    return nodes[0];
  } else {
    return null;
  }
}

function hasUnvisitedChildren(node) {
  return node.children.some(isUnvisited);
}

function isUnvisited(node) {
  return node.children.length === 0;
}

function hasBeenVisited(node) {
  return node.children.length >= 1;
}

function compareMetric(a, b) {
  return a.metric - b.metric;
}

function compareManhattanDistance(a, b) {
  return a.manhattanDistance - b.manhattanDistance;
}

function manhattanDistance(slidingPuzzleA, slidingPuzzleB) {
  return sum(
    range(0, size).map((index) =>
      pieceManhattanDistance(slidingPuzzleA, slidingPuzzleB, index)
    )
  );
}

function sum(values) {
  return values.reduce((sum, value) => sum + value);
}

function range(from, to) {
  const range = new Array();
  for (let i = from; i < to; i++) {
    range.push(i);
  }
  return range;
}

function pieceManhattanDistance(slidingPuzzleA, slidingPuzzleB, index) {
  let piece = slidingPuzzleA[index];
  if (piece === null) {
    piece = 0;
  }
  const position = indexToPosition(index);
  const indexB = determinePieceIndex(slidingPuzzleB, piece);
  const positionB = indexToPosition(indexB);
  return (
    Math.abs(position.row - positionB.row) +
    Math.abs(position.column - positionB.column)
  );
}

function allChildren(nodes) {
  const children = [];
  for (const node of nodes) {
    Array.prototype.push.apply(children, node.children);
  }
  return children;
}

function generateMovesForSolution(node) {
  return node.solutionMoves;
}

function generateChildren(node, targetSlidingPuzzle) {
  const slidingPuzzle = node.slidingPuzzle;
  const emptySlotIndex = determineEmptySlotIndex(slidingPuzzle);
  const indexesOfPiecesThatCanBeMovedIntoEmptySlot = determineIndexesOfPiecesThatCanBeMovedIntoSlot(
    slidingPuzzle,
    emptySlotIndex
  );

  let children = [];
  for (const index of indexesOfPiecesThatCanBeMovedIntoEmptySlot) {
    const child = new Node(
      movePiece(slidingPuzzle, index),
      node.depth + 1,
      node.moves.concat([index]),
      [emptySlotIndex].concat(node.solutionMoves)
    );
    child.manhattanDistance = manhattanDistance(
      child.slidingPuzzle,
      targetSlidingPuzzle
    );
    child.metric = child.depth + child.manhattanDistance;
    children.push(child);
  }

  children = children.filter((node) => !hasAlreadyBeenVisited(node));

  node.children = children;

  node.children.forEach(setAsVisited);
}

const visitedStates = new Map();

function setAsVisited(node) {
  const slidingPuzzle = node.slidingPuzzle.map((piece) =>
    piece === null ? 0 : piece
  );
  let a = visitedStates;
  for (let index = 0; index < slidingPuzzle.length - 1; index++) {
    if (!a.has(slidingPuzzle[index])) {
      a.set(slidingPuzzle[index], new Map());
    }
    a = a.get(slidingPuzzle[index]);
  }
  a.set(slidingPuzzle[slidingPuzzle.length - 1], true);
}

function hasAlreadyBeenVisited(node) {
  const slidingPuzzle = node.slidingPuzzle.map((piece) =>
    piece === null ? 0 : piece
  );
  let a = visitedStates;
  for (let index = 0; index < node.slidingPuzzle.length; index++) {
    if (a.has(slidingPuzzle[index])) {
      a = a.get(slidingPuzzle[index]);
    } else {
      return false;
    }
  }
  return true;
}

function evaluateIfSolved(node, slidingPuzzle) {
  return areArraysEqual(node.slidingPuzzle, slidingPuzzle);
}

function determinePieceIndex(slidingPuzzle, piece) {
  return slidingPuzzle.indexOf(piece);
}

function determineEmptySlotIndex(slidingPuzzle) {
  return determinePieceIndex(slidingPuzzle, null);
}

function determineEmptySlotPosition(slidingPuzzle) {
  return indexToPosition(determineEmptySlotIndex(slidingPuzzle));
}

function determineIndexesOfPiecesThatCanBeMovedIntoSlot(
  slidingPuzzle,
  slotIndex
) {
  const slotPosition = indexToPosition(slotIndex);

  const potentialPositionsThatCanBeMovedIntoSlot = [
    { row: slotPosition.row - 1, column: slotPosition.column },
    { row: slotPosition.row, column: slotPosition.column + 1 },
    { row: slotPosition.row + 1, column: slotPosition.column },
    { row: slotPosition.row, column: slotPosition.column - 1 },
  ];

  const positionsOfPiecesThatCanBeMovedIntoSlot = potentialPositionsThatCanBeMovedIntoSlot.filter(
    isValidPosition
  );

  const indexesOfPiecesThatCanBeMovedIntoSlot = positionsOfPiecesThatCanBeMovedIntoSlot.map(
    positionToIndex
  );

  return indexesOfPiecesThatCanBeMovedIntoSlot;
}

function flatten(array) {
  return Array.prototype.concat.apply([], array);
}

function solve2(slidingPuzzle) {
  const subgames = generateSubgames();
  for (const subgame of subgames) {
    slidingPuzzle = solveSubgame(slidingPuzzle, subgame);
  }
}

function generateSubgames() {
  const subgames = [];
  for (let columnToSolve = width - 1; columnToSolve >= 2; columnToSolve--) {
    const subgame = {
      pieceIndexesToPutInPlace: pieceIndexesInColumn(
        columnToSolve,
        (width - 1 - columnToSolve) % 2 == 0
          ? Direction.FromTopToBottom
          : Direction.FromBottomToTop
      ),
      areaThatCanBeUsed: {
        fromRow: 0,
        toRow: height,
        fromColumn: 0,
        toColumn: columnToSolve,
      },
    };
    subgames.push(subgame);
  }
  const subgame = {
    pieceIndexesToPutInPlace: pieceIndexesInColumn(
      1,
      Direction.FromTopToBottom
    ).concat(pieceIndexesInColumn(0, Direction.FromBottomToTop)),
    areaThatCanBeUsed: {
      fromRow: 0,
      toRow: height,
      fromColumn: 0,
      toColumn: 2,
    },
  };
  subgames.push(subgame);
  return subgames;
}

const Direction = {
  FromTopToBottom: 1,
  FromBottomToTop: 2,
};

function pieceIndexesInColumn(column, direction = Direction.FromTopToBottom) {
  switch (direction) {
    case Direction.FromTopToBottom:
      return pieceIndexesInColumnFromTopToBottom(column);
    case Direction.FromBottomToTop:
      return pieceIndexesInColumnFromBottomToTop(column);
  }
}

function pieceIndexesInColumnFromTopToBottom(column) {
  const pieceIndexes = [];
  for (let row = 0; row < height; row++) {
    const position = { row, column };
    const index = positionToIndex(position);
    if (index !== 0) {
      pieceIndexes.push(index);
    }
  }
  return pieceIndexes;
}

function pieceIndexesInColumnFromBottomToTop(column) {
  const pieceIndexes = [];
  for (let row = height - 1; row >= 0; row--) {
    const position = { row, column };
    const index = positionToIndex(position);
    if (index !== 0) {
      pieceIndexes.push(index);
    }
  }
  return pieceIndexes;
}

function solveSubgame(slidingPuzzle, subgame) {
  return putPiecesInPlace(slidingPuzzle, subgame);
}

function putPiecesInPlace(slidingPuzzle, subgame) {}

function moveFromIndexToIndex(slidingPuzzle, fromIndex, toIndex) {
  const fromPosition = indexToPosition(fromIndex);
  const toPosition = indexToPosition(toIndex);
  if (isInQuarterWithEmptySlot(slidingPuzzle, fromPosition, toPosition)) {
    const quarter = determineSectionWithEmptySlot(
      slidingPuzzle,
      fromPosition,
      toPosition
    );
    slidingPuzzle = rotateQuarterWithEmptySlot(
      slidingPuzzle,
      quarter,
      countNumberOfMovesToMovePieceFromPositionToPositionInQuarterWithEmptySlot(
        slidingPuzzle,
        quarter,
        fromPosition,
        toPosition
      )
    );
  }
  // for (let length = 2; length <= slidingPuzzleLength; length++) {
  //   if (isInSectionWithEmptySlot(
  //     slidingPuzzle,
  //     fromPosition,
  //     toPosition,
  // }
  return slidingPuzzle;
}

function rotateQuarterWithEmptySlot(
  slidingPuzzle,
  { fromRow, toRow, fromColumn, toColumn },
  numberOfMoves = 1
) {
  const rotationQuarterPositions = generateRotationQuarterPositions({
    fromRow,
    toRow,
    fromColumn,
    toColumn,
  });
  const emptySlotRotationQuarterPositionsIndex = rotationQuarterPositions.find(
    isEmptySlot
  );
  let nextSlotToMoveRotationQuarterPositionsIndex =
    (emptySlotRotationQuarterPositionsIndex + 1) %
    rotationQuarterPositions.length;
  for (let moveNumber = 1; moveNumber <= numberOfMoves; moveNumber++) {
    slidingPuzzle = movePiece(
      slidingPuzzle,
      rotationQuarterPositions[nextSlotToMoveRotationQuarterPositionsIndex]
    );
    nextSlotToMoveRotationQuarterPositionsIndex =
      (nextSlotToMoveRotationQuarterPositionsIndex + 1) %
      rotationQuarterPositions.length;
  }
  return slidingPuzzle;
}

function countNumberOfMovesToMovePieceFromPositionToPositionInQuarterWithEmptySlot(
  slidingPuzzle,
  { fromRow, toRow, fromColumn, toColumn },
  fromPosition,
  toPosition
) {
  const rotationQuarterPositions = generateRotationQuarterPositions({
    fromRow,
    toRow,
    fromColumn,
    toColumn,
  });
  const fromPositionIndex = rotationQuarterPositions.find(
    isEqualPosition.bind(null, fromPosition)
  );
  const toPositionIndex = rotationQuarterPositions.find(
    isEqualPosition.bind(null, toPosition)
  );
  if (toPositionIndex >= fromPositionIndex) {
    return toPositionIndex - fromPositionIndex;
  } else {
    return (
      rotationQuarterPositions.length - fromPositionIndex + toPositionIndex
    );
  }
}

function isEqualPosition(a, b) {
  return a.row === b.row && a.column === b.column;
}

function generateRotationQuarterPositions({
  fromRow,
  toRow,
  fromColumn,
  toColumn,
}) {
  return [
    { row: fromRow, column: fromColumn },
    { row: fromRow, column: toColumn },
    { row: toRow, column: fromColumn },
    { row: toRow, column: toColumn },
  ];
}

function isInQuarterWithEmptySlot(slidingPuzzle, fromPosition, toPosition) {
  const emptySlotPosition = determineEmptySlotPosition(slidingPuzzle);
  return (
    arePositionsInAdjacentingOrSameRowsAndColumns(fromPosition, toPosition) &&
    arePositionsInAdjacentingOrSameRowsAndColumns(
      fromPosition,
      emptySlotPosition
    ) &&
    arePositionsInAdjacentingOrSameRowsAndColumns(toPosition, emptySlotPosition)
  );
}

function determineSectionWithEmptySlot(
  slidingPuzzle,
  fromPosition,
  toPosition
) {
  const emptySlotPosition = determineEmptySlotPosition(slidingPuzzle);
  return determineSection([fromPosition, toPosition, emptySlotPosition]);
}

function determineSection(positions) {
  const rows = positions.map((position) => position.row);
  const columns = positions.map((position) => position.column);
  return {
    fromRow: Math.min(...rows),
    toRow: Math.max(...rows),
    fromColumn: Math.min(...columns),
    toColumn: Math.max(...columns),
  };
}

function arePositionsInAdjacentingOrSameRowsAndColumns(a, b) {
  return Math.abs(a.row - b.row) <= 1 && Math.abs(a.column - b.column) <= 1;
}

function isEmptySlot(slidingPuzzle, position) {
  return slidingPuzzle[positionToIndex(position)] === null;
}
