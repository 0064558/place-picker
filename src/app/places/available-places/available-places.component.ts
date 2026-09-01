import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  // Sinal para armazenar os lugares disponíveis. Inicialmente, está indefinido.
  places = signal<Place[] | undefined>(undefined);

  isFetching = signal<boolean>(false); // Sinal para indicar se os dados estão sendo buscados. Inicialmente, é falso.

  // injetando o HttpClient para fazer requisições HTTP.
  constructor(private httpClient: HttpClient) {}

  // injetando o DestroyRef para gerenciar a destruição do componente e evitar vazamentos de memória.
  private destroyRef = inject(DestroyRef);

  // O método ngOnInit é chamado quando o componente é inicializado. 
  // Aqui, ele faz uma requisição HTTP para obter os lugares disponíveis.
  ngOnInit(): void {
    this.isFetching.set(true); // Indicando que a busca de dados começou.
    const subscription = this.httpClient
          .get<{ places: Place[]}>('http://localhost:3000/places') // Fazendo uma requisição GET para o endpoint '/places' do servidor local.
          .pipe( // Usando o operador 'map' para transformar os dados recebidos da requisição.
            map((data) => data.places)
          )
          .subscribe({ // Inscrevendo-se para receber os dados da requisição.
            next: (places) => { // Quando os dados são recebidos com sucesso, este bloco é executado.
              this.places.set(places); // Atualizando o sinal 'places' com os dados recebidos.
            },
            complete: () => {
              this.isFetching.set(false); // Indicando que a busca de dados terminou.
            }
          });

          // Registrando uma função de limpeza que será chamada quando o componente for destruído.
          this.destroyRef.onDestroy(() => {
            subscription.unsubscribe();
          });
  }



}
