import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import {
  concat,
  fromEvent,
  interval,
  noop,
  observable,
  Observable,
  of,
  timer,
  merge,
  Subject,
  BehaviorSubject,
  AsyncSubject,
  ReplaySubject,
} from "rxjs";
import { delayWhen, filter, map, take, timeout } from "rxjs/operators";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "about",
  templateUrl: "./about.component.html",
  styleUrls: ["./about.component.css"],
})
export class AboutComponent implements OnInit {
  ngOnInit() {
    // ogni obsever subscriber riceve tutta la storia del subject
    // const subject = new ReplaySubject();

    // ogni observer subscriber riceve solo i valori emessi di quando si iscrive in aventi
    // const subject = new BehaviorSubject();

    // ogni observer subscriber riceve solo l'ultimo valore emesso dopo la "complete" (che è quindi obbligatoria)
    const subject = new AsyncSubject();
    const series$ = subject.asObservable();

    series$.subscribe((val) => console.log("First sub: ", val));

    subject.next(1);
    subject.next(2);
    subject.next(3);

    // subject.complete(); // required for async subject

    setTimeout(() => {
      series$.subscribe((val) => console.log("Second sub: ", val));
      subject.next(4);
    }, 3000);
  }
}
