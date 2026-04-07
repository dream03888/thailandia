import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { HotelApiService } from '../../../core/services/api/hotel-api.service';
import { AddCityModalComponent } from '../../../core/components/modals/add-city-modal/add-city-modal';
import { AddHotelContactModalComponent } from '../../../core/components/modals/add-hotel-contact-modal/add-hotel-contact-modal';
import { AddHotelRoomModalComponent } from '../../../core/components/modals/add-hotel-room-modal/add-hotel-room-modal';
import { AddHotelPromoModalComponent } from '../../../core/components/modals/add-hotel-promo-modal/add-hotel-promo-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
  private cd = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  public t = this.translationService.translations;
  viewOnly = signal(false);

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
    const mode = this.route.snapshot.queryParamMap.get('mode');
    
    const pageId = 'cp_hotels';
    const hasAddPerm = this.authService.canAdd(pageId);
    const hasEditPerm = this.authService.canEdit(pageId);

    if (mode === 'view' || (id && !hasEditPerm)) {
      this.viewOnly.set(true);
      this.hotelForm.disable();
    }

    if (!id && !hasAddPerm) {
      this.toastService.error('You do not have permission to add new hotels');
      this.goBack();
      return;
    }

    if (id) {
      this.hotelId.set(id);
      this.hotelApiService.getHotel(id).subscribe(hotel => {
        this.hotelForm.patchValue({
          hotelName: hotel.name,
          city: hotel.city,
          notes: hotel.notes,
          hotelAddress: hotel.address,
          earlyCheckIn: hotel.fees?.early_checkin_fee || 0,
          lateCheckOut: hotel.fees?.late_checkout_fee || 0,
          christmasDinner: hotel.fees?.christmas_dinner_fee || '',
          newYearDinner: hotel.fees?.new_year_dinner_fee || ''
        });

        // Map contacts: contact_name -> name
        if (hotel.contacts) {
          this.contactsList.set(hotel.contacts.map((c: any) => ({
            name: c.contact_name || c.name || '',
            email: c.email || '',
            telephone: c.telephone || '',
            fax: c.fax || ''
          })));
        }

        // Map roomTypes: DB snake_case -> camelCase used by template/modal
        if (hotel.roomTypes) {
          this.roomTypesList.set(hotel.roomTypes.map((rt: any) => ({
            dateFrom: rt.start_date ? rt.start_date.split('T')[0] : '',
            dateTo: rt.end_date ? rt.end_date.split('T')[0] : '',
            extraBedAdult: rt.extra_bed_adult ?? 0,
            extraBedChild: rt.extra_bed_child ?? 0,
            extraBedShared: rt.extra_bed_shared ?? 0,
            foodCostAdultAbf: rt.food_adult_abf ?? 0,
            foodCostAdultLunch: rt.food_adult_lunch ?? 0,
            foodCostAdultDinner: rt.food_adult_dinner ?? 0,
            foodCostAdultAllInclusive: 0,
            foodCostChildAbf: rt.food_child_abf ?? 0,
            foodCostChildLunch: rt.food_child_lunch ?? 0,
            foodCostChildDinner: rt.food_child_dinner ?? 0,
            foodCostChildAllInclusive: 0,
            roomEntries: [{
              name: rt.name || '',
              allotment: rt.allotment ?? 0,
              cutOff: 0,
              maxCapacity: rt.allotment ?? 0,
              singlePrice: rt.single_price ?? 0,
              doublePrice: rt.double_price ?? 0
            }]
          })));
        }

        // Map promotions: DB snake_case -> camelCase used by template/modal
        if (hotel.promotions) {
          this.promotionsList.set(hotel.promotions.map((p: any) => ({
            code: p.promotion_code || '',
            name: p.name || '',
            bookingDateFrom: p.booking_date_from ? p.booking_date_from.split('T')[0] : '',
            bookingDateTo: p.booking_date_to ? p.booking_date_to.split('T')[0] : '',
            earlyBird: p.early_bird_days || null,
            minNights: p.minimum_nights || null,
            discountAmount: p.discount_amount || 0,
            discountType: p.discount_type || '%',
            validForExtraBed: p.valid_for_extra_beds || false,
            enabled: p.enabled !== false,
            freeMealsAbf: p.free_meals_abf || 0,
            freeMealsLunch: p.free_meals_lunch || 0,
            freeMealsDinner: p.free_meals_dinner || 0,
            description: p.description || ''
          })));
        }

        this.cd.markForCheck();
      });
    }
  }

  goBack() {
    this.location.back();
  }

  saveHotel() {
    if (this.hotelForm.valid) {
      // Transform contacts: camelCase -> snake_case for API
      const contactsPayload = this.contactsList().map((c: any) => ({
        contact_name: c.name || c.contact_name || '',
        email: c.email || '',
        telephone: c.telephone || '',
        fax: c.fax || ''
      }));

      // Flatten roomEntries structure -> one row per entry for API
      const roomTypesPayload = this.roomTypesList().flatMap((rt: any) => {
        const entries = rt.roomEntries && rt.roomEntries.length > 0 ? rt.roomEntries : [{}];
        return entries.map((entry: any) => ({
          name: entry.name || '',
          start_date: rt.dateFrom || '',
          end_date: rt.dateTo || '',
          allotment: entry.allotment ?? 0,
          single_price: entry.singlePrice ?? 0,
          double_price: entry.doublePrice ?? 0,
          extra_bed_adult: rt.extraBedAdult ?? 0,
          extra_bed_child: rt.extraBedChild ?? 0,
          extra_bed_shared: rt.extraBedShared ?? 0,
          food_adult_abf: rt.foodCostAdultAbf ?? 0,
          food_adult_lunch: rt.foodCostAdultLunch ?? 0,
          food_adult_dinner: rt.foodCostAdultDinner ?? 0,
          food_child_abf: rt.foodCostChildAbf ?? 0,
          food_child_lunch: rt.foodCostChildLunch ?? 0,
          food_child_dinner: rt.foodCostChildDinner ?? 0,
          currency_id: 1
        }));
      });

      // Transform promotions: camelCase -> snake_case for API
      const promotionsPayload = this.promotionsList().map((p: any) => ({
        name: p.name || '',
        promotion_code: p.code || '',
        booking_date_from: p.bookingDateFrom || null,
        booking_date_to: p.bookingDateTo || null,
        early_bird_days: p.earlyBird || null,
        minimum_nights: p.minNights || null,
        discount_amount: p.discountAmount ?? 0,
        discount_type: p.discountType || '%',
        valid_for_extra_beds: p.validForExtraBed || false,
        enabled: p.enabled !== false,
        free_meals_abf: p.freeMealsAbf ?? 0,
        free_meals_lunch: p.freeMealsLunch ?? 0,
        free_meals_dinner: p.freeMealsDinner ?? 0,
        description: p.description || ''
      }));

      const hotelData = {
        name: this.hotelForm.value.hotelName,
        city: this.hotelForm.value.city,
        notes: this.hotelForm.value.notes,
        address: this.hotelForm.value.hotelAddress,
        contacts: contactsPayload,
        roomTypes: roomTypesPayload,
        promotions: promotionsPayload,
        fees: {
          early_checkin_fee: this.hotelForm.value.earlyCheckIn,
          late_checkout_fee: this.hotelForm.value.lateCheckOut,
          christmas_dinner_fee: parseFloat(this.hotelForm.value.christmasDinner || '0'),
          new_year_dinner_fee: parseFloat(this.hotelForm.value.newYearDinner || '0')
        }
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
