import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { HotelApiService } from '../../../core/services/api/hotel-api.service';
import { AddCityModalComponent } from '../../../core/components/modals/add-city-modal/add-city-modal';
import { AddHotelContactModalComponent } from '../../../core/components/modals/add-hotel-contact-modal/add-hotel-contact-modal';
import { AddHotelRoomModalComponent } from '../../../core/components/modals/add-hotel-room-modal/add-hotel-room-modal';
import { AddHotelPromoModalComponent } from '../../../core/components/modals/add-hotel-promo-modal/add-hotel-promo-modal';

@Component({
  selector: 'app-add-hotel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddCityModalComponent, AddHotelContactModalComponent, AddHotelRoomModalComponent, AddHotelPromoModalComponent],
  templateUrl: './add-hotel.html',
  styleUrl: './add-hotel.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddHotelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  private hotelApiService = inject(HotelApiService);
  private route = inject(ActivatedRoute);
  public t = this.translationService.translations;

  hotelId = signal<string | null>(null);

  hotelForm = this.fb.group({
    country: ['Thailand', Validators.required],
    city: ['', Validators.required],
    hotelName: ['', Validators.required],
    hotelAddress: ['', Validators.required],
    earlyCheckIn: [0],
    lateCheckOut: [0],
    christmasDinner: [''],
    newYearDinner: [''],
    notes: ['']
  });

  contactsList = signal<any[]>([]);
  roomTypesList = signal<any[]>([]);
  promotionsList = signal<any[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.hotelId.set(id);
      this.hotelApiService.getHotel(id).subscribe(hotel => {
        this.hotelForm.patchValue({
          hotelName: hotel.name,
          city: hotel.city,
          notes: hotel.notes,
          hotelAddress: hotel.address
        });
      });
    }
  }

  goBack() {
    this.location.back();
  }

  saveHotel() {
    if (this.hotelForm.valid) {
      const hotelData = {
        name: this.hotelForm.value.hotelName,
        city: this.hotelForm.value.city,
        notes: this.hotelForm.value.notes,
        address: this.hotelForm.value.hotelAddress,
      };

      const request = this.hotelId() 
        ? this.hotelApiService.updateHotel(this.hotelId()!, hotelData)
        : this.hotelApiService.createHotel(hotelData);

      request.subscribe({
        next: () => {
          this.goBack();
        },
        error: (err: any) => {
          console.error('Error saving hotel:', err);
          alert('Failed to save hotel');
        }
      });
    } else {
      this.hotelForm.markAllAsTouched();
    }
  }

  // Modals state
  isCityModalOpen = signal(false);
  isContactModalOpen = signal(false);
  isRoomModalOpen = signal(false);
  isPromoModalOpen = signal(false);

  selectedContact = signal<any | null>(null);
  selectedRoom = signal<any | null>(null);
  selectedPromo = signal<any | null>(null);
  
  handleSaveCity(cityName: string) {
    if (cityName) {
      this.hotelForm.patchValue({ city: cityName });
    }
    this.isCityModalOpen.set(false);
  }

  // Contact Handlers
  openContactModal(contact: any | null = null, index: number | null = null) {
    if (contact && index !== null) {
      this.selectedContact.set({ ...contact, id: index });
    } else {
      this.selectedContact.set(null);
    }
    this.isContactModalOpen.set(true);
  }

  handleSaveContact(data: any) {
    this.contactsList.update(list => {
      const newList = [...list];
      if (data.id !== undefined && data.id !== null) {
        newList[data.id] = data;
      } else {
        newList.push(data);
      }
      return newList;
    });
    this.isContactModalOpen.set(false);
  }

  removeContact(index: number) {
    if (confirm('Are you sure you want to remove this contact?')) {
      this.contactsList.update(list => list.filter((_, i) => i !== index));
    }
  }

  // Room Handlers
  openRoomModal(room: any | null = null, index: number | null = null) {
    if (room && index !== null) {
      this.selectedRoom.set({ ...room, id: index });
    } else {
      this.selectedRoom.set(null);
    }
    this.isRoomModalOpen.set(true);
  }

  handleSaveRoom(data: any) {
    this.roomTypesList.update(list => {
      const newList = [...list];
      if (data.id !== undefined && data.id !== null) {
        newList[data.id] = data;
      } else {
        newList.push(data);
      }
      return newList;
    });
    this.isRoomModalOpen.set(false);
  }

  removeRoom(index: number) {
    if (confirm('Are you sure you want to remove this room type?')) {
      this.roomTypesList.update(list => list.filter((_, i) => i !== index));
    }
  }

  duplicateRoom(index: number) {
    this.roomTypesList.update(list => {
      const copy = { ...list[index] };
      delete copy['id'];
      return [...list, copy];
    });
  }

  // Promotion Handlers
  openPromoModal(promo: any | null = null, index: number | null = null) {
    if (promo && index !== null) {
      this.selectedPromo.set({ ...promo, id: index });
    } else {
      this.selectedPromo.set(null);
    }
    this.isPromoModalOpen.set(true);
  }

  handleSavePromo(data: any) {
    this.promotionsList.update(list => {
      const newList = [...list];
      if (data.id !== undefined && data.id !== null) {
        newList[data.id] = data;
      } else {
        newList.push(data);
      }
      return newList;
    });
    this.isPromoModalOpen.set(false);
  }

  removePromo(index: number) {
    if (confirm('Are you sure you want to remove this promotion?')) {
      this.promotionsList.update(list => list.filter((_, i) => i !== index));
    }
  }
}
