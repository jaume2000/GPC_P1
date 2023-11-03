
import * as THREE from '../../lib/three.module.js'
import LinearMisil from '../GameObjects/LinearMisil.js'
import LaserSatelit from '../GameObjects/LaserSatelit.js'
import StaticLaser from '../GameObjects/StaticLaser.js'
import RandomPlanet from '../GameObjects/RandomPlanet.js'
import { TWEEN } from '../../lib/tween.module.min.js'


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

        if(this.currentPhase.elapsed_time > this.currentPhase.data.duration){
            this.currentPhase.end(this.currentPhase.data)
            this.currentPhase_index = ++this.currentPhase_index % this.phases.length
            this.currentPhase = this.phases[this.currentPhase_index]
            this.currentPhase.restart()
            this.currentPhase.start(this.currentPhase.data)
        }
        this.currentPhase.update(delta)
        
        this.instances.forEach(i=>i.update(delta))
    }

    definePhases() {

        //Primera fase
        this.phases.push(new Phase({
            duration: 15,
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
        }))
        

        //Segunda fase
        this.phases.push(new Phase({
            duration: 15,
            spawn_amount: 10,
            spawn_time: 0.1,
            counter: 0
        },
        (data)=>(delta)=>{
            if(data.counter>data.spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
                }
                data.counter = 0
            }
            data.counter+=delta
        }))

        //Tercera fase
        this.phases.push(new Phase({
            duration: 10,
            spawn_time: 0.1,
            counter: 0,
            elapsed_time: 0
        },
        (data)=>(delta)=>{
            if(data.counter>data.spawn_time){
                let start_wait = Math.max(3-data.elapsed_time, 0)
                new StaticLaser(this.player, this.player.parent.rotation, this.scene, this.instances, 0, 0.1 +start_wait, 0.5+start_wait, 5)
                data.counter = 0
            }
            data.counter+=delta
            data.elapsed_time+=delta
        }))

        //Cuarta fase
        this.phases.push(new Phase({
            duration: 30,
            spawn_amount: 1,
            spawn_time: 2,
            elapsed_time: 0,
            counter: 0,
        },
        (data)=>(delta)=>{
            if(data.counter>data.spawn_time && data.duration - data.elapsed_time > 6){
                for(let i=0; i<data.spawn_amount; i++){
                    new RandomPlanet(this.player, this.randEuler(), this.scene, this.instances, 1, 3, data.duration - data.elapsed_time-2, data.duration - data.elapsed_time-0.5)
                }
                data.counter = 0
            }

            data.counter+=delta
            data.elapsed_time+=delta

        },
        (_)=>{
            new TWEEN.Tween(this.scene.camera.position)
            .to({
                x: this.player.camera_distance[0]*5
            }, 500)
            .interpolation( TWEEN.Interpolation.Linear)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()
        }
        ))
        
        //Quinta Fase
        this.phases.push(new Phase({
            duration: 30,
            spawn_amount: 1,
            focus_player: true,
            spawn_time: 0.1,
            counter: 0,

            misil_counter: 0,
            misil_spawn_amount: 10,
            misil_spawn_time: 0.1,

            planet_spawn_amount: 10,

            player_laser_counter: 4,
            player_laser_time: 4,

            elapsed_time: 0
        },
        (data)=>(delta)=>{

            if(data.elapsed_time == 0){
                for(let i=0; i<data.planet_spawn_amount; i++){
                    new RandomPlanet(this.player, this.randEuler(), this.scene, this.instances, 1, 3, data.duration -3, data.duration -0.5)
                }
            }

            if(data.counter>data.spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new StaticLaser(this.player, this.randEuler(), this.scene, this.instances, 0, 0.1, 1, 1.5)
                }
                

                data.counter = 0
            }

            if(data.player_laser_counter>data.player_laser_time){
                let start_wait = Math.max(0, 1-data.elapsed_time)
                new StaticLaser(this.player, this.player.parent.rotation, this.scene, this.instances, 0, 2.5, 3, 3.5)
                data.player_laser_counter = 0
            }

            if(data.misil_counter>data.misil_spawn_time){
                for(let i=0; i<data.spawn_amount; i++){
                    new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
                }
                data.misil_counter = 0
            }
       
            data.counter+=delta
            data.player_laser_counter+=delta
            data.misil_counter+=delta
            data.elapsed_time+=delta

            //new LinearMisil(this.player, this.randEuler(), 10000, this.scene, this.instances, this.player.ship_distance, this.player.camera_distance, this.scene.radio_planeta)
        },
        (_)=>{},
        (data)=>{
            data.misil_counter=0
            data.elapsed_time=0
                
            new TWEEN.Tween(this.scene.camera.position)
            .to({
                x: this.player.camera_distance[0]
            }, 500)
            .interpolation( TWEEN.Interpolation.Linear)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()

        }))
    }

}

class Phase{

    constructor(data, updatefunc, start=(_)=>{}, end=(_)=>{}){
        this.data = data
        this.elapsed_time = 0
        this.start = start
        this.end = end

        this.clousuredUpdateFunc = updatefunc(data)

        this.update = (delta)=>{
            this.elapsed_time+=delta
            this.clousuredUpdateFunc(delta)
        }
    }

    restart(){
        this.data.counter=0
        this.data.elapsed_time=0
        this.elapsed_time=0
    }

}

export default Progressor