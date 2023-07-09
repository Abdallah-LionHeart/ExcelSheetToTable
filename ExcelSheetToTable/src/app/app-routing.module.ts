import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CsvUploadComponent } from './csv-upload/csv-upload.component';
import { TimeCalculateComponent } from './time-calculate/time-calculate.component';



const routes: Routes = [
  { path: '', component: CsvUploadComponent },
  { path: 'import', component: CsvUploadComponent },
  { path: 'calculator', component: TimeCalculateComponent },

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
