import { Component } from '@angular/core';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial/ngx';
import { AlertController, LoadingController } from '@ionic/angular';
import { DataService, Message } from '../services/data.service';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  devices:any[] = [];


  constructor(private bluetoothSerial: BluetoothSerial,
    public alertController: AlertController,
    private loadingCtrl: LoadingController,
    private androidPermissions: AndroidPermissions) {
    this.presentAlert("Home Loaded");
    
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.BLUETOOTH).then(
      result => console.log('Has permission?',result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.BLUETOOTH)
    );
    
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN, this.androidPermissions.PERMISSION.BLUETOOTH_ADVERTISE,this.androidPermissions.PERMISSION.BLUETOOTH_CONNECT]);
    

    
    if(this.bluetoothSerial.isEnabled){
      this.getdevices();

    }else{
      this.presentAlert("Bluettoth not enabled");
    }
  }

  async presentAlert(msg) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alert',
      subHeader: 'Subtitle',
      message: msg,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  refresh(ev) {
    setTimeout(() => {
      this.getdevices();
      ev.detail.complete();
    }, 3000);
  }

  connect(item){
    this.bluetoothSerial.connect(item.address).subscribe((isConnected) => {
      this.presentAlert(isConnected);
    },(err) => {
      this.presentAlert(err);
    })
  }

  async getdevices(){
    let loading = await this.loadingCtrl.create({
      message: "Loading devices..."
    })
    await loading.present();

   this.bluetoothSerial.list().then(async (devices) => {
    this.devices = devices;
    this.presentAlert("device success")
    await loading.dismiss();
    console.log(devices);
    
   }).catch(async(err) => {
    console.log(err);
    await loading.dismiss();

    
   this.presentAlert("device error");
   })
  }

}
