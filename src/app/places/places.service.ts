import { Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);

  constructor(private httpClient: HttpClient) { }

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces() {
    return this.fetchPlaces('http://localhost:3000/places', 'Failed to fetch available places. Please try again later.');
  }

  loadUserPlaces() {
    return this.fetchPlaces('http://localhost:3000/user-places', 'Failed to fetch favorite places. Please try again later.')
    .pipe(tap({
      next: (userPlaces) => this.userPlaces.set(userPlaces),
    }));
   }

  addPlaceToUserPlaces(place: Place) {

    this.userPlaces.update(prevPlaces => [...prevPlaces, place]);

    // Fazendo uma requisição PUT para o endpoint '/user-places' do servidor local, enviando o ID do lugar selecionado.
    return this.httpClient.put('http://localhost:3000/user-places', { placeId: place.id })
    // Usando o método 'subscribe' para se inscrever e receber a resposta da requisição PUT.
  }

  removeUserPlace(place: Place) { }

  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient
      .get<{ places: Place[] }>(url) // Fazendo uma requisição GET para o endpoint '/places' do servidor local.
      // Pipe é usado para encadear operadores que transformam os dados da requisição antes de serem consumidos.
      .pipe(
        // Usando o operador 'map' para transformar os dados recebidos da requisição.
        map((data) => data.places),
        // Usando o operador 'catchError' para tratar erros na requisição.
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error(errorMessage))
        })
      )
  }
}
