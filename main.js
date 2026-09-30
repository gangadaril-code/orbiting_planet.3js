import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const container = document.querySelector('#canvas-container');
const rotationToggle = document.querySelector('#rotation-toggle');
const sceneStatus = document.querySelector('#scene-status');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#edf0ea');

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(6.2, 5.1, 7.6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
container.prepend(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.85, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4.5;
controls.maxDistance = 13;
controls.maxPolarAngle = Math.PI * 0.48;

scene.add(new THREE.HemisphereLight('#f8fbff', '#76817b', 2.1));

const keyLight = new THREE.DirectionalLight('#fff0d9', 4.2);
keyLight.position.set(-3.5, 7, 4.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(4000, 4000);
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 6;
keyLight.shadow.camera.bottom = -4;
keyLight.shadow.normalBias = 0.035;
keyLight.shadow.radius = 5;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight('#fcfafa', 1.5);
fillLight.position.set(4, 3, -4);
scene.add(fillLight);

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(200, 200),
	new THREE.MeshStandardMaterial({ color: '#e3e7df', roughness: 0.92 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.025;
ground.receiveShadow = true;
scene.add(ground);

const plinthMaterial = new THREE.MeshStandardMaterial({ color: '#315f60', roughness: 0.36, metalness: 0.18 });
const lowerPlate = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 3.1), plinthMaterial);
lowerPlate.position.y = 0.06;
lowerPlate.receiveShadow = true;
lowerPlate.castShadow = true;
scene.add(lowerPlate);

const upperPlate = new THREE.Mesh(
	new THREE.BoxGeometry(3.35, 0.16, 2.75),
	new THREE.MeshStandardMaterial({ color: '#477b77', roughness: 0.3, metalness: 0.16 })
);
upperPlate.position.y = 0.2;
upperPlate.receiveShadow = true;
upperPlate.castShadow = true;
scene.add(upperPlate);

const chairPivot = new THREE.Group();
scene.add(chairPivot);

const gltfLoader = new GLTFLoader();
gltfLoader.load('./kenney-chair.glb', ({ scene: chair }) => {
	const bounds = new THREE.Box3().setFromObject(chair);
	const size = bounds.getSize(new THREE.Vector3());
	const center = bounds.getCenter(new THREE.Vector3());
	const scale = 1.55 / size.y;
	const plateTop = upperPlate.position.y + 0.08;

	chair.scale.setScalar(scale);
	chair.position.set(
		-center.x * scale,
		plateTop - bounds.min.y * scale,
		-center.z * scale
	);
	chair.traverse((object) => {
		if (object instanceof THREE.Mesh) {
			object.castShadow = true;
			object.receiveShadow = true;
		}
	});
	chairPivot.add(chair);
	sceneStatus.textContent = 'SCENE RUNNING';
}, undefined, (error) => {
	sceneStatus.textContent = 'MODEL FAILED TO LOAD';
	console.error('Unable to load kenney-chair.glb:', error);
});

let isRotating = true;
const clock = new THREE.Clock();

rotationToggle.addEventListener('click', () => {
	isRotating = !isRotating;
	rotationToggle.textContent = isRotating ? 'Pause rotation' : 'Resume rotation';
	rotationToggle.setAttribute('aria-pressed', String(!isRotating));
});

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
	const delta = clock.getDelta();
	if (isRotating) {
		chairPivot.rotation.y += delta * 0.55;
	}
	controls.update();
	renderer.render(scene, camera);
});
