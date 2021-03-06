import { expect, specification } from '../packages/specification/index.js';
import { createRenderableBinaryTree } from './createRenderableBinaryTree.js';
import { RenderableBinaryTree } from './RenderableBinaryTree.js';

specification(function () {
  const binaryTree = new BinaryTree()

  const child1 = new BinaryTreeNode()
  child1.parent = binaryTree.root
  child1.value = 1
  binaryTree.root.children.push(child1)

  const child2 = new BinaryTreeNode()
  child2.parent = binaryTree.root
  child2.value = 1
  binaryTree.root.children.push(child2)

  const renderableBinaryTree = createRenderableBinaryTree(binaryTree)

  const expectedRenderableBinaryTree = new RenderableBinaryTree()

  const renderableChild1 = new RenderableBinaryTreeNode()
  renderableChild1.parent = expectedRenderableBinaryTree.root
  renderableChild1.value = 1
  renderableChild1.root.children.push(renderableChild1)

  const renderableChild2 = new RenderableBinaryTreeNode()
  renderableChild2.parent = expectedRenderableBinaryTree.root
  renderableChild2.value = 2
  renderableChild2.root.children.push(renderableChild2)

  expect(renderableTreeEquals(renderableBinaryTree, expectedRenderableBinaryTree))
})
