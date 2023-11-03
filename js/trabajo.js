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

import LinearMisil from './GameObjects/LinearMisil.js'
import LaserSatelit from './GameObjects/LaserSatelit.js'
import StaticLaser from './GameObjects/StaticLaser.js'
import RandomPlanet from './GameObjects/RandomPlanet.js'
import Progressor from './GameProgression/progressor.js'


// Constantes de escena

let radio_planeta = 1000
let earth_rotation = Math.PI/40

let moon_radius = 200
let moon_angular_velocity = Math.PI/30
let moon_rotation_velocity = 0
let planet_wires = 40

let ship_distance = 10000
let ship_eulers = [0,0,0]
let ship_euler_velocity = [0,0]
let ship_rotation = 0
let ship_acceleration = 50
let ship_max_velocity = 0.01

let camera_distance = [800,100,0]

let gameover = false
let gameover_delta = 0.005
let destruction_moving_tween_time = 2000


// Variables de consenso. SIEMPRE necesarias
let renderer, scene, camera
let score
let clock

//Objetos estáticos de la escena
let planet, moon, moon_geometry
let ship, ship_end
let canon

//El progresor de fases
let progressor;

//Keyboard
let keypress_W = false
let keypress_A = false
let keypress_D = false
let keypress_S = false

let keypress_W_before = false
let keypress_A_before = false
let keypress_D_before = false
let keypress_S_before = false

//Acciones

init();
loadScene();
render();

function init(){

    clock = new THREE.Clock()

    score = document.getElementById("score")
    score.innerText = 0
    //Motor de renderer
    renderer = new THREE.WebGLRenderer()
    renderer.autoClear = false
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.updateShadowMap.enabled = true
    renderer.shadowMap.enabled = true;
    renderer.antialias=true
    document.getElementById('container').appendChild(renderer.domElement) //Añadimos el canvas de THREE JS al DOM.

    //Escena
    scene = new THREE.Scene()
    scene.radio_planeta = radio_planeta
    renderer.setClearColor(new THREE.Color(0,0,0.2))

    //Camara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100000)
    camera.setRotationFromEuler(new THREE.Euler( ...ship_eulers, 'XYZ' ))
    camera.position.set(ship_distance + camera_distance[0], camera_distance[1] , camera_distance[2])
    camera.lookAt(0, 0, 0)

    //Eventos
    window.addEventListener('resize', updateAspectRatio)
    document.addEventListener('keydown', keyPressed, false)
    document.addEventListener('keyup', keyRelased, false)
}

function loadScene(){


    function createPlanetMaterial(route, shadows=false, obj={}) {

        var earthTexture = THREE.ImageUtils.loadTexture(route);
    
        var earthMaterial = null
        if(shadows){
            earthMaterial = new THREE.MeshStandardMaterial(obj)
        }
        else{
            earthMaterial = new THREE.MeshBasicMaterial();
        }
        earthMaterial.map = earthTexture;
    
        return earthMaterial;
    }


    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      '../images/2k_stars_milky_way.jpg',
      () => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        scene.background = texture;
    });



    //const default_material = new THREE.MeshBasicMaterial({color: new THREE.Color(1,0,0), wireframe: true})
    const default_material = new THREE.MeshNormalMaterial({wireframe:false, flatShading:true})
    const green_material = new THREE.MeshBasicMaterial({color: new THREE.Color(0,1,0), wireframe: true})

    let sunMaterial = createPlanetMaterial("../images/2k_sun.jpg");
    planet = new THREE.Mesh(new THREE.SphereGeometry(radio_planeta, planet_wires, planet_wires), sunMaterial)
    planet.rotateX(21/180*Math.PI)
    scene.add(planet)

    let moonMaterial = createPlanetMaterial("../images/2k_earth_daymap.jpg", true);
    moon = new THREE.Object3D()
    moon_geometry = new THREE.Mesh(new THREE.SphereGeometry(moon_radius, planet_wires, planet_wires), moonMaterial)
    moon_geometry.translateX(-ship_distance)
    moon.add(moon_geometry)
    scene.add(moon)

    const orbit_material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1 });

    const orbit = new THREE.Mesh(new THREE.TorusGeometry(ship_distance,10,10,100).rotateX(Math.PI/2), orbit_material)
    scene.add(orbit)


    //Nave espacial
    ship = new THREE.Object3D()
    ship_end = new THREE.Object3D()

    
    var model_loader = new GLTFLoader();
    model_loader.load('../models/spaceship/ufo.glb', function(gltf) {
        console.log(gltf.scene)
        let ship_geometry_rotator = new THREE.Object3D()
        let ship_geometry = gltf.scene

        ship_geometry.scale.set(30,30,30)
        ship_geometry_rotator.add(ship_geometry)
        ship_geometry_rotator.rotateZ(-Math.PI/8)

        ship_end.geometry_rotator = ship_geometry_rotator
        ship_end.geometry = ship_geometry

        ship_end.add(ship_geometry_rotator)

        ship_end.add(camera)
        ship_end.translateX(ship_distance)
        camera.position.set(camera_distance[0], camera_distance[1] , camera_distance[2])

        console.log(gltf.scene.getWorldPosition(new THREE.Vector3()))
        
        ship.add(ship_end)
        ship.setRotationFromEuler(new THREE.Euler( ...ship_eulers, 'XYZ' ))
        ship_end.setRotationFromEuler(new THREE.Euler(ship_rotation,0,0))

        scene.add(ship)
    });
    
    ship_end.gameOver = gameOver
    ship_end.ship_distance = ship_distance
    ship_end.camera_distance = camera_distance


    //Luces
    const puntuallight = new THREE.PointLight(new THREE.Color(1,0.8,0.8), 0.7, ship_distance*2)
    puntuallight.castShadow = true;
    scene.add(puntuallight)

    const ambientlight = new THREE.AmbientLight(new THREE.Color(1,1,1), 0.2)
    puntuallight.castShadow = true;
    scene.add(puntuallight)


    //Creación del progresor
    progressor = new Progressor(ship_end, scene)

    scene.camera = camera 


}

