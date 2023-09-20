/**
* Escena.js
* Seminario nº2 de GPC: Pintar una escena básica con transformaciones, animación y modelos importados.
* @author <jivagri@edu.upv.es>, 2023
*/

import * as THREE from '../lib/three.module.js'
import {GLTFLoader} from '../lib/GLTFLoader.js'

// Variablesde consenso. SIEMPRE necesarias
let renderer, scene, camera

//Globales propias
let esfeaCubo;
let angulo = 0;

//Acciones

init();
loadScene();
renderer();

function init(){

    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight);
        //Añadimos el canvas de THREE JS al DOM.
    document.getElementById('container').appendChild(renderer.domElement)

    //Escena
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0x00000A)

    //Camara
    camera = THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.set(0.5, 2, 7)
    camera.lookAt(0, 1, 0)
}

function loadScene(){
    const material = new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true})
    const geoCubo = new THREE.BoxGeometry(2,2,2)
    const cubo = new THREE.Mesh( geoCubo, material)
}

function update(){
    
}

function renderer(){
    requestAnimationFrame(renderer)
    update()
    renderer.render(scene, canera)
}