import * as THREE from '../../lib/three.module.js'

export default class RandomPlanet {

    static first_phase_time = 0 //Invisibles
    static second_phase_time = 3    //Van apareciendo
    static third_phase_time = 3.1
    static final_phase_time = 4

    constructor(eulers, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]
        

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.planet_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide})
        this.orbit_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide})

        this.planet = new THREE.Mesh(new THREE.SphereGeometry(radio_planeta, 40, 40), this.planet_material)
        this.orbit = new THREE.Mesh(new THREE.TorusGeometry(ship_distance,40,10,100).rotateX(Math.PI/2), this.orbit_material)
        
        this.geometry = new THREE.Object3D()
        this.geometry.add(this.planet)
        this.center.add(this.geometry)
        this.center.add(this.orbit)
        this.center.setRotationFromEuler( eulers )

        this.planet.translateX(this.ship_distance)
        


        this.scene.add(this.center)


        this.alive = 0


        instanciables.push(this)
    }
    
    update(delta){

        this.geometry.rotateY(delta)
/*
        this.alive+=delta

        if (this.alive < RandomPlanet.first_phase_time){

        }
        else if (this.alive < RandomPlanet.second_phase_time){
            this.laser_material.opacity = (this.alive -  RandomPlanet.first_phase_time)/(RandomPlanet.second_phase_time)*0.25
            
        }
        else if (this.alive < RandomPlanet.third_phase_time){
            //Activate laser
            this.laser_material.opacity = 1
        }
        else if (this.alive < RandomPlanet.final_phase_time){
            this.laser_material.opacity = Math.max(RandomPlanet.final_phase_time-this.alive,0)/(RandomPlanet.final_phase_time - RandomPlanet.third_phase_time)
        }
        else{
            this.opacity=0.1
            const indiceObjetoAEliminar = this.instanciables.indexOf(this);

            if (indiceObjetoAEliminar !== -1) {
                this.instanciables.splice(indiceObjetoAEliminar, 1);
            }        
            this.center.remove(this.orbit)   
            this.scene.remove( this.planet )
            this.scene.remove( this.center )
        }
        */
    
    }
}