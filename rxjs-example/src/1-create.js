import { Observable, of, interval, fromEvent, from, asyncScheduler } from 'rxjs'

const basic = Observable.create((observer) => {
	observer.next('A')
	observer.next('B')
	observer.complete()
	observer.next('C')
})

// basic.subscribe(console.log);

// metodo veloce per creare un observable
const hello = of('hello')
hello.subscribe(console.log)

// stampa riga per riga
const world = from('world', asyncScheduler)
world.subscribe(console.log)

// observer che attende un evento
const event = fromEvent(document, 'click')
event.subscribe(console.log)

// observer basato su un intervallo
const periodic = interval(500)
periodic.subscribe(console.log)
