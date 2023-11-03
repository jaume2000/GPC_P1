
import * as THREE from '../../lib/three.module.js'
import LinearMisil from '../GameObjects/LinearMisil.js'
import LaserSatelit from '../GameObjects/LaserSatelit.js'
import StaticLaser from '../GameObjects/StaticLaser.js'
import RandomPlanet from '../GameObjects/RandomPlanet.js'


class Progressor{

    constructor(player, scene){
        this.player = player
        this.scene = scene
        this.instances = []

        this.phaseA = new Phase(()=>{
            new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
        },this.instances)
    }
     
    randEuler(){
        return new THREE.Euler(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2)
    }

    update(delta){

        this.phaseA.update(delta)
        
        this.instances.forEach(i=>i.update(delta))
    }

}

class Phase{

    constructor(updatefunc){
        this.update = updatefunc

    }

}

export default Progressor