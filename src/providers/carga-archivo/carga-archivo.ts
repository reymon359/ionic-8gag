import { Injectable } from '@angular/core';

import { ToastController } from 'ionic-angular';

import { AngularFireDatabase } from '@angular/fire/database';
// import * as firebase from 'firebase';
import * as firebase from 'firebase/app';

import "rxjs/add/operator/map";

@Injectable()
export class CargaArchivoProvider {

  imagenes: ArchivoSubir[] = [];
  lastKey: string = null;
  constructor(public toastCtrl: ToastController, public afDB: AngularFireDatabase) {

    // en el momento que se cargue la aplicacion y se inyecte este servicio llamo a cargar el ultimo post
    this.cargarUltimoKey()
      // ahora me tengo que subscribir por si se cargan posts
      //y una vez tengo la ultima imagen procedo a cargar las ultimas 4
      // .subscribe(() => {
      //   this.cargarImagenes();
      // });
      // esto es lo mismo que lo de arriba
      .subscribe(() => this.cargarImagenes())
  }
  private cargarUltimoKey() { //privada porque solo se debe llamar una vez cuanso el sercicio es inizializado
    // voy a estar atento al ultimo post cargado a mi coleccion de posts en firebase.
    return this.afDB.list('/post', ref => ref.orderByKey().limitToLast(1))
      .valueChanges()
      .map((post: any) => {//aqui ya tengo el ultimo post como un array
        console.log(post);
        this.lastKey = post[0].key
        this.imagenes.push(post[0]);
      })
  }

  cargarImagenes() {
    return new Promise((resolve, reject) => {
      this.afDB.list('/post',//listar los posts de firebase
        ref => ref.limitToLast(3)//los 3 ultimos
          .orderByKey()//ordenarlos por la key
          .endAt(this.lastKey)//acabar en el lastKey qye obtenemos arriba en cargarUltimoKey
      ).valueChanges()//devuelve un observable para estar pendiente de los cambios
        .subscribe((posts: any) => {//me subscibo al observable. me va a devolver un arreglo de posts
          //aqui ovtenemos todso los registros
          posts.pop();//me devuelve tambien la ultima imagen que ya teniamos guardada asi que para que no salga duplicada la borro.
          if (posts.length == 0) {//si no devuelve posts es porque ya no hay mas
            console.log('Ya no hay mas registros');
            resolve(false);//esto es para decir a la promesa que ya no hay mas imagenes
            return;
          }
          this.lastKey = posts[0].key;
          // ahora voy a meter los posts en el array de imagenes(posts en verdad) que mostrare luego en home
          for (let i = posts.length - 1; i >= 0; i--) {
            let post = posts[i];
            this.imagenes.push(post);
          }
          resolve(true); //aqui le digo a la promesa que pueden haber mas imagenes.
        })


    });

  }





  cargarImagenFirebase(archivo: ArchivoSubir) {
    let promesa = new Promise((resolve, reject) => {
      this.mostrarToast('Cargando...');
      //primero hacemos una referencia al storage de nuestro firebase
      let storeRef = firebase.storage().ref();
      //ahora necesito un nombre para el archivo. vamos a ponerle la fecha
      let nombreArchivo: string = new Date().valueOf().toString();//234235424
      //ahora necesito de una tarea de firebase que suba el archivo y me notifique cuando termine
      let uploadTask: firebase.storage.UploadTask =
        //ahora indicamos una referencia a una carpeta de nuestras imagenes
        // la carpeta img no existe pero la crea en firebase
        storeRef.child(`img/${nombreArchivo}`)
          .putString(archivo.img, 'base64', { contentType: 'image/jpeg' });
      // el on es como un observable que me dice si el archivo se esta subiendo o se ha subido. todo eso y mas me lo dice aqui.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        // ahora vienen varios calllbacks que se llaman mediante funciones de flecha.
        // el primer callback es en el momento en que cambia algo
        () => { }, //saber el % de cuantos Mbs se han subido.
        (error) => {
          // manejo de error
          console.log("Error en la carga");
          console.log(JSON.stringify(error));
          this.mostrarToast(JSON.stringify(error));
          reject();
        },
        () => {
          //-----------------------CODIGO DE ANTES
          // Todo bien!!!
          // console.log("archivoSubido");
          // this.mostrarToast('Imagen cargada correctamente');
          // let url = uploadTask.snapshot.downloadURL;
          // this.crearPost(archivo.titulo, url, nombreArchivo);
          // resolve();
          //-----------------------CODIGO NUEVO
          console.log("archivo subido ahora obtenemos la url");
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            console.log('file avaliable at', downloadURL);
            let url = downloadURL;
            this.crearPost(archivo.titulo, url, nombreArchivo);
            resolve();
          })
        }
      )
    });
    return promesa;
  }

  crearPost(titulo: string, url: string, nombreArchivo: string) {
    console.log("entra en crearPost");
    let post: ArchivoSubir = {
      img: url,
      titulo: titulo,
      key: nombreArchivo
    }
    console.log(JSON.stringify(post));
    // de la forma de abajo lo meteria dentro de los posts pero con un id personalizado
    // this.afDB.list('/post').push(post);
    // de esta forma de abajo creamos un template literal de donde quiero insertarlo
    this.afDB.object(`/post/${nombreArchivo}`).update(post).then(() => {
      // una vez se que esta subido lo meto en el array de imagenes
      this.imagenes.push(post);
    }, (err) => {
      console.log("error al crear el post ", JSON.stringify(err));
    });
  }

  mostrarToast(mensaje: string) {
    this.toastCtrl.create({
      message: mensaje,
      duration: 2500
    }).present();
  }
}

interface ArchivoSubir {
  titulo: string;
  img: string;//la url en base64
  key?: string;
}
