import * as THREE from '../../lib/three.module.js'

export default class RandomPlanet {

    static first_phase_time = 0 //Invisibles
    static second_phase_time = 3    //Van apareciendo
    static third_phase_time = 3.1
    static final_phase_time = 4

    constructor(ship, eulers, scene, instanciables, first_phase_time = 0, second_phase_time = 0.5, third_phase_time = 10.5,final_phase_time = 12){
        this.ship = ship
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship.ship_distance
        this.camera_distance = ship.camera_distance[0]
        this.radio_planeta = scene.radio_planeta

        this.first_phase_time = first_phase_time
        this.second_phase_time = second_phase_time
        this.third_phase_time = third_phase_time
        this.final_phase_time = final_phase_time
        

        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        //this.geometry = new THREE.Mesh(new THREE.TorusGeometry(200, 100, 10, 30), new THREE.MeshNormalMaterial())

        this.planet_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide})
        this.orbit_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide})

        this.planet = new THREE.Mesh(new THREE.SphereGeometry(this.radio_planeta, 40, 40), this.planet_material)
        this.orbit = new THREE.Mesh(new THREE.TorusGeometry(this.ship_distance,40,10,100).rotateX(Math.PI/2), this.orbit_material)
        
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

        if(this.planet.getWorldPosition(new THREE.Vector3()).distanceTo(this.ship.getWorldPosition(new THREE.Vector3())) < this.radio_planeta){
            this.ship.gameOver()
        }

        //Update alive animation
        this.alive+=delta

        if (this.alive < this.first_phase_time){

        }
        else if (this.alive < this.second_phase_time){
            //max opacity = 0.1
            this.laser_material.opacity = (this.alive -  this.first_phase_time)/(this.second_phase_time)*0.1
            
        }
        else if (this.alive < this.third_phase_time){
            //Activate laser
            this.laser_material.opacity = 1
            if(this.ship_collision_point.getWorldPosition(new THREE.Vector3()).distanceTo(this.ship.getWorldPosition(new THREE.Vector3())) < 400){
                this.ship.gameOver()
            }
        }
        else if (this.alive < this.final_phase_time){
            this.laser_material.opacity = Math.max(this.final_phase_time-this.alive,0)/(this.final_phase_time - this.third_phase_time)
        }
        else{
            this.opacity=0.1
            const indiceObjetoAEliminar = this.instanciables.indexOf(this);

            if (indiceObjetoAEliminar !== -1) {
                this.instanciables.splice(indiceObjetoAEliminar, 1);
            }        
            this.center.remove(this.laser)   
            this.scene.remove( this.laser )
            this.scene.remove( this.center )
        }
    }
}