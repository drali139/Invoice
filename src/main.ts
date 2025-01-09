import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withHashLocation, } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular,  } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline,menuOutline,create,chevronForward,chevronUp,chevronDown,closeCircleOutline, beerOutline, logoGoogle,trashOutline,removeOutline,alarmOutline, arrowForwardOutline, logoFacebook, add, searchOutline, notificationsOutline, cameraOutline, ellipsisVerticalOutline, heartOutline, chatbubbleEllipsesOutline, paperPlaneOutline, bookmarkOutline, addOutline,returnDownForwardOutline, homeOutline, layersOutline, personOutline, arrowBackCircleOutline, heart, trendingDownSharp, returnDownForwardSharp, logoSnapchat, ellipsisHorizontalOutline, personAddOutline, chevronDownOutline, listOutline, lockClosedOutline, eyeOutline, cartOutline, optionsOutline, clipboardOutline, chatboxOutline, pizzaOutline, iceCreamOutline, cafeOutline, fastFoodOutline, starOutline,checkmarkCircle, locationOutline, star, callOutline, chatbubbleOutline, heartCircleOutline, chevronForwardOutline, pencilOutline, timeOutline, cardOutline, informationCircleOutline, logOutOutline, documentTextOutline, downloadOutline, refreshOutline, removeCircleOutline, addCircleOutline, } from 'ionicons/icons';
import { IonHeader,IonMenu, IonToolbar, IonTitle, IonContent, IonButton, IonBadge, IonList, IonItem, IonLabel, IonAlert, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonCardHeader, IonThumbnail, IonCheckbox, IonDatetime, IonIcon, IonCol, IonRow, IonGrid, IonMenuButton,  IonTabButton, IonTabBar, IonTabs, IonModal, IonButtons, IonInput, IonFabButton, IonFabList, IonInfiniteScrollContent, IonInfiniteScroll, IonAvatar, IonTextarea, IonNote, IonToggle, IonText, IonRange, IonSelectOption, IonSelect, IonFab,} from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { HashLocationStrategy } from '@angular/common';
addIcons({
  'remove-circle-outline' : removeCircleOutline,
  'add-circle-outline' : addCircleOutline,
  'document-text-outline': documentTextOutline,
  'download-outline': downloadOutline,
  'refresh-outline': refreshOutline,
  'beer-outline': beerOutline,
  'arrow-back-outline': arrowBackOutline,
  'logo-google': logoGoogle, 
  'create':create,
  'menu':menuOutline,
  'chevron-up':chevronUp,
  'chevron-down':chevronDown,
  'close':closeCircleOutline,
  'chevron':chevronForward,
  'remove-outline':removeOutline,
  'alarm-outline':alarmOutline,
  'trash-outline':trashOutline,
  'arrow-forward-outline': arrowForwardOutline, 
  'logo-facebook': logoFacebook,
  'add' : add,
  'search-outline': searchOutline,
  'notifications-outline':notificationsOutline,
  'camera-outline': cameraOutline,
  'ellipsis-vertical-outline':ellipsisVerticalOutline,
  'heart-outline': heartOutline,
  'chatbubble-ellipses-outline':chatbubbleEllipsesOutline,
  'paper-plane-outline': paperPlaneOutline,
  'bookmark-outline' :bookmarkOutline,
  'add-outline': addOutline,
  'return-down-forward-outline':returnDownForwardOutline,
  'home-outline':homeOutline,
  'layers-outline':layersOutline,
  'person-outline':personOutline,
  'arrow-back-circle-outline':arrowBackCircleOutline,
  'heart': heart,
  'trending-down-sharp': trendingDownSharp,
  'return-down-forward-sharp':returnDownForwardSharp,
  'logo-snapchat': logoSnapchat,
  'ellipsis-horizontal-outline': ellipsisHorizontalOutline,
  'person-add-outline' : personAddOutline,
  'chevron-down-outline': chevronDownOutline,
  'list-outline' : listOutline,
  'lock-closed-outline' : lockClosedOutline,
  'eye-outline':eyeOutline,
   'cart-outline': cartOutline,
   'options-outline' : optionsOutline,
   'clipboard-outline' : clipboardOutline,
   'chatbox-outline' : chatboxOutline,
   'pizza-outline' : pizzaOutline,
   'ice-cream-outline' : iceCreamOutline,
   'cafe-outline' : cafeOutline,
   'fast-food-outline' : fastFoodOutline,
   'star-outline' : starOutline,
   'checkmark-circle' : checkmarkCircle,
   'location-outline' : locationOutline,
   'star' : star,
   'call-outline':callOutline,
   'chatbubble-outline' : chatbubbleOutline,
   'heart-circle-outline' : heartCircleOutline,
   'chevron-forward-outline' : chevronForwardOutline,
   'pencil-outline' : pencilOutline,
   'time-outline' : timeOutline,
   'card-outline' : cardOutline,
   'information-circle-outline' : informationCircleOutline,
   'log-out-outline' : logOutOutline,
})




bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
   
    provideIonicAngular(),
    provideRouter(routes , withHashLocation()),
    
],
});