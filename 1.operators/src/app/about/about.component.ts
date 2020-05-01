import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  interval,
  timer,
  fromEvent,
  Observable,
  noop,
  of,
  concat,
  merge,
} from "rxjs";
import { response } from "express";
import { createHttpObservable } from "../common/util";
import { map } from "rxjs/operators";

@Component({
  selector: "about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  constructor() {}

  /**
   * i: STREAM OF VALUE con javascript classico
   */
  ngOnInit_test0() {
    document.addEventListener("click", (evt) => {
      console.log(evt);

      setTimeout(() => {
        console.log("finisched...");

        let counter = 0;
        setInterval(() => {
          console.log(counter);
          counter++;
        }, 1000);
      }, 3000);
    });
  }

  /**
   * i: STREAM OF VALUE CON RxJS (observable)
   * i: Usiamo observer già esistenti presi dalla libreria RxJS
   */
  ngOnInit_test1() {
    // ? il $ indica che quella variabile è un observable

    // definizione di uno stream of value (definizone observable)
    const interval$ = interval(1000);

    // creazione di uno screm of value
    const sub = interval$.subscribe((val) =>
      console.log("stream interval 1 => " + val)
    );
    interval$.subscribe((val) => console.log("stream interval 2 => " + val));

    setTimeout(() => sub.unsubscribe(), 5000);

    // definizione di uno stream of value
    const timer$ = timer(3000, 1000); // wait 3 secondi e poi ripeti ogni secondo
    // creazione di uno screm of value
    timer$.subscribe((val) => console.log("stream timer 1 => " + val));

    // definizione di uno stream of value
    const click$ = fromEvent(document, "click");

    // creazione di uno screm of value
    click$.subscribe(
      (evt) => console.log(evt),
      (err) => console.log(err),
      () => console.log("completed")
    );
  }

  /**
   * i: Creiamo un nostro observable per una http request (messo dentro util.ts)
   */
  ngOnInit_test3() {
    const http$ = createHttpObservable("/api/courses");

    /**
     * i: Per creare nuovi observable partendo da quelli precedenti dobbiamo usare "pipe".
     * i: pipe ci permette di usare tutti gli operatori di rxjs per creare nuovi observable
     * i: 'map' itera sul valore emesso (next) dall http$ observable e ci fa qualcosa che decidiamo noi
     * i: (in questo caso restituisce il payload)
     */
    const courses$ = http$.pipe(map((res) => Object.values(res["payload"])));

    courses$.subscribe(
      (courses) => console.log(courses),
      noop, // corrisponde ad una empty callback () => {} in quanto ora non siamo interessati a catchare nulla:
      () => console.log("completed")
    );
  }

  ngOnInit_test4() {
    // i: of è un modo veloce per creare un observable
    // i: of(1,2,3) semplicemente emettere tre valori e poi completa l'esecuzione
    const source1$ = of(1, 2, 3);

    const source2$ = of(4, 5, 6);

    const source3$ = of(7, 8, 9);

    /**
     * i: combine
     * i: si passa all'observer successivo solo quando il precedente ha completato ('complete') l'esecuzione
     */
    const result$ = concat(source1$, source2$, source3$);

    // result$.subscribe((val) => console.log(val));
    result$.subscribe(console.log); //i: versione corta della riga di sopra
  }

  ngOnInit_test5() {
    const interval1$ = interval(1000); // emetto un valore ogni secondo
    const interval2$ = interval1$.pipe(map((val) => 10 * val));

    // i: vanno avanti insieme (in parallelo)
    const result$ = merge(interval1$, interval2$);

    result$.subscribe(console.log);
  }

  //_testObrUnsub
  ngOnInit_testObrUnsub() {
    const interval1$ = interval(1000); // viene messo un valore ogni secondo
    const sub = interval1$.subscribe(console.log);

    setTimeout(() => sub.unsubscribe(), 5000);
  }

  ngOnInit() {
    const http$ = createHttpObservable("api/courses");
    const sub = http$.subscribe(console.log);

    setTimeout(() => sub.unsubscribe(), 0);
  }
}
