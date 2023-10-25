/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"
import {OrbitControls} from '../lib/OrbitControls.module.js'
import {TWEEN} from "../lib/tween.module.min.js"
import Stats from '../lib/stats.module.js'
import {GUI} from "../lib/lil-gui.module.min.js"


// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let suelo
let robot;
let base, brazo, antebrazo, mano, pinza_L, pinza_R;
let brazo_base, brazo_medio, rotor, antebrazo_base, antebrazo_col1, antebrazo_col2, antebrazo_col3, antebrazo_col4, antebrazo_fin
let cameraControls;

//Top camera
let topCamera
const L = 5

//Default material
let default_material

//Acciones

init();
loadScene();
render();

function init(){

    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor( new THREE.Color(0xAABBCC));
    document.getElementById('container').appendChild(renderer.domElement) //Añadimos el canvas de THREE JS al DOM.
    renderer.antialias = true
    renderer.autoClear = false

    //Escena
    scene = new THREE.Scene()
    renderer.setClearColor(new THREE.Color(0,0,0.2))

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000)
    cameraControls = new OrbitControls(camera, renderer.domElement)
    cameraControls.target.set(0,100,0)
    camera.position.set(150, 300, 150)
    camera.lookAt(0, 100, 0)

    topCamera = new THREE.OrthographicCamera(-150,150,150,-150,150,800)
    topCamera.position.set(0, 500, 0)
    topCamera.up.set(1,0,0)
    topCamera.lookAt(0,100,0)

    //Monitor

    //stats = new Stats()
    //stats.setMode(0)
    //document.getElementById('container').appendChild(stats.domElement)


    //Eventos
    window.addEventListener('resize', updateAspectRatio)
}

function loadScene(){

    //const default_material = new THREE.MeshBasicMaterial({color: new THREE.Color(1,0,0), wireframe: true})
    default_material = new THREE.MeshNormalMaterial({wireframe:false, flatShading:true})
    robot = new THREE.Object3D()

    //Suelo
    suelo = new THREE.Mesh(new THREE.PlaneGeometry(500,500, 10,10),default_material)
    suelo.rotateX(-Math.PI/2)
    suelo.receiveShadow = true
    scene.add(suelo)

    //Base del robot
    base = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15, 50), default_material)
    base.castShadow = true;
    base.receiveShadow = true;
    robot.add(base)

    //Brazo
    brazo = new THREE.Object3D()
    brazo_base = new THREE.Mesh( new THREE.CylinderGeometry(20,20,18, 50), default_material)
    brazo_base.rotateX(-Math.PI/2)
    brazo.add(brazo_base)

    brazo_medio = new THREE.Mesh( new THREE.BoxGeometry(18,120,12), default_material)
    brazo_medio.position.set(0,60,0)
    brazo.add(brazo_medio)
     
    rotor = new THREE.Mesh( new THREE.SphereGeometry(20,20,20), default_material)
    rotor.position.set(0,120,0)
    brazo.add(rotor)

    //Antebrazo
    antebrazo = new THREE.Object3D()
    antebrazo.position.set(0,120,0)
    
    antebrazo_base = new THREE.Mesh( new THREE.CylinderGeometry(22,22, 6, 30), default_material)
    antebrazo.add(antebrazo_base)

    const separation = 10;
    
    antebrazo_col1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), default_material)
    antebrazo_col1.position.set(separation,40,separation)
    antebrazo.add(antebrazo_col1)

    antebrazo_col2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), default_material)
    antebrazo_col2.position.set(-separation,40,separation)
    antebrazo.add(antebrazo_col2)

    antebrazo_col3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), default_material)
    antebrazo_col3.position.set(separation,40,-separation)
    antebrazo.add(antebrazo_col3)

    antebrazo_col4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), default_material)
    antebrazo_col4.position.set(-separation,40,-separation)
    antebrazo.add(antebrazo_col4)

    mano = new THREE.Object3D()

    //Mano
    antebrazo_fin = new THREE.Mesh( new THREE.CylinderGeometry(15,15, 40, 30), default_material)
    antebrazo_fin.rotateX(-Math.PI/2)
    mano.position.set(0,80,0)
    mano.add(antebrazo_fin)
    
    //Pinzas
    const geometry_R = new THREE.BufferGeometry()
    const positions_R = new Float32Array([
        -2,0,0,  // 0
        -2,0,19, // 1
        0,2,38, // 2
        0,18,38, // 3
        -2,20,19, // 4
        -2,20,0,  // 5

        2,0,0,  // 6
        2,0,19, // 7
        2,2,38, // 8
        2,18,38, // 9
        2,20,19, // 10
        2,20,0,  // 11
    ])

    const geometry_L = new THREE.BufferGeometry()
    const positions_L = new Float32Array([
        -2,0,0,  // 0
        -2,0,19, // 1
        -2,2,38, // 2
        -2,18,38, // 3
        -2,20,19, // 4
        -2,20,0,  // 5

        2,0,0,  // 6
        2,0,19, // 7
        0,2,38, // 8
        0,18,38, // 9
        2,20,19, // 10
        2,20,0,  // 11
    ])

    const indexes = [0,1,4, 0,4,5, 1,2,3, 1,3,4,
        6,10,7, 6,11,10, 7,9,8, 7,10,9,
        0,6,1, 6,7,1, 1,7,2, 2,7,8,
        2,8,3, 9,3,8,
        0,11,5,
        3,10,4, 3,9,10, 4,11,5, 4,10,11
    ]

    geometry_R.setAttribute('position', new THREE.BufferAttribute(positions_R, 3))
    geometry_R.setIndex(indexes)
    geometry_R.computeVertexNormals();


    geometry_L.setAttribute('position', new THREE.BufferAttribute(positions_L, 3))
    geometry_L.setIndex(indexes)
    geometry_L.computeVertexNormals();

    pinza_R = new THREE.Mesh(geometry_R, default_material)
    pinza_L = new THREE.Mesh(geometry_L, default_material)
    pinza_R.rotateY(Math.PI/2)
    pinza_L.rotateY(Math.PI/2)
    pinza_R.position.set(5,-10,10)
    pinza_L.position.set(5,-10,-10)


    mano.add(pinza_R)
    mano.add(pinza_L)

    antebrazo.add(mano)

    brazo.add(antebrazo)

    base.add(brazo)

    robot.position.set(0,7.5,0)
    scene.add(robot)

}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight)
    const ar = window.innerWidth/window.innerHeight
    camera.aspect = ar
    camera.updateProjectionMatrix()
}

function update(){

}

function render(){
    requestAnimationFrame(render)
    update()

    renderer.clear()

    renderer.setViewport(0,0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)

    renderer.setViewport(0,window.innerHeight-0.25*Math.min(window.innerHeight, window.innerWidth), 0.25*Math.min(window.innerHeight, window.innerWidth), 0.25*Math.min(window.innerHeight, window.innerWidth))
    renderer.render(scene, topCamera)
}