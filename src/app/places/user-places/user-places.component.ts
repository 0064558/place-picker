import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  places = signal<Place[] | undefined>(undefined);

  // injetando o HttpClient para fazer requisições HTTP.
  constructor(private httpClient: HttpClient) { }

  // injetando o DestroyRef para gerenciar a destruição do componente e evitar vazamentos de memória.
  private destroyRef = inject(DestroyRef);

  // Sinal para indicar se os dados estão sendo buscados. Inicialmente, é falso.
  isFetching = signal<boolean>(false);

  // Sinal para armazenar mensagens de erro. Inicialmente, é nulo.
  error = signal<string | null>(null);

  // O método ngOnInit é chamado quando o componente é inicializado. 
  // Aqui, ele faz uma requisição HTTP para obter os lugares disponíveis.
  ngOnInit(): void {
    this.isFetching.set(true); // Indicando que a busca de dados começou.
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/user-places') // Fazendo uma requisição GET para o endpoint '/places' do servidor local.
      // Pipe é usado para encadear operadores que transformam os dados da requisição antes de serem consumidos.
      .pipe(
        // Usando o operador 'map' para transformar os dados recebidos da requisição.
        map((data) => data.places),
        // Usando o operador 'catchError' para tratar erros na requisição.
        catchError((error) => {
          console.log(error);
          return throwError(() => new Error('Failed to fetch favorite places. Please try again later.'))
        })
      )
      .subscribe({ // Inscrevendo-se para receber os dados da requisição.
        next: (places) => { // Quando os dados são recebidos com sucesso, este bloco é executado.
          this.places.set(places); // Atualizando o sinal 'places' com os dados recebidos.
        },
        // O bloco 'complete' é chamado quando a requisição é concluída, independentemente de ter sido bem-sucedida ou não.
        complete: () => {
          this.isFetching.set(false); // Indicando que a busca de dados terminou.
        },
        // O bloco 'error' é chamado se ocorrer um erro durante a requisição.
        error: (error: Error) => {
          this.error.set(error.message); // Atualizando o sinal 'error' com a mensagem de erro recebida.
          this.isFetching.set(false); // Indicando que a busca de dados terminou, mesmo que tenha ocorrido um erro.
        },
      });

    // Registrando uma função de limpeza que será chamada quando o componente for destruído.
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }
}
