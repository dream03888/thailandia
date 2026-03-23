import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { AssistanceFeeModalComponent } from '../../../core/components/modals/assistance-fee-modal/assistance-fee-modal';

interface Agent {
  name: string;
  markup: string;
  email: string;
  tel: string;
  address: string;
  assistanceFeeEnabled: boolean;
  feeAmount: number;
}

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, RouterModule, AssistanceFeeModalComponent],
  templateUrl: './agents.html',
  styleUrl: './agents.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentsComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  agentsList = signal<Agent[]>([
    { name:'Adamantis Viaggi',     markup:'TO Gold',  email:'info@verathailandia.com',  tel:'+390564850060', address:'Via Buonarroti 16 58015 Orbetello ITALY', assistanceFeeEnabled:true, feeAmount:1000 },
    { name:'Asian Trails Thailand',markup:'Local DMC',email:'beppe@verathailandia.com', tel:'+6628202193',   address:'183, 8/F Regent House, Rajdamri Road, Lumpini, Pathumwan, Bangkok 10330', assistanceFeeEnabled:false, feeAmount:1000 },
    { name:'Easy Smile Asia',      markup:'Local DMC',email:'beppe@verathailandia.com', tel:'029662900',     address:'1/14-15 Supalai Park Tower 3, Chatuchak, Bangkok, 10900 Thailand', assistanceFeeEnabled:false, feeAmount:1000 },
    { name:'Italia nel Mondo',     markup:'TO Gold',  email:'info@verathailandia.com',  tel:'+39022345678',  address:'Via Roma 12, 20100 Milan, Italy',           assistanceFeeEnabled:true, feeAmount:2000 },
    { name:'Kiwi Travel NZ',       markup:'TO Gold',  email:'kiwi@verathailandia.com',  tel:'+6498765432',   address:'12 Queen St, Auckland 1010, New Zealand',  assistanceFeeEnabled:false, feeAmount:1000 },
    { name:'Bangkok Connect',      markup:'Local DMC',email:'bkk@verathailandia.com',   tel:'+6621234567',   address:'99 Sukhumvit Rd, Watthana, Bangkok 10110', assistanceFeeEnabled:true, feeAmount:1500 },
    { name:'Vera Thailandia Online',markup:'System',  email:'vtadmin@verathailandia.com',tel:'+6621000001',  address:'Bangkok, Thailand',                        assistanceFeeEnabled:true, feeAmount:1000 },
  ]);

  filteredAgents = signal<Agent[]>(this.agentsList());

  isFeeModalOpen = signal(false);
  activeAgentForFee = signal<Agent | null>(null);

  filterAgents(query: string) {
    const q = query.toLowerCase();
    this.filteredAgents.set(
      this.agentsList().filter(a => a.name.toLowerCase().includes(q))
    );
  }

  openFeeModal(agent: Agent) {
    this.activeAgentForFee.set(agent);
    this.isFeeModalOpen.set(true);
  }

  closeFeeModal() {
    this.isFeeModalOpen.set(false);
    this.activeAgentForFee.set(null);
  }

  handleFeeSave(data: { enabled: boolean, amount: number }) {
    const agent = this.activeAgentForFee();
    if (agent) {
      // Update in local state (simulating API call)
      const updatedAgents = this.agentsList().map(a => {
        if (a.name === agent.name) {
          return { ...a, assistanceFeeEnabled: data.enabled, feeAmount: data.amount };
        }
        return a;
      });
      this.agentsList.set(updatedAgents);
      this.filteredAgents.set(updatedAgents);
    }
    this.closeFeeModal();
  }

  deleteAgent(name: string) {
    if (confirm(`Delete agent: ${name}?`)) {
      alert('Deleted (demo)');
    }
  }
}
