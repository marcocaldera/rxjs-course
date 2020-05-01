import { Component, OnInit } from "@angular/core";
import { Course } from "../model/course";
import { interval, Observable, of, timer, noop, throwError } from "rxjs";
import {
  catchError,
  delayWhen,
  map,
  retryWhen,
  shareReplay,
  tap,
  finalize,
  retry,
} from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  beginnerCourses$: Observable<Course[]>;
  advancedCourses$: Observable<Course[]>;

  constructor() {}

  ngOnInit_test1() {
    const http$ = createHttpObservable("/api/courses");
    const courses$: Observable<Course[]> = http$.pipe(
      tap(() => console.log("Ciaoo")),
      map((res) => Object.values(res["payload"])),
      // in questo modo il risultato di questo observable
      // viene utilizzato da tutti quelli che fanno uso dello stesso observable (e non ognuno fa ripartire tutto da capo tutto l'observer)
      shareReplay(),
      /**
       * i: dobbiamo provvedere ad utilizzare un observable alternativo che possa continuare
       * i: il flusso di esecuzione se il primo observer ha lanciato un errore
       */
      // catchError((err) => of([])) // in caso di errore restituiamo un array vuoto [] (oppure qualche dammy data)
      /**
       * i: se volessimo invece gestire l'errore in loco:
       */
      catchError((err) => {
        console.log(err);
        /**
         * i: ricordiamoci che dobbiamo sempre restituire un observable
         * i: in questo caso restituiamo un observable che semplicemente lancia l'errore è completa l'esecuzione
         */
        return throwError(err);
      }),
      /**
       * i: Funzione che vinee chiamata quando l'observable completa l'esecuzione
       * i: oppure quando lancia un errore (serve sostanzialmente per fare qualche operazione finale)
       */
      finalize(() => {
        console.log("Executed");
      })
    );

    // In questo caso il subscribe è fatto direttamente nel codice html con: | async
    this.beginnerCourses$ = courses$.pipe(
      map((courses) => courses.filter((v) => v.category === "BEGINNER"))
    );

    // In questo caso il subscribe è fatto direttamente nel codice html con: | async
    this.advancedCourses$ = courses$.pipe(
      map((courses) => courses.filter((v) => v.category === "ADVANCED"))
    );
  }

  ngOnInit() {
    const http$ = createHttpObservable("/api/courses");
    const courses$: Observable<Course[]> = http$.pipe(
      tap(() => console.log("Ciaoo")),
      map((res) => Object.values(res["payload"])),
      shareReplay(),
      // riprova ad eseguire tutto l'observer (quindi la chiamata alle api) dopo 2 secondi fino a quando viene eseguita correttamente
      retryWhen((errors) => {
        return errors.pipe(delayWhen(() => timer(2000)));
      })
    );

    this.beginnerCourses$ = courses$.pipe(
      map((courses) => courses.filter((v) => v.category === "BEGINNER"))
    );

    this.advancedCourses$ = courses$.pipe(
      map((courses) => courses.filter((v) => v.category === "ADVANCED"))
    );
  }
}
