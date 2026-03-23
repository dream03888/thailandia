import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

interface Excursion {
  city: string;
  name: string;
  validDays: string;
  supplierName: string;
  description: string;
}

@Component({
  selector: 'app-excursions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './excursions.html',
  styleUrl: './excursions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcursionsComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  excursionsList = signal<Excursion[]>([
    { 
      city: 'Krabi', 
      name: 'Full Day Phi Phi Islands', 
      validDays: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', 
      supplierName: 'Fantasia Asia Travel Service', 
      description: '08:00 - 08:30: Prelievo dall\'hotel e trasferimento al porto di Nopparat Thara. Check-in, incontro con la guida locale e partenza per una fantastica escursione' 
    },
    { 
      city: 'Bangkok', 
      name: 'Railway Market & Damnoensaduak Floating Market With ISG', 
      validDays: 'Mon, Wed, Fri, Sun', 
      supplierName: 'VeraThailandia', 
      description: 'Appuntamento presso la reception dell\'hotel e partenza al mattino presto verso il sud-ovest del paese fino a raggiungere la piccola stazione ferroviaria di Ban Kalong, dove a bordo del treno locale si raggiunge la stazione di Mae Klong (1/2 ora circa), famosa per il leggendario mercato sui binari. L\'aspetto interessante del tragitto è sia all\'interno del treno per osservare i passeggeri composti da lavoratori, studenti, monaci, famiglie, contadini che salgono e scendono dalle piccole stazioncine con le merci e sia all\'esterno, con il paesaggio rurale e le numerose saline in cui l\'estrazione del sale per evaporazione viene effettuata con metodi tradizionali. Arrivo alla piccola stazione di Mae Klong presso la quale i venditori spostano rapidamente la merce dai binari al passaggio del treno e passeggiata nel mercato per scattare altre fotografie fino alla ri-partenza del treno dove tutte le merci vengono nuovamente spostate per far passare il convoglio. Proseguimento per una casa tipica thailandese per assistere a tutti i processi di lavorazione dello zucchero estratto dalle palme da cocco e partenza per Damnoen Saduak, dove si trova il mercato galleggiante piu\' famoso della Thailandia. Arrivo al molo ed imbarco su una barca a remi, attraverso un fitto reticolo di canali, per incontrare i venditori ambulanti intenti nelle loro attivita\' quotidiane, con le loro barche colme di frutta, verdura, the\', pesce, carne, cibo preparato al momento e souvenir.' 
    },
    { 
      city: 'Bangkok', 
      name: 'The Bangkoker With ISG', 
      validDays: 'Tue, Thu, Sat', 
      supplierName: 'VeraThailandia', 
      description: 'Incontro con la guida locale presso il molo di Sathorn, punto strategico facilmente raggiungibile grazie alla stazione della metropolitana sopraelevata BTS di' 
    },
    { 
      city: 'Bangkok', 
      name: 'Temples, Flowers & Flavors With ISG', 
      validDays: 'All Days', 
      supplierName: 'VeraThailandia', 
      description: 'Incontro con la guida locale presso il molo di Sathorn, punto strategico facilmente raggiungibile grazie alla stazione della metropolitana sopraelevata BTS di' 
    },
    { 
      city: 'Bangkok', 
      name: 'Tradition And Modernity: Flower Market, Chinatown, Talat Noi & IconSiam With ISG', 
      validDays: 'All Days', 
      supplierName: 'VeraThailandia', 
      description: 'Appuntamento nel pomeriggio presso un meeting point ed accompagnati da una guida locale, partenza con la metropolitana sotterranea MRT fino a' 
    }
  ]);

  filteredExcursions = signal<Excursion[]>(this.excursionsList());

  filterExcursions(query: string) {
    const q = query.toLowerCase();
    this.filteredExcursions.set(
      this.excursionsList().filter(a => 
        a.name.toLowerCase().includes(q) || 
        a.city.toLowerCase().includes(q) ||
        a.supplierName.toLowerCase().includes(q)
      )
    );
  }

  deleteExcursion(name: string) {
    if (confirm(`Delete excursion: ${name}?`)) {
      alert('Deleted (demo)');
    }
  }
}
