import { Grid } from '../Grid.js';
import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls.js';

const dimensions = [100, 100, 100]
const cubeColors = new Grid(dimensions)
const cubes = new Grid(dimensions)

let color = 0xcccccc

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.y = 2
camera.position.z = 5

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.maxPolarAngle = Math.PI * 0.5
controls.minDistance = 1
controls.maxDistance = 5000

const ambientLight = createAmbientLight()
scene.add(ambientLight)

const hemisphereLight = createHemisphereLight()
scene.add(hemisphereLight)

const directionalLight = createDirectionalLight()
scene.add(directionalLight)

// const directionalLightHelper = new THREE.DirectionalLightHelper(
//   directionalLight,
//   10
// )
// scene.add(directionalLightHelper)

const plane = createPlane()
scene.add(plane)

for (const [position, cubeColor] of cubeColors.entries()) {
  if (cubeColor) {
    cubes.set(position, createCube(cubeColor, position))
  }
}

for (const [position, cube] of cubes.entries()) {
  if (cube) {
    scene.add(cube)
  }
}

const raycaster = new THREE.Raycaster()

function setColor(_color) {
  color = _color
}

window.setColor = setColor

let lastCameraPosition
renderer.domElement.addEventListener("pointerdown", () => {
  lastCameraPosition = camera.position.clone()
})

window.addEventListener("pointerup", (event) => {
  const button = event.button
  if ([0, 2].includes(button) && camera.position.equals(lastCameraPosition)) {
    const mousePosition = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    raycaster.setFromCamera(mousePosition, camera)
    const intersections = raycaster.intersectObjects(scene.children)
    const intersection = intersections[0]
    if (intersection) {
      console.log(intersection)
      if (button === 0) {
        if (intersection.object.uuid === plane.uuid) {
          const position = [
            Math.round(intersection.point.x),
            Math.max(0, Math.round(intersection.point.y)),
            Math.round(intersection.point.z),
          ]
          while (cubeColors.get(position)) {
            position[1]++
          }
          cubeColors.set(position, color)
          const cube = createCube(color, position)
          cubes.set(position, cube)
          scene.add(cube)
        } else {
          // cube
          const position = intersection.object.position.toArray()
          const faceIndex = intersection.faceIndex
          if ([8, 9].includes(faceIndex)) {
            position[2] += 1
          }
          if (!cubeColors.get(position)) {
            cubeColors.set(position, color)
            const cube = createCube(color, position)
            cubes.set(position, cube)
            scene.add(cube)
          }
        }
      } else if (button === 2) {
        const position = intersection.object.position.toArray()
        const cubeColor = cubeColors.get(position)
        if (cubeColor) {
          cubeColors.set(position, undefined)
          const cube = cubes.get(position)
          scene.remove(cube)
          cubes.set(position, undefined)
        }
      }
    }
  }
})

const animate = function () {
  requestAnimationFrame(animate)

  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01

  renderer.render(scene, camera)
}

animate()

function createPlane() {
  const geometry = new THREE.PlaneBufferGeometry(100, 100)
  const material = new THREE.MeshStandardMaterial({ color: 0xdddddd })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotation.x = -Math.PI / 2
  plane.position.x = 0
  plane.position.y = -0.5
  plane.position.z = 0
  plane.receiveShadow = true
  return plane
}

function createCube(color, position) {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({ color })
  const cube = new THREE.Mesh(geometry, material)
  cube.position.set(...position)
  cube.castShadow = true
  return cube
}

function createAmbientLight() {
  return new THREE.AmbientLight(0x666666)
}

function createHemisphereLight() {
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6)
  hemisphereLight.color.setHSL(0.6, 1, 0.6)
  hemisphereLight.groundColor.setHSL(0.095, 1, 0.75)
  hemisphereLight.position.set(0, 50, 0)
  return hemisphereLight
}

function createDirectionalLight() {
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(-2, 2, 1)
  directionalLight.castShadow = true

  return directionalLight
}
