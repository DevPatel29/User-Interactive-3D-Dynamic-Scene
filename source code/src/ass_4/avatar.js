import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {FBXLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/FBXLoader.js';

export default class Avatar{
    constructor(scene){
        this.scene = scene;

        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;

        this.avatar = new THREE.Object3D();
        this.avatar.scale.set(0.015,0.015,0.015);
        this.avatar.rotateOnAxis(new THREE.Vector3(0,1,0), 1.57);
        this.scene.add(this.avatar);
        this.target = null;

        const loader = new FBXLoader();

        this.mixerForward = new THREE.AnimationMixer();
        loader.setPath('./model/');
        loader.load('avtar.fbx', (fbx) => {
            fbx.traverse( function ( object ) {
                if ( object.isMesh ) object.castShadow = true;
            } );

            this.target = fbx;
            const anim = new FBXLoader();
            anim.setPath("./model/");
            anim.load('Walking_forward.fbx', (anim) =>{
                this.mixerForward = new THREE.AnimationMixer(fbx);
                const idle = this.mixerForward.clipAction(anim.animations[0]);
                idle.play();
            })
            this.avatar.add(fbx);
        });

        this.mixerBackward = new THREE.AnimationMixer();
        const anim = new FBXLoader();
        anim.setPath("./model/");
        anim.load('Walking_Backwards.fbx', (anim) =>{
            this.mixerBackward = new THREE.AnimationMixer(this.target);
            const idle = this.mixerBackward.clipAction(anim.animations[0]);
            idle.play();
        });

        this.mixerFalling = new THREE.AnimationMixer();
        anim.setPath("./model/");
        anim.load('Floating.fbx', (anim) =>{
            this.mixerFalling = new THREE.AnimationMixer(this.target);
            const idle = this.mixerFalling.clipAction(anim.animations[0]);
            idle.play();
        });

        this.mixerIdle = new THREE.AnimationMixer();
        anim.setPath("./model/");
        anim.load('Idle.fbx', (anim) =>{
            this.mixerIdle = new THREE.AnimationMixer(this.target);
            const idle = this.mixerIdle.clipAction(anim.animations[0]);
            idle.play();
        });

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(1, 0.25, 50.0);
        this.decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
        this.BBox = new THREE.Box3().setFromObject(this.avatar);
        this.isJumping = false;
        this.jumpingVelocity = 0;
        this.jumpingVelocityDir = null;
        this.gravityAcc = 18.8;
    }

    animate(delta,g1,g2){
        if(this.isJumping){
            this.jumpingAnimation(delta);
            // return;
        }
        
        this.BBox = new THREE.Box3().setFromObject(this.avatar);

        const velocity = this.velocity;
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this.decceleration.x,
            velocity.y * this.decceleration.y,
            velocity.z * this.decceleration.z
        );
        frameDecceleration.multiplyScalar(delta);
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z));
    
        velocity.add(frameDecceleration);

        const controlObject = this.avatar;
        const _Q = new THREE.Quaternion();
        const _A = new THREE.Vector3();
        const _R = controlObject.quaternion.clone();
        const acc = this.acceleration.clone();

        if (this.forward) {
            velocity.z += acc.z * delta;
        }
        if (this.backward) {
            velocity.z -= acc.z * delta;
        }
        if (this.left) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * Math.PI * delta * this.acceleration.y);
            _R.multiply(_Q);
        }
        if (this.right) {
            _A.set(0, 1, 0);
            _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * delta * this.acceleration.y);
            _R.multiply(_Q);
        }
    
        controlObject.quaternion.copy(_R);
    
        const oldPosition = new THREE.Vector3();
        oldPosition.copy(controlObject.position);
    
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(controlObject.quaternion);
        forward.normalize();
    
        const sideways = new THREE.Vector3(1, 0, 0);
        sideways.applyQuaternion(controlObject.quaternion);
        sideways.normalize();
    
        sideways.multiplyScalar(velocity.x * delta);
        forward.multiplyScalar(velocity.z * delta);
    
        controlObject.position.add(forward);
        controlObject.position.add(sideways);

        this.BBox = new THREE.Box3().setFromObject(this.avatar);
        
        if(this.BBox.intersectsBox(g1.BBox)){
            if(controlObject.position.distanceTo(g1.bus1Mesh.position) <= oldPosition.distanceTo(g1.bus1Mesh.position)){
                controlObject.position.add((new THREE.Vector3(0,0,0)).sub(forward));
                controlObject.position.add((new THREE.Vector3(0,0,0)).sub(sideways));
            }
        }

        if(this.BBox.intersectsBox(g2.BBox)){
            if(controlObject.position.distanceTo(g2.train1Mesh.position) <= oldPosition.distanceTo(g2.train1Mesh.position)){
                controlObject.position.add((new THREE.Vector3(0,0,0)).sub(forward));
                controlObject.position.add((new THREE.Vector3(0,0,0)).sub(sideways));
            }
        }

        if(controlObject.position.x >= 60 || controlObject.position.x <= -60 || controlObject.position.z >= 60 || controlObject.position.z <= -60){
            controlObject.position.add((new THREE.Vector3(0,0,0)).sub(forward));
            controlObject.position.add((new THREE.Vector3(0,0,0)).sub(sideways));
        }

        if(this.forward){
            this.mixerForward.update(delta);
            return ;
        }

        if(this.backward){
            this.mixerBackward.update(delta);
            return;
        }

        if(!this.isJumping){
            this.mixerIdle.update(delta);
        }
    }

    jumpingAnimation(delta){
        if(this.jumpingVelocityDir == 'up'){
            if((this.jumpingVelocity - this.gravityAcc*delta) <= 0){
                this.jumpingVelocity = 0;
                this.jumpingVelocityDir = 'down';
            }
            else{
                this.avatar.position.y += this.jumpingVelocity*delta - 0.5*this.gravityAcc*delta*delta;
                this.jumpingVelocity = this.jumpingVelocity - this.gravityAcc*delta;
            }
        }
        else if(this.jumpingVelocityDir == 'down'){
            if(this.avatar.position.y <= 0){
                this.avatar.position.y = 0;
                this.avatar.jumpingVelocity = 0;
                this.isJumping = false;
            }
            else{
                this.avatar.position.y -= this.jumpingVelocity*delta + 0.5*this.gravityAcc*delta*delta;
                this.jumpingVelocity = this.jumpingVelocity + this.gravityAcc*delta;
            }
        }

        this.mixerFalling.update(delta);
    }

    getAvatar(){
        return this.avatar;
    }
}