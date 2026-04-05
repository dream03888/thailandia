import { Injectable, inject } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@angular/common';
import { THAI_FONT_BASE64 } from './thai-font';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}

  /**
   * Generates a professional PDF for a given trip data.
   * @param trip The trip object containing all booking details.
   */
  generateTripPdf(trip: any) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Add valid Thai Font (Sarabun) to jsPDF with explicit style mappings
    doc.addFileToVFS('Sarabun-Regular.ttf', THAI_FONT_BASE64);
    doc.addFont('Sarabun-Regular.ttf', 'ThaiFont', 'normal');
    doc.addFont('Sarabun-Regular.ttf', 'ThaiFont', 'bold'); // Maps bold requests to out TTF so jsPDF doesn't fallback or corrupt
    doc.setFont('ThaiFont', 'normal'); // Set as default font


    // 1. HEADER - Thailandia Branding (Mimicked via text)
    doc.setFontSize(22); // Reduced from 28
    doc.setFont('ThaiFont', 'bold');
    doc.setTextColor(51, 51, 51); // Dark Grey
    doc.text('Vera', margin, 20);

    
    doc.setTextColor(255, 140, 0); // Primary Orange
    const veraWidth = doc.getTextWidth('Vera');
    doc.text('Thailandia', margin + veraWidth + 2, 20);

    // Subtitle
    doc.setFontSize(9); // Reduced from 10
    doc.setFont('ThaiFont', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Quotation & Booking Summary', margin, 25);

    // Separator line
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, 28, pageWidth - margin, 28);

    // 2. BOOKING INFO (Date, Ref, Author)
    doc.setFontSize(8.5); // Reduced from 10
    // 2. BOOKING INFO
    let currentY = 40;
    const rowHeight = 7;
    const secondCol = 105;

    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    
    // Header Info - Combined for better rendering
    doc.setFont('ThaiFont', 'bold');
    doc.text(`Reference: ${trip.booking_reference || trip.id || '-'}`, margin, currentY);
    
    const displayDate = trip.created_at ? formatDate(trip.created_at, 'dd/MM/yyyy', 'en-US') : formatDate(new Date(), 'dd/MM/yyyy', 'en-US');
    doc.text(`Date: ${displayDate}`, margin, currentY + rowHeight);
    
    doc.text(`Staff: ${trip.user_name || '-'}`, margin, currentY + rowHeight * 2);

    doc.text(`Client: ${trip.client_name || '-'}`, secondCol, currentY);
    
    const statusText = trip.approved ? 'Approved' : (trip.declined ? 'Declined' : 'Pending');
    doc.text(`Status: ${statusText}`, secondCol, currentY + rowHeight);
    
    doc.text(`PAX: ${trip.number_of_adults || 0} Adults, ${trip.number_of_kids || 0} Kids`, secondCol, currentY + rowHeight * 2);

    currentY = 65;

    // 3. SERVICE TABLES
    
    // --- HOTELS ---
    if (trip.hotels && trip.hotels.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Hotels', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date (In/Out)', 'Hotel Name', 'Room Type', 'Nights', 'S/D Price', 'Total']],
        body: trip.hotels.map((h: any) => [
          `${formatDate(h.from_date, 'dd/MM/yy', 'en-US')} - ${formatDate(h.to_date, 'dd/MM/yy', 'en-US')}`,
          h.hotel_name || '',
          (h.room_type || '').split(',').filter((s: string) => s.trim() !== '').map((s: string, index: number, arr: string[]) => arr.length > 1 ? `${index + 1}. ${s.trim()}` : s.trim()).join('\n'),
          h.nights || 0,
          `S: ${Number(h.single_price || 0).toLocaleString()} / D: ${Number(h.double_price || 0).toLocaleString()}`,
          `${(Number(h.single_price || 0) + Number(h.double_price || 0)).toLocaleString()}`
        ]),
        headStyles: { fillColor: [255, 153, 0] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // --- TRANSFERS ---
    if (trip.transfers && trip.transfers.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Transfers', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'From', 'To', 'Type', 'Pickup', 'Price']],
        body: trip.transfers.map((t: any) => [
          formatDate(t.from_date, 'dd/MM/yy', 'en-US'),
          t.from_location || '',
          t.to_location || '',
          t.tot || 'PVT',
          t.pickup_time || '-',
          Number(t.price || 0).toLocaleString()
        ]),
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // --- EXCURSIONS ---
    if (trip.excursions && trip.excursions.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Excursions', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Excursion Name', 'Type', 'Pickup', 'Price']],
        body: trip.excursions.map((e: any) => [
          formatDate(e.from_date, 'dd/MM/yy', 'en-US'),
          e.excursion_name || '',
          e.toe || 'PVT',
          e.pickup_time || '-',
          Number(e.price || 0).toLocaleString()
        ]),
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // --- TOURS ---
    if (trip.tours && trip.tours.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Tours', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Tour Name', 'Type', 'Price']],
        body: trip.tours.map((t: any) => [
          formatDate(t.from_date, 'dd/MM/yy', 'en-US'),
          t.tour_name || '',
          t.tot || 'PVT',
          Number(t.price || 0).toLocaleString()
        ]),
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // --- FLIGHTS ---
    if (trip.flights && trip.flights.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Flights', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Flight No.', 'Route', 'Dep/Arr Time', 'Price']],
        body: trip.flights.map((f: any) => [
          formatDate(f.from_date, 'dd/MM/yy', 'en-US'),
          f.flight_number || '',
          f.route || '',
          `${f.edt || '-'} / ${f.eat || '-'}`,
          Number(f.price || 0).toLocaleString()
        ]),
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // --- OTHER SERVICES ---
    if (trip.other && trip.other.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(255, 153, 0);
      doc.text('Other Services', margin, currentY);
      currentY += 5;

      autoTable(doc, {
        startY: currentY,
        head: [['Date', 'Description', 'Price']],
        body: trip.other.map((o: any) => [
          formatDate(o.from_date, 'dd/MM/yy', 'en-US'),
          o.description || 'Other Service',
          Number(o.price || 0).toLocaleString()
        ]),
        headStyles: { fillColor: [51, 51, 51] },
        styles: { fontSize: 8, font: 'ThaiFont' },
        margin: { left: margin, right: margin }
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    }

    // 4. PRICE BREAKDOWN SUMMARY
    const flightsSum = (trip.flights || []).reduce((s: number, f: any) => s + (Number(f.price) || 0), 0);
    const transfersSum = (trip.transfers || []).reduce((s: number, t: any) => s + (Number(t.price) || 0), 0);
    const hotelsSum = (trip.hotels || []).reduce((s: number, h: any) => s + (Number(h.single_price || 0) + Number(h.double_price || 0)), 0);
    const excursionsSum = (trip.excursions || []).reduce((s: number, e: any) => s + (Number(e.price) || 0), 0);
    const toursSum = (trip.tours || []).reduce((s: number, t: any) => s + (Number(t.price) || 0), 0);
    const otherSum = (trip.other || []).reduce((s: number, o: any) => s + (Number(o.price) || 0), 0);
    const assistanceFee = Number(trip.final_amount || 0) - Number(trip.total_amount || 0);

    const summaryData = [];
    if (flightsSum > 0) summaryData.push(['Total Flights Cost', flightsSum.toLocaleString()]);
    if (transfersSum > 0) summaryData.push(['Total Transfers Cost', transfersSum.toLocaleString()]);
    if (hotelsSum > 0) summaryData.push(['Total Hotels Cost', hotelsSum.toLocaleString()]);
    if (excursionsSum > 0) summaryData.push(['Total Excursions Cost', excursionsSum.toLocaleString()]);
    if (toursSum > 0) summaryData.push(['Total Tours Cost', toursSum.toLocaleString()]);
    if (otherSum > 0) summaryData.push(['Total Other Services', otherSum.toLocaleString()]);
    if (assistanceFee > 0) summaryData.push(['Assistance & Service Fee', assistanceFee.toLocaleString()]);

    doc.setFontSize(14);
    doc.setTextColor(255, 153, 0);
    doc.text('Price Breakdown Summary', margin, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 9, fontStyle: 'bold', font: 'ThaiFont' },
      columnStyles: { 
        0: { cellWidth: 100 }, 
        1: { cellWidth: 50, halign: 'right' } 
      },
      margin: { left: margin }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.text('Total Final Amount:', secondCol + 10, currentY);
    doc.setTextColor(255, 153, 0);
    doc.setFontSize(16);
    doc.text(`${Number(trip.final_amount || 0).toLocaleString()} THB`, secondCol + 60, currentY);

    // 5. FOOTER
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('ThaiFont', 'normal'); // Use ThaiFont in footer
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Thailandia Project - Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        287,
        { align: 'center' }
      );
    }

    // 6. SAVE
    const fileName = `Quotation_${trip.booking_reference || trip.uuid?.slice(0, 8) || trip.id}.pdf`;
    doc.save(fileName);
  }
}
