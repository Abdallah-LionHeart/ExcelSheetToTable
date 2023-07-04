import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-time-calculate',
  templateUrl: './time-calculate.component.html',
  styleUrls: ['./time-calculate.component.css']
})
export class TimeCalculateComponent implements OnInit {


  startDate!: string;
  endDate!: string;
  hoursInput!: number;
  includeEndDate!: boolean;
  totalWeek!: number;
  totalDays!: number;
  totalHours!: number;
  totalMinutes!: number;
  hoursPerDay!: string;
  hoursPerWeek!: string;
  DisplayStartDate!: string;
  DisplayEndDate!: string;




  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }



  calculatePeriod() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diff = Math.abs(end.getTime() - start.getTime());

    this.totalWeek = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    this.totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    this.totalHours = Math.floor(diff / (1000 * 60 * 60));
    this.totalMinutes = Math.floor(diff / (1000 * 60));
    this.DisplayStartDate = this.formatDate(start);
    this.DisplayEndDate = this.formatDate(end);

    if (!this.hoursInput) {
      // Default condition
      const defaultHoursPerDay = Math.floor(this.totalMinutes / (this.totalDays * 60));
      const defaultHoursPerWeek = Math.floor(this.totalMinutes / ((this.totalWeek + 1) * 60 * 24));
      this.hoursPerDay = this.getTimeFormatted(defaultHoursPerDay);
      this.hoursPerWeek = this.getTimeFormatted(defaultHoursPerWeek);
    } else {
      // User input condition
      const userInputHoursPerDay = Math.floor(this.hoursInput / this.totalDays);
      const userInputHoursPerWeek = Math.floor(this.hoursInput / (this.totalWeek + 1));
      this.hoursPerDay = this.getTimeFormatted(userInputHoursPerDay);
      this.hoursPerWeek = this.getTimeFormatted(userInputHoursPerWeek);
    }

    if (!this.includeEndDate) {
      this.totalDays--;
    }
  }

  getTimeFormatted(time: number): string {
    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);
    return `${this.padNumber(hours)}:${this.padNumber(minutes)}`;
  }
  formatDate(date: Date): string {
    const day = date.toLocaleDateString('en', { weekday: 'long' });
    const month = date.toLocaleDateString('en', { month: 'numeric' });
    const year = date.getFullYear();
    return `${day}/ ${month}/${year}`;
  }


  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
