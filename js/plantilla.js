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
let esferaCubo;

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
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.set(0.5, 2, 7)
    camera.lookAt(0, 1, 0)
}

function loadScene(){
    
}

function update(){
}

function render(){
    requestAnimationFrame(render)
    update()
    renderer.render(scene, camera)
}