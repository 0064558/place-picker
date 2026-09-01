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
      // pipe é usado para encadear operadores que transformam os dados da requisição antes de serem consumidos.
      .pipe(tap({
        next: (userPlaces) => this.userPlaces.set(userPlaces),
      }));
  }

  addPlaceToUserPlaces(place: Place) {

    // Atualizando o sinal 'userPlaces' com o novo lugar selecionado.
    const prevPlaces = this.userPlaces();


    // Verificando se o lugar selecionado já está na lista de lugares do usuário. Se não estiver, ele é adicionado.
    if (!prevPlaces.some((p) => p.id === place.id)) {
      // isso atualiza o sinal 'userPlaces' com uma nova lista que inclui o lugar selecionado, mantendo os lugares anteriores.
      this.userPlaces.set([...prevPlaces, place]);
    }

    // Fazendo uma requisição PUT para o endpoint '/user-places' do servidor local, enviando o ID do lugar selecionado.
    return this.httpClient.put('http://localhost:3000/user-places', { placeId: place.id })
      .pipe(catchError(error => {
        this.userPlaces.set(prevPlaces); // Revertendo a atualização do sinal 'userPlaces' em caso de erro.
        return throwError(() => new Error('Failed to store selected place.'));
      }))
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