function updateAspectRatio(){
    renderer.setSize(window.innerWidth, window.innerHeight)
    const ar = window.innerWidth/window.innerHeight
    camera.aspect = ar
    camera.updateProjectionMatrix()
}

function keyPressed(event){
    let key = event.key;
    if (key == 'w'){
        keypress_W = true
    }
    if (key == 's'){
        keypress_S = true
    }
    if (key == 'a'){
        keypress_A = true
    }
    if (key == 'd'){
        keypress_D = true
    }
    
}

function keyRelased(event){
    let key = event.key;
    if (key == 'w'){
        keypress_W = false
    }
    if (key == 's'){
        keypress_S = false
    }
    if (key == 'a'){
        keypress_A = false
    }
    if (key == 'd'){
        keypress_D = false
    }
    
}


function update(){

    TWEEN.update()

    let delta = clock.getDelta()
    
    if(gameover){
        score.style.color = "red"
        delta = delta*gameover_delta
    }



    if (keypress_W && !gameover){
        ship_euler_velocity[1] = Math.min(Math.max((ship_euler_velocity[1] + Math.cos(ship_rotation)*ship_acceleration/ship_distance*delta), -ship_max_velocity), ship_max_velocity)
        ship_euler_velocity[0] = Math.min(Math.max((ship_euler_velocity[0] -Math.sin(ship_rotation)*ship_acceleration/ship_distance*delta), -ship_max_velocity), ship_max_velocity)
        //ship_end.geometry_rotator.rotation.z = -Math.PI/5
    }
    if (keypress_S && !gameover){
        ship_euler_velocity[1] -= 0.8*ship_euler_velocity[1]*delta
        ship_euler_velocity[0] -= 0.8*ship_euler_velocity[0]*delta

        if(Math.abs(ship_euler_velocity[0]) < 0.001 || Math.abs(ship_euler_velocity[1]) < 0.001){
            ship_euler_velocity[0] = 0
            ship_euler_velocity[1] = 0
        }
    }
    if (keypress_A && !gameover){
        ship_rotation+=1*delta
    }
    if (keypress_D && !gameover){
        ship_rotation-=1*delta
    }

    //Animaciones con TWEEN
    if(!gameover && !keypress_A_before && keypress_A){
        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            x: Math.PI/8
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
    if(!gameover && !keypress_D_before && keypress_D){

        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            x: -Math.PI/8
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }

    if(!gameover && (keypress_A_before || keypress_D_before) && (!keypress_A && !keypress_D)) {
        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            x: 0
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }



    if(!gameover && !keypress_W_before && keypress_W){

        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            z: Math.PI/8
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
    if(!gameover && !keypress_S_before && keypress_S){

        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            z: -Math.PI/4
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }

    if(!gameover && (keypress_W_before || keypress_S_before) && (!keypress_W && !keypress_S)) {
        new TWEEN.Tween(ship_end.geometry_rotator.rotation)
        .to({
            z: -Math.PI/8
        }, 200)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }



    ship.rotateZ(ship_euler_velocity[1])
    ship.rotateY(ship_euler_velocity[0])
    moon.rotateY(moon_angular_velocity*delta)
    moon_geometry.rotateY(moon_rotation_velocity*delta)
    planet.rotateY(earth_rotation*delta)
    ship_end.setRotationFromEuler(new THREE.Euler(ship_rotation,0,0))

    if(!gameover){
        ship_end.geometry?.rotateY(Math.PI/2 * delta)
    }

    progressor.update(delta)

    if(!gameover){
        score.innerText = Math.round(clock.elapsedTime)
    }

    keypress_A_before = keypress_A
    keypress_S_before = keypress_S
    keypress_D_before = keypress_D
    keypress_W_before = keypress_W
}

function render(){
    requestAnimationFrame(render)
    update()

    renderer.clear()
    renderer.clearDepth();

    renderer.setViewport(0,0, window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

function gameOver(){
    if (gameover){return;}

    gameover = true
    animateOnDeath(ship_end.geometry)
    document.getElementById("gameover_screen").style.display = "flex"
    document.getElementById("gameover_score").innerText = score.innerText
    document.getElementById("score").style.display = "none"
    document.getElementById("container").style.filter = "saturate(0)"
    ship_euler_velocity[0] *= gameover_delta
    ship_euler_velocity[1] *= gameover_delta
}

function animateOnDeath(geometry) {
    if (geometry.children.length == 0){
        console.log("Yes")
        geometry.position.y = 3

        new TWEEN.Tween(geometry.rotation)
        .to({
            x: (Math.random()*2-1)*Math.PI*10,
            y: (Math.random()*2-1)*Math.PI*10,
        }, 100000)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()

        new TWEEN.Tween(geometry.position)
        .to({
            x: (Math.random()*2-1)*1000,
            y: (Math.random()*2-1)*1000,
            z: (Math.random()*2-1)*1000,
        }, 1000000)
        .interpolation( TWEEN.Interpolation.Linear)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start()
    }
    else{
        geometry.children.forEach(c=>animateOnDeath(c))
    }
}