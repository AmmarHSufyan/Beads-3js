import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// import beads.json
import beadsJSON from './beads.json';

// Add beads around the torus
// Scene, Camera, Renderer
const scene = new THREE.Scene();


const canvas = document.getElementById('three-canvas');

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // Enable antialiasing
});
renderer.setPixelRatio(window.devicePixelRatio)

const container = document.getElementById('canvas-container');
renderer.setSize(container.clientWidth, container.clientHeight);
// renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff); // White background

renderer.toneMapping = THREE.ACESFilmicToneMapping; // Improves dynamic range
renderer.toneMappingExposure = 1.5; // Adjust exposure for brighter results


// renderer.physicallyCorrectLights = true; // Use physically correct lighting
// renderer.outputEncoding = THREE.sRGBEncoding; // Proper color encoding
// document.body.appendChild(renderer.domElement);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);
camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth movement
controls.minDistance = 4; // Limit minimum zoom distance
controls.maxDistance = 9; // Limit maximum zoom distance 
controls.dampingFactor = 0.05; // Adjust damping factor (lower values are smoother)
controls.enablePan = false;



// Add postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const fxaaPass = new ShaderPass(FXAAShader);
fxaaPass.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
// composer.addPass(fxaaPass);


const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // Intensity
    0.4, // Threshold
    0.85 // Radius
);
// composer.addPass(bloomPass);



// Lights
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); // Bright ambient light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2); // Bright point light
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Mimic sunlight
directionalLight.position.set(-5, 10, 5);
scene.add(directionalLight);

// Bracelet (Torus)
const torusGeometry = new THREE.TorusGeometry(2, 0.05, 16, 100);
const torusMaterial = new THREE.MeshBasicMaterial({ color: 0xbfbfbf });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);



const exrLoader = new EXRLoader();
function loadHDRI(hdriPath) {
    exrLoader.load(hdriPath, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        // scene.background = texture;

        // render(); // Ensure the environment updates immediately
    });
}

// Default HDRI
loadHDRI('src/exr/christmas_photo_studio_06_1k.exr');

let beads = []
// fill beads with 3 kyanite
for (let i = 0; i < 3; i++) {
    beads.push({
        id: 1

    })
}

window.addBead = function (id) {
    beads.push({
        id
    })
    createBeads()

}



createBeads()

// make a fuunction that awaits the polar material to load before creating the beads
function createBeads() {

    const radius = 2; // Radius of the torus
    const beadGroup = new THREE.Group();


    const beadCount = beads.length;

    const loader = new GLTFLoader();
    beads.forEach((bead, index) => {
        // let angle = (index / beadCount) * 1.23 * Math.PI; // Calculate angle for each bead
        let angle = (index / beadCount) * 2 * Math.PI; // Calculate angle for each bead
        const beadId = bead.id;
        const beadData = beadsJSON.beads[beadId]; 
        const beadUrl = beadData.url;
        const url = `src/obj/${beadUrl}`;


        loader.load(
            url,
            (gltf) => {
                const model = gltf.scene;

                // Calculate bead position on the circle
                const x = 0
                const z = radius * Math.sin(angle);
                const y = radius * Math.cos(angle);

                model.position.set(x, y, z);
                model.lookAt(0, 0, 0); // Make it face the center
                model.scale.set(1, 1, 1); // Adjust the size of the bead


                // if the beads id is 0, make it transparent
                if (beadData.id === 0) {
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.material.transparent = true; // Ensure material allows transparency
                            child.material.opacity = 0.5; // Adjust for desired effect
                        }
                    });
                }

                // if (index === 0) {
                //     // in crease opacity 
                //     model.traverse((child) => {
                //         if (child.isMesh) {
                //             child.material.transparent = true; // Ensure material allows transparency
                //             child.material.opacity = 0.5; // Adjust for desired effect
                //         }
                //     });
                // }


                beadGroup.add(model);
            },
            undefined,
            (error) => {
                console.error('Error loading GLTF bead:', error);
            }
        );
    });



    beadGroup.rotateY(Math.PI / 2); // Rotate bead group so beads face outward
    // Add bead group to the torus so it rotates together
    // remove the previous beadGroup from torus

    torus.remove(torus.children[0])

    torus.add(beadGroup);

}



