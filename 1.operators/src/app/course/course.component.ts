import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap,
  delay,
  map,
  concatMap,
  switchMap,
  withLatestFrom,
  concatAll,
  shareReplay,
} from "rxjs/operators";
import { merge, fromEvent, Observable, concat } from "rxjs";
import { Lesson } from "../model/lesson";
import { createHttpObservable } from "../common/util";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  courseId: string;
  course$: Observable<Course>;
  lessons$: Observable<Lesson[]>;

  @ViewChild("searchInput", { static: true }) input: ElementRef;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.params["id"];
    // In questo caso il subscribe è fatto direttamente nel codice html con: | async
    this.course$ = createHttpObservable(`/api/courses/${this.courseId}`);
  }

  ngAfterViewInit_test1() {
    const searchLessons$ = fromEvent<any>(
      this.input.nativeElement,
      "keyup"
    ).pipe(
      map((event) => event.target.value),
      /**
       * i: emettiamo il valore dell'observer solo se per
       * i: 200ms non viene emesso aclun altro valore da questo observer
       */
      debounceTime(200),
      /**
       * i: se il valore che emetteremmo è uguale al precedente allora
       * i: non emettiamo nulla
       */
      distinctUntilChanged(),
      /**
       * i: se 'loadLessons' non ha terminato lo interropo e lo faccio ripartire con il nuovo valore 'search'
       */
      switchMap((search) => this.loadLessons(search))
    );

    const initialLessons$ = this.loadLessons();

    // In questo caso il subscribe è fatto direttamente nel codice html con: | async
    this.lessons$ = concat(initialLessons$, searchLessons$);
  }

  ngAfterViewInit() {
    this.lessons$ = fromEvent<any>(this.input.nativeElement, "keyup").pipe(
      map((event) => event.target.value),
      startWith(""),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((search) => this.loadLessons(search))
    );
  }

  loadLessons(search = ""): Observable<Lesson[]> {
    return createHttpObservable(
      `api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`
    ).pipe(map((res) => res["payload"]));
  }
}
