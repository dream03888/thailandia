import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MarkupCalculatorService {

  /**
   * คำนวณราคาหลังบวก Markup (สำหรับ Transfer, Excursion, Tour)
   * unit: '%' = เปอร์เซ็นต์, 'flat rate' = บาทคงที่
   */
  applyMarkup(basePrice: number, unit: string | null | undefined, value: number | null | undefined): number {
    const b = Number(basePrice) || 0;
    const v = Number(value) || 0;
    if (unit === 'flat rate') {
      return b + v;
    }
    // Default: percentage
    return b * (1 + v / 100);
  }

  /**
   * คำนวณราคา Hotel ตาม Range-based markup
   * ค้นหา range ที่ basePrice อยู่ใน range นั้น แล้วบวก markup %
   */
  applyHotelMarkup(basePrice: number, ranges: any[]): number {
    const b = Number(basePrice) || 0;
    if (!ranges || ranges.length === 0) return b;

    const range = ranges.find((r: any) =>
      b >= Number(r.price_from) && b <= Number(r.price_to)
    );

    if (range) {
      return b * (1 + Number(range.markup_percentage) / 100);
    }
    // ถ้าไม่อยู่ใน range ไหนเลย ให้ใช้ range สุดท้าย
    const lastRange = ranges[ranges.length - 1];
    if (lastRange) {
      return b * (1 + Number(lastRange.markup_percentage) / 100);
    }
    return b;
  }

  /**
   * Round ราคาให้เป็นทศนิยม 2 ตำแหน่ง
   */
  round(price: number): number {
    return Math.round(price * 100) / 100;
  }
}