// Animation loop
const animate = () => {
    requestAnimationFrame(animate);

    // Update controls for smooth movement
    controls.update();

    // Rotate torus (and beads with it)
    // torus.rotation.y += 0.01;
    // composer.render();
    renderer.render(scene, camera);

};

animate();


// Responsive Design
window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});


// Zoom control buttons
const zoomInButton = document.querySelector('.fa-plus.canvas-icon').parentElement;
const zoomOutButton = document.querySelector('.fa-minus.canvas-icon').parentElement;

// Directional control buttons
const upButton = document.querySelector('.fa-angle-up.canvas-icon').parentElement;
const downButton = document.querySelector('.fa-angle-down.canvas-icon').parentElement;
const leftButton = document.querySelector('.fa-chevron-left.canvas-icon').parentElement;
const rightButton = document.querySelector('.fa-angle-right.canvas-icon').parentElement;

// Movement step size - adjust as needed
const moveStep = 0.3;

// Zoom step - adjust as needed for smoother/faster zoom
const zoomStep = 0.5;

// Add event listener for zoom in button
if (zoomInButton) {
    zoomInButton.addEventListener('click', () => {
        // Calculate new position, ensuring it doesn't go below the minimum distance
        const newZoom = Math.max(controls.minDistance, camera.position.z - zoomStep);
        camera.position.z = newZoom;
        controls.update();
        
        // If there's a zoom slider, update its value
        if (zoomSlider) {
            zoomSlider.value = newZoom;
        }
    });
}

// Add event listener for zoom out button
if (zoomOutButton) {
    zoomOutButton.addEventListener('click', () => {
        // Calculate new position, ensuring it doesn't exceed the maximum distance
        const newZoom = Math.min(controls.maxDistance, camera.position.z + zoomStep);
        camera.position.z = newZoom;
        controls.update();
        
        // If there's a zoom slider, update its value
        if (zoomSlider) {
            zoomSlider.value = newZoom;
        }
    });
}

// Add event listeners for directional buttons
if (upButton) {
    upButton.addEventListener('click', () => {
        camera.position.y += moveStep;
        controls.update();
    });
}

if (downButton) {
    downButton.addEventListener('click', () => {
        camera.position.y -= moveStep;
        controls.update();
    });
}

if (leftButton) {
    leftButton.addEventListener('click', () => {
        camera.position.x -= moveStep;
        controls.update();
    });
}

if (rightButton) {
    rightButton.addEventListener('click', () => {
        camera.position.x += moveStep;
        controls.update();
    });
}


//UI




// HTML Slider for Zoom Control
const zoomSlider = document.getElementById("zoom-slider");
if (zoomSlider) {
    zoomSlider.min = controls.minDistance;
    zoomSlider.max = controls.maxDistance;
    zoomSlider.step = 0.1;
    zoomSlider.value = camera.position.z;

    zoomSlider.addEventListener("input", (e) => {
        const zoomValue = parseFloat(e.target.value);
        camera.position.z = zoomValue;
    });
}

// HTML Reset Button for Camera
const resetButton = document.getElementById("reset-button");
if (resetButton) {
    resetButton.addEventListener("click", () => {
        // Smooth Reset using gsap (optional)
        const targetPosition = { x: 0, y: 0, z: 5 };
        const targetZoom = 5; // Initial zoom level

        gsap.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1,
            onUpdate: () => {
                controls.update();
            }
        });

        // Update slider value to reflect reset zoom
        zoomSlider.value = targetZoom;
    });
}
