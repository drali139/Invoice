import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SplashScreen } from '@capacitor/splash-screen';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet,],
})
export class AppComponent {

  constructor() {
    this.initializeApp();
  }
  initializeApp() {
    setTimeout(() => {
      SplashScreen.hide();
    }, 5000); 
  }
}
