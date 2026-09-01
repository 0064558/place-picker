import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { catchError, map, throwError } from 'rxjs';
import { PlacesService } from '../places.service';

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

  // injetando o PlacesService para fazer requisições relacionadas a lugares.
  constructor(private placeService: PlacesService) { }

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
    const subscription = this.placeService.loadAvailablePlaces().subscribe({ // Inscrevendo-se para receber os dados da requisição.
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

  // O método onSelectPlace é chamado quando um lugar é selecionado. 
  // Ele faz uma requisição PUT para atualizar o lugar selecionado no servidor.
  onSelectPlace(place: Place) {
    const subscription = this.placeService.addPlaceToUserPlaces(place.id).subscribe({
      // O bloco 'next' é chamado quando a requisição PUT é bem-sucedida.
      next: (data) => console.log('Place selected successfully:', data),
    });

    // Registrando uma função de limpeza que será chamada quando o componente for destruído.
    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }

}
