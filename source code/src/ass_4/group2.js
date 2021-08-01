import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/MTLLoader.js';

export default class Group2{
    constructor(scene){
        this.scene = scene;
        this.leaderG2 = new THREE.Object3D();
    
        this.scene.add(this.leaderG2);

        this.train1 = new THREE.Object3D();
        this.leaderG2.add(this.train1);
        this.train1Mesh = new THREE.Object3D();
        this.train1Mesh.scale.set(0.35,0.35,0.35);
        this.train1.add(this.train1Mesh);
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./model/train.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('./model/train.obj', (root) => {
                root.castShadow = true;
                root.receiveShadow = true;
                this.train1Mesh.add(root);
            });
        });

        this.train2 = new THREE.Object3D();
        this.train1.add(this.train2);
        this.train2Mesh = new THREE.Object3D();
        this.train2Mesh.scale.set(0.35,0.35,0.35);
        this.train2.add(this.train2Mesh);
        mtlLoader.load('./model/train.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('./model/train.obj', (root) => {
                this.train2Mesh.add(root);
            });
        });

        this.train3 = new THREE.Object3D();
        this.train2.add(this.train3);
        this.train3Mesh = new THREE.Object3D();
        this.train3Mesh.scale.set(0.35,0.35,0.35);
        this.train3.add(this.train3Mesh);
        mtlLoader.load('./model/train.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('./model/train.obj', (root) => {
                this.train3Mesh.add(root);
            });
        });
        
        

        this.curve = new THREE.SplineCurve( [
            new THREE.Vector2( -50, 50 ),
            new THREE.Vector2( -50, 0 ),
            new THREE.Vector2( -50, -50 ),
            new THREE.Vector2( 0, -50 ),
            new THREE.Vector2( 50, -50 ),   
            new THREE.Vector2( 50, 0 ),
            new THREE.Vector2( 50, 50 ),
            new THREE.Vector2( 0, 50 ),
            new THREE.Vector2( -50, 50 )
        ] );

        const points = this.curve.getPoints( 500 );


        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color : 0xff0000} );
        const splineObject = new THREE.Line( geometry, material );
        splineObject.rotation.x = Math.PI * .5;
        splineObject.position.y = 0.05;
        this.leaderG2.add(splineObject);

        this.trainPosition = [new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()];
	    this.trainTarget = [new THREE.Vector2(),new THREE.Vector2(),new THREE.Vector2()];
        this.trainSpeed = 0.001;

        this.clock = 0;
        this.stop = false;
        this.BBox = new THREE.Box3().setFromObject(this.train1Mesh);
    }

    animate(){
        if(this.stop){
            return;
        }

        this.BBox = new THREE.Box3().setFromObject(this.train1Mesh);
        
        const train1Clock = this.clock;
        let train2Clock = train1Clock - 0.0001*250; 
        let train3Clock = train1Clock - 0.0001*500; 

        if(train2Clock < 0){
            train2Clock = 0;
        }
        if(train3Clock < 0){
            train3Clock = 0;
        }

        this.clock += this.trainSpeed;
        this.curve.getPointAt(train1Clock % 1, this.trainPosition[0]);
        this.curve.getPointAt(train2Clock % 1, this.trainPosition[1]);
        this.curve.getPointAt(train3Clock % 1, this.trainPosition[2]);
        this.curve.getPointAt((train1Clock + this.trainSpeed)%1, this.trainTarget[0]);
        this.curve.getPointAt((train2Clock + this.trainSpeed)%1, this.trainTarget[1]);
        this.curve.getPointAt((train3Clock + this.trainSpeed)%1, this.trainTarget[2]);
        this.train1Mesh.position.set(this.trainPosition[0].x, 0, this.trainPosition[0].y);
        this.train2Mesh.position.set(this.trainPosition[1].x, 0, this.trainPosition[1].y);
        this.train3Mesh.position.set(this.trainPosition[2].x, 0, this.trainPosition[2].y);
        this.train1Mesh.lookAt(this.trainTarget[0].x, 0, this.trainTarget[0].y);
        this.train2Mesh.lookAt(this.trainTarget[1].x, 0, this.trainTarget[1].y)
        this.train3Mesh.lookAt(this.trainTarget[2].x, 0, this.trainTarget[2].y)
    }
}