import * as THREE from '../../lib/three.module.js'

export default class LinearMisil {
    constructor(ship, eulers, velocity, scene, instanciables, ship_distance, camera_distance, radio_planeta){
        this.ship = ship
        this.velocity = velocity
        this.scene = scene
        this.instanciables = instanciables
        this.ship_distance = ship_distance
        this.camera_distance = camera_distance[0]


        //this.geometry = new THREE.Mesh(new THREE.SphereGeometry(50,50,planet_wires,planet_wires), new THREE.MeshBasicMaterial())
        this.center = new THREE.Object3D()
        this.material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity:1})
        this.geometry = new THREE.Mesh(new THREE.BoxGeometry(50,50,50), this.material)
        this.ship_collider = new THREE.Object3D()
        this.ship_collider.translateX(ship_distance)

        this.center.add(this.ship_collider)
        this.center.add(this.geometry)
        this.center.setRotationFromEuler(eulers)
        this.scene.add(this.center)
        this.position = radio_planeta
        this.geometry.translateX(this.position)

        instanciables.push(this)
    }

    update(delta){
        
        /*
        this.geometry.scale.x = (this.position/ship_distance)*10
        this.geometry.scale.y = (this.position/ship_distance)*10
        this.geometry.scale.z = (this.position/ship_distance)*10
        */
            
        //Ha llegado al límite, desespawnear.
        if(this.position > this.ship_distance + this.camera_distance){
            
            const indiceObjetoAEliminar = this.instanciables.indexOf(this);

            if (indiceObjetoAEliminar !== -1) {
                this.instanciables.splice(indiceObjetoAEliminar, 1);
            }        
            this.center.remove(this.geometry)   
            this.scene.remove( this.geometry )
            this.scene.remove( this.center )

            

        }
        else{
            this.position+=this.velocity*delta
            this.geometry.position.set(this.position,0,0)
            this.geometry.scale.x = this.position/25

            if(this.position > this.ship_distance*0.75){
                this.material.opacity = (this.ship_distance + this.camera_distance - this.position) / ( this.ship_distance*0.25 +this.camera_distance)
            }

            if(this.position >= this.ship_distance/2 && this.ship_collider.getWorldPosition(new THREE.Vector3()).distanceTo(this.ship.getWorldPosition(new THREE.Vector3())) < 25){
                this.ship.gameOver()
            }
        }
    }
}