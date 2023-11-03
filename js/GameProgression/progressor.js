
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
        this.phases = []
            
        this.definePhases()

        this.currentPhase_index = 0
        this.currentPhase = this.phases[this.currentPhase_index]
    }
     
    randEuler(){
        return new THREE.Euler(Math.random()*Math.PI*2,Math.random()*Math.PI*2,Math.random()*Math.PI*2)
    }

    update(delta){

        if(this.currentPhase.elapsedTime > this.currentPhase.data.duration){
            this.currentPhase_index = ++this.currentPhase_index % this.phases.length
            this.currentPhase = this.phases[this.currentPhase_index]
            this.currentPhase.restart()
        }
        this.currentPhase.update(delta)
        
        this.instances.forEach(i=>i.update(delta))
    }

    definePhases() {

        //Primera fase
        this.phases.push(new Phase({
            duration: 2,
            spawn_amount: 30,
            focus_player: false,
            spawn_time: 2,
            counter: 0
        },
        (data)=>(delta)=>{

            if(data.counter>data.spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new StaticLaser(this.player, this.randEuler(), this.scene, this.instances)
                }
                if(data.focus_player){
                    new StaticLaser(this.player, this.player.parent.rotation, this.scene, this.instances)
                }

                data.counter = 0
            }
            data.counter+=delta

            //new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
        },this.instances))

        //Segunda fase
        this.phases.push(new Phase({
            duration: 2,
            spawn_time: 0.5,
            counter: 0
        },
        (data)=>(delta)=>{
            console.log("Phase 2")
            if(data.counter>data.spawn_time){
                new StaticLaser(this.player, this.player.parent.rotation, this.scene, this.instances, 0, 0.2, 0.5, 5)
                data.counter = 0
            }
            data.counter+=delta
        }))

        //Tercera fase
        this.phases.push(new Phase({
            duration: 2,
            spawn_amount: 10,
            spawn_time: 0.1,
            counter: 0
        },
        (data)=>(delta)=>{
            console.log("Phase 2")
            if(data.counter>data.spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
                }
                data.counter = 0
            }
            data.counter+=delta
        }))

        //Cuarta fase
        this.phases.push(new Phase({
            duration: 10,
            spawn_amount: 10,
            spawn_time: 0.1,
            counter: 0
        },
        (data)=>(delta)=>{
            console.log("Phase 2")
            if(data.counter>data.spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new RandomPlanet(this.player, this.randEuler(), this.scene, this.instances)
                }
                data.counter = 0
            }
            data.counter+=delta
        }))
    }

}

class Phase{

    constructor(data, updatefunc){
        this.data = data
        this.elapsedTime = 0

        this.clousuredUpdateFunc = updatefunc(data)

        this.update = (delta)=>{
            this.elapsedTime+=delta
            this.clousuredUpdateFunc(delta)
        }
    }

    restart(){
        console.log("restarting")
        this.data.counter=0
        this.elapsedTime=0
    }

}

export default Progressor