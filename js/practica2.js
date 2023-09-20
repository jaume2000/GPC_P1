/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from "../lib/GLTFLoader.module.js"

// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let robot;

//Acciones

init();
loadScene();
render();

window.onresize = (e) =>{
    camera.aspect = window.innerWidth/window.innerHeight
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function init(){

    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement) //Añadimos el canvas de THREE JS al DOM.

    //Escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0,0,0.2)

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000)
    camera.position.set(150, 200, 150)
    camera.lookAt(0, 100, 0)
}

function loadScene(){
    const red_material = new THREE.MeshBasicMaterial({color: new THREE.Color(1,0,0), wireframe: true})
    const green_material = new THREE.MeshBasicMaterial({color: new THREE.Color(0,1,0), wireframe: true})
    robot = new THREE.Object3D()

    //Suelo
    const suelo = new THREE.Mesh(new THREE.PlaneGeometry(400,400, 10,10),red_material)
    suelo.rotateX(-Math.PI/2)
    scene.add(suelo)

    //Base del robot
    const base_robot = new THREE.Mesh( new THREE.CylinderGeometry(50,50,15, 50), red_material)
    robot.add(base_robot)

    //Brazo Completo
    const brazo_completo = new THREE.Object3D()
    //Brazo
    const brazo = new THREE.Object3D()
    const brazo_base = new THREE.Mesh( new THREE.CylinderGeometry(20,20,18, 50), red_material)
    brazo_base.rotateX(-Math.PI/2)
    brazo.add(brazo_base)

    const brazo_medio = new THREE.Mesh( new THREE.BoxGeometry(18,120,12), red_material)
    brazo_medio.position.set(0,60,0)
    brazo.add(brazo_medio)
    
    const brazo_fin = new THREE.Mesh( new THREE.SphereGeometry(20,8,8), red_material)
    brazo_fin.position.set(0,120,0)
    brazo.add(brazo_fin)

    //Antebrazo
    const antebrazo = new THREE.Object3D()
    antebrazo.position.set(0,120,0)

    const antebrazo_base = new THREE.Mesh( new THREE.CylinderGeometry(22,22, 6, 30), red_material)
    antebrazo.add(antebrazo_base)

    const separation = 10;
    const antebrazo_col1 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), red_material)
    antebrazo_col1.position.set(separation,40,separation)
    antebrazo.add(antebrazo_col1)
    const antebrazo_col2 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), red_material)
    antebrazo_col2.position.set(-separation,40,separation)
    antebrazo.add(antebrazo_col2)
    const antebrazo_col3 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), red_material)
    antebrazo_col3.position.set(separation,40,-separation)
    antebrazo.add(antebrazo_col3)
    const antebrazo_col4 = new THREE.Mesh( new THREE.BoxGeometry(4,80,4), red_material)
    antebrazo_col4.position.set(-separation,40,-separation)
    antebrazo.add(antebrazo_col4)

    const antebrazo_fin_container = new THREE.Object3D()

    const antebrazo_fin = new THREE.Mesh( new THREE.CylinderGeometry(15,15, 40, 30), red_material)
    antebrazo_fin.rotateX(-Math.PI/2)
    antebrazo_fin_container.position.set(0,80,0)
    antebrazo_fin_container.add(antebrazo_fin)
    antebrazo.add(antebrazo_fin_container)

    //Pinzas
    const geometry_R = new THREE.BufferGeometry()
    const positions_R = new Float32Array([
        0,0,0,  // 0
        0,0,19, // 1
        4,2,38, // 2
        4,18,38, // 3
        0,20,19, // 4
        0,20,0,  // 5

        4,0,0,  // 6
        4,0,19, // 7
        4,2,38, // 8
        4,18,38, // 9
        4,20,19, // 10
        4,20,0,  // 11
    ])

    const geometry_L = new THREE.BufferGeometry()
    const positions_L = new Float32Array([
        0,0,0,  // 0
        0,0,19, // 1
        0,2,38, // 2
        0,18,38, // 3
        0,20,19, // 4
        0,20,0,  // 5

        4,0,0,  // 6
        4,0,19, // 7
        2,2,38, // 8
        2,18,38, // 9
        4,20,19, // 10
        4,20,0,  // 11
    ])

    const indexes = [0,4,1, 0,5,4, 1,3,2, 1,4,3,
        6,10,7, 6,11,10, 7,9,8, 7,10,9,
        0,1,6, 6,1,7, 1,2,7, 2,8,7,
        2,3,8,
        0,11,5,
        3,4,10, 3,10,9, 4,5,11, 4,11,10
    ]

    geometry_R.setAttribute('position', new THREE.BufferAttribute(positions_R, 3))
    geometry_R.setIndex(indexes)
    geometry_L.setAttribute('position', new THREE.BufferAttribute(positions_L, 3))
    geometry_L.setIndex(indexes)
    const pinza_R = new THREE.Mesh(geometry_R, red_material)
    const pinza_L = new THREE.Mesh(geometry_L, red_material)
    pinza_R.rotateY(Math.PI/2)
    pinza_L.rotateY(Math.PI/2)
    pinza_R.position.set(5,-10,10)
    pinza_L.position.set(5,-10,-10)
    antebrazo_fin_container.add(pinza_R)
    antebrazo_fin_container.add(pinza_L)

    brazo.add(antebrazo)

    brazo_completo.add(brazo)

    robot.add(brazo)
    robot.add(new THREE.AxesHelper(50))

    robot.position.set(0,7.5,0)
    scene.add(robot)

}

function update(){
    robot.rotateY(0.01)
}

function render(){
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}