import { Observable } from "rxjs";

export const createHttpObservable = (url: string) => {
  return Observable.create((observer) => {
    const controller = new AbortController();
    const signal = controller.signal;

    fetch(url, { signal })
      .then((response) => {
        if (response.ok) {
          return response.json(); // passo al prossimo then il risultato di 'response.json()'
        } else {
          observer.error("Request failed with status: " + response.status);
        }
      })
      .then((body) => {
        observer.next(body); // per emettere un valore
        observer.complete();
      })
      .catch((err) => {
        observer.error(err);
      });

    // l'unsubscribe dell'observable triggherà la funzione qua sotto:
    return () => controller.abort();
  });
};
