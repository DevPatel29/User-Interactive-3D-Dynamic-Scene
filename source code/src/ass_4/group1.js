import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/build/three.module.js';
import {OBJLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/OBJLoader.js';
import {MTLLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/MTLLoader.js';

export default class Group1{
    constructor(scene){
        this.scene = scene;
        this.leaderG1 = new THREE.Object3D();
    
        this.scene.add(this.leaderG1);

        this.bus1 = new THREE.Object3D();
        this.leaderG1.add(this.bus1);
        this.bus1Mesh = new THREE.Object3D();
        this.bus1Mesh.scale.set(0.3,0.3,0.3);
        this.bus1.add(this.bus1Mesh);
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./model/bus.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('./model/bus.obj', (root) => {
                root.castShadow = true;
                root.receiveShadow = true;
                this.bus1Mesh.add(root);
            });
        });

        this.bus2 = new THREE.Object3D();
        this.bus1.add(this.bus2);
        this.bus2Mesh = new THREE.Object3D();
        this.bus2Mesh.scale.set(0.3,0.3,0.3);
        this.bus2.add(this.bus2Mesh);
        mtlLoader.load('./model/bus.mtl', (mtl) => {
            mtl.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('./model/bus.obj', (root) => {
                this.bus2Mesh.add(root);
            });
        });
        

        this.curve = new THREE.SplineCurve( [
            new THREE.Vector2( -40, 0 ),
            new THREE.Vector2( -30, 40 ),
            new THREE.Vector2( 0, 0 ),
            new THREE.Vector2( 10, -15 ),
            new THREE.Vector2( 30, -35 ),   
            new THREE.Vector2( 40, 0 ),
            new THREE.Vector2( 36, 38 ),
            new THREE.Vector2( -10, 20 ),
            new THREE.Vector2( -20, -20 ),
            new THREE.Vector2( -40, -40),
            new THREE.Vector2( -40, 0 ),
        ] );

        const points = this.curve.getPoints( 500 );

        for(let i=0;i<500;i+=50){
            let streetLamp = new THREE.Object3D();
            this.scene.add(streetLamp);
            mtlLoader.load('./model/streetlamp.mtl', (mtl) => {
                mtl.preload();
                const objLoader = new OBJLoader();
                objLoader.setMaterials(mtl);
                objLoader.load('./model/streetlamp.obj', (root) => {
                    root.scale.set(0.3,0.3,0.3);
                    streetLamp.position.set(points[i].x+1.5,0,points[i].y+1.5);
                    streetLamp.add(root);
                });
            });
            

            let streetLight = new THREE.SpotLight(0xFF8080,1.0,25.0,Math.PI/3,0.3,0.0);
            streetLight.position.set(points[i].x+1.5,4,points[i].y+1.5)
            streetLight.target.position.set(points[i].x+1.5,0,points[i].y+1.5)
            streetLight.castShadow = true;
            scene.add(streetLight);
            scene.add(streetLight.target);
        }

        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        const material = new THREE.LineBasicMaterial( { color : 0xff0000} );
        const splineObject = new THREE.Line( geometry, material );
        splineObject.rotation.x = Math.PI * .5;
        splineObject.position.y = 0.05;
        this.leaderG1.add(splineObject);

        this.busPosition = [new THREE.Vector2(),new THREE.Vector2()];
	    this.busTarget = [new THREE.Vector2(),new THREE.Vector2()];
        this.busSpeed = 0.001;

        this.clock = 0;
        this.stop = false;
        this.BBox = new THREE.Box3().setFromObject(this.bus1Mesh);
    }

    animate(){
        if(this.stop){
            return;
        }

        this.BBox = new THREE.Box3().setFromObject(this.bus1Mesh);
          
        const bus1Clock = this.clock;
        let bus2Mesh = bus1Clock - 0.0001*200; 

        if(bus2Mesh < 0){
            bus2Mesh = 0;
        }

        this.clock += this.busSpeed;
        this.curve.getPointAt(bus1Clock % 1, this.busPosition[0]);
        this.curve.getPointAt(bus2Mesh % 1, this.busPosition[1]);
        this.curve.getPointAt((bus1Clock + this.busSpeed)%1, this.busTarget[0]);
        this.curve.getPointAt((bus2Mesh + this.busSpeed)%1, this.busTarget[1]);
        this.bus1Mesh.position.set(this.busPosition[0].x, 0, this.busPosition[0].y);
        this.bus2Mesh.position.set(this.busPosition[1].x, 0, this.busPosition[1].y);
        this.bus1Mesh.lookAt(this.busTarget[0].x, 0, this.busTarget[0].y);
        this.bus2Mesh.lookAt(this.busTarget[1].x, 0, this.busTarget[1].y)
    }
}