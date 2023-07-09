import { Component, OnInit } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-csv-upload',
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.css']
})
export class CsvUploadComponent implements OnInit {

  allPatients: Patient[] = [];
  patients: Patient[] = [];

  searchQuery = '';
  searchQueryChanged = new Subject<string>();

  constructor() {
    this.searchQueryChanged.pipe(debounceTime(500)).subscribe(() => {
      if (this.searchQuery) {

        this.patients = this.allPatients.filter(p =>
          p.id.toLowerCase().includes(this.searchQuery)
          || p.patientName.toLowerCase().includes(this.searchQuery)
          || p.visits.some(v =>
            v.assignmentId.toLowerCase().includes(this.searchQuery)
            || v.caregiverName.toLowerCase().includes(this.searchQuery)
            || v.contractName.toLowerCase().includes(this.searchQuery)
            || v.coordinatorName.toLowerCase().includes(this.searchQuery)
          )
        )
      } else {
        this.patients = this.allPatients;
      }

    });

  }

  ngOnInit(): void {
  }

  changed() {
    this.searchQueryChanged.next('');
  }



  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.readFile(file);
  }

  readFile(file: File) {
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const contents: string = e.target.result;


      this.parseCSV(contents);
    };
    reader.readAsText(file);
  }

  parseCSV(contents: string) {
    let rows: any[] = contents.split('\n');
    rows.shift();
    rows.shift();
    rows.shift();
    rows.shift();
    rows = rows.map(x => x.split(','));
    rows = rows.map(x => ({
      id: x[0],
      patientId: x[1],
      patientName: x[2],
      coordinatorName: x[3],
      contractName: x[4],
      caregiverName: x[5],
      assignmentId: x[6],
      date: x[7],
      visitScheduled: x[8],
      actualVisit: x[9],
      billed: x[10],
    } as Row))

    let result = rows.reduce(function (r, a) {
      r[a.patientId] = r[a.patientId] || [];
      r[a.patientId].push(a);
      return r;
    }, Object.create(null));

    this.patients = [];

    for (var prop in result) {
      if (Object.prototype.hasOwnProperty.call(result, prop)) {
        if (prop == '' || prop == 'undefined') {

        } else {
          let group = result[prop];
          let patient: Patient = {
            id: prop,
            patientName: '',
            visits: this.getVisits(group),
            scheduledHours: 0,
            billableHours: 0,
          }
          patient.patientName = patient.visits[0]?.patientName;
          patient.scheduledHours = patient.visits.map(x => x.visitScheduledHourDiffrence).reduce((partialSum, a) => partialSum + a, 0);
          patient.billableHours = patient.visits
            .filter(x => x.validation.missedOut == false && x.validation.missedIn == false && x.billed == false)
            .map(x => x.actualVisitHourDiffrence)
            .reduce((partialSum, a) => partialSum + a, 0);

          this.patients.push(patient);

        }
      }
    }

    this.allPatients = this.patients;

    console.log(this.patients);

  }

  getVisits(rows: Row[]): Visit[] {

    let visits: Visit[] = [];

    rows.forEach(x => {
      let date = new Date(x.date);
      let visitScheduledStart = this.getStartTime(new Date(date), x.visitScheduled);
      let visitScheduledEnd = this.getEndTime(new Date(date), x.visitScheduled, visitScheduledStart);
      let visitScheduledHourDiffrence = this.getTimeDiffrenceInHours(visitScheduledStart, visitScheduledEnd);
      let actualVisitStart = this.getStartTime(new Date(date), x.actualVisit);
      let actualVisitEnd = this.getEndTime(new Date(date), x.actualVisit, actualVisitStart);
      let actualVisitHourDiffrence = this.getActualVisitTimeDiffrenceInHours(actualVisitStart, actualVisitEnd, new Date(visitScheduledStart as Date), new Date(visitScheduledEnd as Date));

      let visit: Visit = {
        id: x.id,
        patientId: x.patientId,
        patientName: x.patientName,
        caregiverName: x.caregiverName,
        assignmentId: x.assignmentId,
        billed: x.billed.toLowerCase().includes('yes') ? true : false,
        contractName: x.contractName,
        coordinatorName: x.coordinatorName,
        date: date,
        actualVisitStart: actualVisitStart,
        actualVisitEnd: actualVisitEnd,
        actualVisitHourDiffrence: actualVisitHourDiffrence,
        visitScheduledStart: visitScheduledStart,
        visitScheduledEnd: visitScheduledEnd,
        visitScheduledHourDiffrence: visitScheduledHourDiffrence,
        notes: [],
        validation: {
          earlyIn: 0,
          earlyOut: 0,
          lateIn: 0,
          lateOut: 0,
          missedIn: false,
          missedOut: false,
          color: ''
        }
      }
      this.getNotes(visit);
      visits.push(visit);

    });

    return visits;

  }

  getStartTime(date: Date, time: string): Date | undefined {
    let array = time.split('-');
    let value = array[0];
    if (value && value != '' || value != null && value.length == 4) {
      date.setHours(parseInt(value.slice(0, 2)));
      date.setMinutes(parseInt(value.slice(2, 4)));
      return date;
    } else {
      return undefined;
    }
  }

  getEndTime(date: Date, time: string, start?: Date): Date | undefined {
    let array = time.split('-');
    let value = array[1];
    if (value && value != '' || value != null && value.length == 4) {
      date.setHours(parseInt(value.slice(0, 2)));
      date.setMinutes(parseInt(value.slice(2, 4)));
      if (start && start > date) {
        date.setDate(date.getDate() + 1)
      }
      return date;
    } else {
      return undefined;
    }
  }

  getTimeDiffrenceInHours(start: Date | undefined, end: Date | undefined): number {
    if (start && end && end > start) {
      return ((end as any) - (start as any)) / 3600000;
    }
    return 0;
  }
  // !
  getActualVisitTimeDiffrenceInHours(actualStart: Date | undefined, actualEnd: Date | undefined, scheduledStart: Date | undefined, scheduledEnd: Date | undefined): number {
    let quarters = 0;
    if (actualStart && scheduledStart) {
      let startDifInMinutes = ((actualStart as any) - (scheduledStart as any)) / 60000;

      if (startDifInMinutes <= 5) {
      } else if (startDifInMinutes > 5) {
        quarters = Math.ceil(startDifInMinutes / 15);
      }
    }


    if (quarters > 0) {
      let date = scheduledStart as Date;
      scheduledStart?.setMinutes(quarters * 15);
    }

    if (scheduledStart && scheduledEnd && scheduledEnd > scheduledStart) {
      let value = ((scheduledEnd as any) - (scheduledStart as any)) / 3600000;
      return value;
    }
    return 0;
  }
  // !

  getTimeDiffrenceInMinutes(start: Date | undefined, end?: Date): number {
    if (start && end) {
      let value = ((start as any) - (end as any)) / 60000;
      console.log(value);
      return value;

    }
    return 0;
  }


  getNotes(visit: Visit) {

    let notes: string[] = [];
    let validation: Validation = {
      earlyIn: 0,
      earlyOut: 0,
      lateIn: 0,
      lateOut: 0,
      missedIn: false,
      missedOut: false,
      color: ''
    }
    if (visit.billed) {
      notes.push('Already billed');
    }


    if (!visit.actualVisitStart) {
      validation.missedIn = true;
      notes.push('Missed in');
    }
    if (!visit.actualVisitEnd) {
      validation.missedOut = true;
      notes.push('Missed out');
    }

    if (visit.actualVisitStart && visit.actualVisitEnd) {

      let startTimeDiff = this.getTimeDiffrenceInMinutes(new Date(visit.visitScheduledStart as Date), new Date(visit.actualVisitStart as Date));
      if (startTimeDiff > 0) {
        validation.earlyIn = startTimeDiff;
        notes.push('Early in by ' + startTimeDiff + ' Min.');

      } else if (startTimeDiff < 0) {
        validation.lateIn = startTimeDiff;
        notes.push('Late in by ' + startTimeDiff + ' Min.');
      };

      let endTimeDiff = this.getTimeDiffrenceInMinutes(visit.visitScheduledEnd, visit.actualVisitEnd);
      if (endTimeDiff > 0) {
        validation.earlyOut = endTimeDiff;
        notes.push('Early out by ' + endTimeDiff + ' Min.');

      } else if (endTimeDiff < 0) {
        validation.lateOut = endTimeDiff;
        notes.push('Late out by ' + Math.abs(endTimeDiff) + ' Min.');

      };

    }

    if (visit.billed) {
      validation.color = 'green';
    } else if (validation.missedIn || validation.missedOut) {
      validation.color = 'red';
    } else if (validation.earlyIn) {
      validation.color = 'lightgreen';
    } else if (validation.lateOut) {
      validation.color = 'gold';
    } else if (validation.earlyOut || validation.lateIn) {
      validation.color = 'gold';
    } else if (validation.missedOut) {
      validation.color = 'orange';
    }



    visit.validation = validation;
    visit.notes = notes;


  }


  downloadFile() {
    let link = document.createElement("a");
    link.download = "sample-file";
    link.href = "assets/files/sample-file.csv";
    link.click();
  }


}

export interface Row {
  id: string;
  patientId: string;
  patientName: string;
  coordinatorName: string;
  contractName: string;
  caregiverName: string;
  assignmentId: string;
  date: string;
  visitScheduled: string;
  actualVisit: string;
  billed: string;
}



export interface Patient {
  id: string;
  patientName: string;
  scheduledHours: number;
  billableHours: number;
  visits: Visit[];
}



export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  coordinatorName: string;
  contractName: string;
  caregiverName: string;
  assignmentId: string;
  date: Date;
  visitScheduledStart: Date | undefined;
  visitScheduledEnd: Date | undefined;
  visitScheduledHourDiffrence: number;
  actualVisitStart: Date | undefined;
  actualVisitEnd?: Date | undefined;
  actualVisitHourDiffrence: number;
  notes: string[];
  billed: boolean;
  validation: Validation;
}

export interface Validation {
  lateIn: number;
  lateOut: number;
  earlyIn: number;
  earlyOut: number;
  missedIn: boolean;
  missedOut: boolean;
  color: string;
}

