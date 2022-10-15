import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { QrScannerComponent } from "angular2-qrscanner";

@Component({
    selector: 'app-inventario-central',
    templateUrl: './scanner-inventario.component.html',
    styleUrls: ['./scanner-inventario.component.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ScannerInventarioComponent implements OnInit {

    @ViewChild(QrScannerComponent, { static: false }) qrScannerComponent: QrScannerComponent;

    constructor() { }

    ngOnInit(): void {}

    ngAfterViewInit(): void {
      
        this.qrScannerComponent.getMediaDevices().then(devices => {
          const videoDevices: MediaDeviceInfo[] = [];
          for (const device of devices) {
              if (device.kind.toString() === 'videoinput') {
                  videoDevices.push(device);
              }
          }
          if (videoDevices.length > 0){
              let choosenDev;
              for (const dev of videoDevices){
                  if (dev.label.includes('front')){
                      choosenDev = dev;
                      break;
                  }
              }
              if (choosenDev) {
                  this.qrScannerComponent.chooseCamera.next(choosenDev);
              } else {
                  this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
              }
          }
        });
    
        this.qrScannerComponent.capturedQr.subscribe(result => {
            console.log(result);
        });
    }

}
    