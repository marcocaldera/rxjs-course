import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Course } from "../model/course";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import * as moment from "moment";
import { fromEvent } from "rxjs";
import {
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  mergeMap,
} from "rxjs/operators";
import { fromPromise } from "rxjs/internal-compatibility";

@Component({
  selector: "course-dialog",
  templateUrl: "./course-dialog.component.html",
  styleUrls: ["./course-dialog.component.css"],
})
export class CourseDialogComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  course: Course;

  @ViewChild("saveButton", { static: true }) saveButton: ElementRef;

  @ViewChild("searchInput", { static: true }) searchInput: ElementRef;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CourseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) course: Course
  ) {
    this.course = course;

    this.form = fb.group({
      description: [course.description, Validators.required],
      category: [course.category, Validators.required],
      releasedAt: [moment(), Validators.required],
      longDescription: [course.longDescription, Validators.required],
    });
  }

  ngOnInit() {
    this.form.valueChanges
      .pipe(
        // verifichiamo se andare avanti o meno
        filter(() => this.form.valid),
        /**
         * i: può essere emesso un nuovo this.saveCourse(changes) solo dopo che il precedente ha terminato l'esecuzione
         * i: quindi se l'observer 'form' emette più valori essi eseguono in ordine
         */
        concatMap((changes) => this.saveCourse(changes))
        // i: se l'observer 'form' emette più valori (next) essi vengono gestiti in parallelo
        // mergeMap((changes) => this.saveCourse(changes))
      )
      .subscribe();
  }

  saveCourse(changes) {
    return fromPromise(
      fetch(`api/courses/${this.course.id}`, {
        method: "PUT",
        body: JSON.stringify(changes),
        headers: {
          "content-type": "application/json",
        },
      })
    );
  }

  ngAfterViewInit() {
    fromEvent(this.saveButton.nativeElement, "click")
      .pipe(
        /**
         * i: se viene emesso un nuovo valore prima che exhaustMap abbia terminato
         * i: quel valore viene ignorato (i.e., viene ignorato il click e quindi non viene rilanciato saveCourse)
         */
        exhaustMap(() => this.saveCourse(this.form.value))
      )
      .subscribe();
  }

  close() {
    this.dialogRef.close();
  }
}
