import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimeCalculateComponent } from './time-calculate/time-calculate.component';



const routes: Routes = [
  { path: 'time-calculate', component: TimeCalculateComponent },

]



@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
})
export class AppRoutingModule { }
