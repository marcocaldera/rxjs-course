import * as Rx from 'rxjs'

var observable = Rx.Observable.create((observer: any) => {
	try {
		observer.next('Ciaooo')
		observer.next('Come stai')
		setInterval(() => {
			observer.next('Ogni tanto compaio')
		}, 2000)

		// observer.complete() // ? per completare l'esecuzione e lanciare la callback di complete
		// observer.next(
		// 	'Questo non viene inviato perchè è dopo il comando "complete"'
		// )
	} catch (err) {
		observer.error(err)
	}
})

// Subscribe ad un observer
var observer = observable.subscribe(
	(x: any) => addItem(x),
	(error: any) => addItem(error),
	() => addItem('Completed')
)

var observer2 = observable.subscribe((x: any) => addItem(x))

observer.add(observer2) // in questo modo i due observer sono collegati
setTimeout(() => {
	observer.unsubscribe()
}, 6001)

function addItem(val: any) {
	var node = document.createElement('li')
	var textnode = document.createTextNode(val)
	node.appendChild(textnode)
	document.getElementById('output').appendChild(node)
}
