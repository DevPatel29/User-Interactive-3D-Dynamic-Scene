import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import Group1 from './group1.js';
import Avatar from "./avatar.js";
import Group2 from './group2.js';


let mainCamera, avatarCamera, camera, scene, control;
let avatar, currCamera = "mainCamera", dirLight, trackLight, clock, delta;
let isAttached = 'none', groundMesh, loader, groundMaterial, texture_grass, texture_raod, curr_texture = 'road';


function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true,canvas});
    renderer.setClearColor(0xAAAAAA);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PVFSoftShadowMap;
    scene = new THREE.Scene();

    clock = new THREE.Clock();

	mainCamera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	mainCamera.position.set(-40,40,40);

    
    avatarCamera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		60  
	);
    avatarCamera.position.set(0,3,-2.7);
    avatarCamera.lookAt(0,2,12);

    let g1 = new Group1(scene);
    let g2 = new Group2(scene);
    avatar = new Avatar(scene);


    camera = mainCamera;

    {
	    dirLight = new THREE.DirectionalLight(0xffffff, 0.3 );
		dirLight.position.set(20, 100, 20);
		scene.add(dirLight);
	}

    {
        const light = new THREE.PointLight(0xffffff, 0.5, 100, 10);
        light.position.set( 0, 50, 0);
        light.castShadow = true;
        light.shadowCameraVisible = true;
        scene.add( light );
    }

    {
        const ambient = new THREE.AmbientLight( 0xffffff, 0.1);
        scene.add( ambient );
    }

    {
        trackLight = new THREE.SpotLight(0xffffff,1.0,25.0,Math.PI/4.5,0.3,0.8);
        trackLight.position.set(0,15,0);
        trackLight.target = avatar.avatar;
        trackLight.castShadow = true;
        trackLight.shadowCameraVisible = true;
        scene.add(trackLight);
        scene.add(trackLight.target);
    }

	control = new OrbitControls(camera, canvas);

    loader = new THREE.TextureLoader();
    texture_raod = loader.load( './model/road_stone.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 8, 8 );
    } );

    texture_grass = loader.load( './model/grass.jpg', function ( texture ) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set( 0, 0 );
        texture.repeat.set( 8, 8 );
    } );

	const groundGeometry = new THREE.PlaneGeometry(120, 120);
	groundMaterial = new THREE.MeshPhongMaterial({color: 0xCC8866,side: THREE.DoubleSide,map: texture_raod});
	groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
	groundMesh.rotation.x = Math.PI * -.5;
    groundMaterial.receiveShadow = true;
	scene.add(groundMesh);


    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function updateThridPersonCamera(){
        const idealPosition = new THREE.Vector3(0,3,-2.7);
        idealPosition.applyQuaternion(avatar.avatar.quaternion);
        idealPosition.add(avatar.avatar.position);

        const idealLookat = new THREE.Vector3(0,2,12);
        idealLookat.applyQuaternion(avatar.avatar.quaternion);
        idealLookat.add(avatar.avatar.position);

        avatarCamera.position.copy(idealPosition);
        avatarCamera.lookAt(idealLookat);
    }

    function attachAvatar_g1(g1){
        const idealPosition = new THREE.Vector3(0, 1.5, 0);
        idealPosition.applyQuaternion(g1.bus1Mesh.quaternion);
        idealPosition.add(g1.bus1Mesh.position);
        avatar.avatar.position.copy(idealPosition);
    }

    function attachAvatar_g2(g2){
        const idealPosition = new THREE.Vector3(0, 1.5, 0);
        idealPosition.applyQuaternion(g2.train1Mesh.quaternion);
        idealPosition.add(g2.train1Mesh.position);
        avatar.avatar.position.copy(idealPosition);
    }

    function checkCollision(){
        if(avatar.BBox.intersectsBox(g1.BBox) && isAttached != 'g1'){
            g1.stop = true;
        }
        else{
            g1.stop = false;
        }

        if(avatar.BBox.intersectsBox(g2.BBox) && isAttached != 'g2'){
            g2.stop = true;
        }
        else{
            g2.stop = false;
        }
    }

    function render(time) {
        delta = clock.getDelta();

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        trackLight.position.x = avatar.avatar.position.x;
        trackLight.position.z = avatar.avatar.position.z;

        checkCollision();
        updateThridPersonCamera();
    
        g1.animate();
        g2.animate();

        if(isAttached == 'g1'){
            attachAvatar_g1(g1);
        }
        else if(isAttached == 'g2'){
            attachAvatar_g2(g2);
        }

        avatar.animate(delta,g1,g2);

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

window.addEventListener('keydown', function (e) {
    keyDown(e);
});
    
window.addEventListener('keyup', function (e) {
    keyUp(e);
});

function keyDown(e) {
    let keyCode = e.keyCode;

    switch (keyCode) {
        case 87:        //w
            if(isAttached == 'none'){
                avatar.forward = true;
            }
            break;
        case 65:        //a
            avatar.left = true;
            break;
        case 68:        //d
            avatar.right = true;
            break;
        case 83:        //s
            if(isAttached == 'none'){
                avatar.backward = true;
            }
            break;
        case 80:        //p
            if(isAttached == 'g1'){
                isAttached = 'g2';
            }
            else if(isAttached == 'g2'){
                avatar.avatar.position.add(new THREE.Vector3(0, -1.5, 0));
                isAttached = 'none';
            }
            else if(isAttached == 'none'){
                isAttached = 'g1';
            }
            break;
        case 32:        // space
            if(isAttached == 'none' && avatar.isJumping == false){
                avatar.isJumping = true;
                avatar.jumpingVelocity = 20.0;
                avatar.jumpingVelocityDir = 'up';
            }
            break;
        case 84:        //T
            if(curr_texture == 'road'){
                groundMesh.material.map = texture_grass;
                groundMesh.material.needsUpdate = true;
                curr_texture = 'grass';
            }
            else if(curr_texture == 'grass'){
                groundMesh.material.map = texture_raod;
                groundMesh.material.needsUpdate = true;
                curr_texture = 'road';
            }
            break;
        default:
            break;
    }
}

function keyUp(e) {
    let keyCode = e.keyCode;

    switch (keyCode) {
        case 87:        //w
            avatar.forward = false;
            break;
        case 65:        //a
            avatar.left = false;
            break;
        case 68:        //d
            avatar.right = false;
            break;
        case 83:        //s
            avatar.backward = false;
            break;
        case 67:        //c
            if(currCamera == "mainCamera"){
                camera = avatarCamera;
                currCamera = "avatarCamera";
            }
            else if(currCamera == "avatarCamera"){
                camera = mainCamera;
                currCamera = "mainCamera"
            }
            
            break;
        default:
            break;
    }
}

main();

