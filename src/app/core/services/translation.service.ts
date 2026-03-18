import { Injectable, signal, computed } from '@angular/core';

export type LanguageCode = 'en' | 'th';

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    'login.welcomeBack': 'Welcome back',
    'login.signInHeader': 'Sign in to your account',
    'login.emailLabel': 'EMAIL ADDRESS',
    'login.emailPlaceholder': 'you@verathailandia.com',
    'login.passwordLabel': 'PASSWORD',
    'login.passwordPlaceholder': 'Enter your password',
    'login.rememberMe': 'Remember me',
    'login.forgotPassword': 'Forgot password?',
    'login.signInBtn': 'Sign in \u2192',
    'login.or': 'or',
    'login.continueWithGoogle': 'Continue with Google',

    'home.discover': 'Discover Hotels,\nTours & Experiences',
    'home.travelPlatform': 'travel booking platform',
    'home.searchHotels': 'Search Hotels',
    'home.country': 'COUNTRY',
    'home.city': 'CITY',
    'home.checkIn': 'CHECK-IN',
    'home.checkOut': 'CHECK-OUT',
    'home.keyword': 'KEYWORD',
    'home.keywordPlaceholder': 'Search...',
    'home.searchBtn': 'Search \uD83D\uDD0D',
    'home.tabs.hotels': 'Hotels',
    'home.tabs.tours': 'Tours',
    'home.tabs.excursions': 'Excursions',
    'home.tabs.transfers': 'Transfers',
    'home.results.title': 'Hotel Results',
    'home.results.name': 'NAME',
    'home.results.city': 'CITY',
    'home.results.description': 'DESCRIPTION',
    'home.results.view': 'VIEW',
    'home.results.showing': 'Showing 0 to 0 of 0 entries',

    'nav.home': 'Home',
    'nav.controlPanel': 'Control Panel \u2304',
    'nav.quotation': 'Quotation',
    'nav.payment': 'Payment',
    'nav.itinerary': 'Itinerary',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'nav.adminTitle': 'Welcome, dev it',
    'nav.adminName': 'dev it',
    'nav.adminRole': 'Admin',

    'cp.activities': 'Activities',
    'cp.agents': 'Agents',
    'cp.bookings': 'Bookings',
    'cp.excursions': 'Excursions',
    'cp.hotels': 'Hotels',
    'cp.markups': 'Markups',
    'cp.otherCharges': 'Other Charges',
    'cp.stopSale': 'Stop Sale',
    'cp.suppliers': 'Suppliers',
    'cp.tools': 'Tools',
    'cp.tours': 'Tours',
    'cp.transfers': 'Transfers',
    'cp.users': 'Users'
  },
  th: {
    'login.welcomeBack': 'ยินดีต้อนรับกลับ',
    'login.signInHeader': 'เข้าสู่ระบบบัญชีของคุณ',
    'login.emailLabel': 'ที่อยู่อีเมล',
    'login.emailPlaceholder': 'you@verathailandia.com',
    'login.passwordLabel': 'รหัสผ่าน',
    'login.passwordPlaceholder': 'ป้อนรหัสผ่านของคุณ',
    'login.rememberMe': 'จดจำฉัน',
    'login.forgotPassword': 'ลืมรหัสผ่าน?',
    'login.signInBtn': 'เข้าสู่ระบบ \u2192',
    'login.or': 'หรือ',
    'login.continueWithGoogle': 'ดำเนินการต่อด้วย Google',

    'home.discover': 'ค้นพบโรงแรม,\nทัวร์และประสบการณ์การเดินทาง',
    'home.travelPlatform': 'แพลตฟอร์มการจองการเดินทาง',
    'home.searchHotels': 'ค้นหาโรงแรม',
    'home.country': 'ประเทศ',
    'home.city': 'เมือง',
    'home.checkIn': 'เช็คอิน',
    'home.checkOut': 'เช็คเอาท์',
    'home.keyword': 'คำค้นหา',
    'home.keywordPlaceholder': 'ค้นหา...',
    'home.searchBtn': 'ค้นหา \uD83D\uDD0D',
    'home.tabs.hotels': 'โรงแรม',
    'home.tabs.tours': 'ทัวร์',
    'home.tabs.excursions': 'ทัศนศึกษา',
    'home.tabs.transfers': 'รับส่ง',
    'home.results.title': 'ผลการค้นหาโรงแรม',
    'home.results.name': 'ชื่อ',
    'home.results.city': 'เมือง',
    'home.results.description': 'รายละเอียด',
    'home.results.view': 'ดู',
    'home.results.showing': 'แสดง 0 ถึง 0 จาก 0 รายการ',

    'nav.home': 'หน้าแรก',
    'nav.controlPanel': 'แผงควบคุม \u2304',
    'nav.quotation': 'ใบเสนอราคา',
    'nav.payment': 'การชำระเงิน',
    'nav.itinerary': 'แผนการเดินทาง',
    'nav.analytics': 'การวิเคราะห์',
    'nav.settings': 'การตั้งค่า',
    'nav.adminTitle': 'ยินดีต้อนรับ, dev it',
    'nav.adminName': 'dev it',
    'nav.adminRole': 'ผู้ดูแลระบบ',

    'cp.activities': 'กิจกรรม',
    'cp.agents': 'ตัวแทน',
    'cp.bookings': 'การจอง',
    'cp.excursions': 'ทัศนศึกษา',
    'cp.hotels': 'โรงแรม',
    'cp.markups': 'มาร์กอัป',
    'cp.otherCharges': 'ค่าใช้จ่ายอื่นๆ',
    'cp.stopSale': 'ระงับการขาย',
    'cp.suppliers': 'ซัพพลายเออร์',
    'cp.tools': 'เครื่องมือ',
    'cp.tours': 'ทัวร์',
    'cp.transfers': 'รถรับส่ง',
    'cp.users': 'ผู้ใช้งาน'
  }
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage = signal<LanguageCode>('en');

  // Computed signal returning the dictionary for current language
  public translations = computed(() => TRANSLATIONS[this.currentLanguage()]);

  public setLanguage(lang: LanguageCode) {
    this.currentLanguage.set(lang);
  }

  public getLanguage(): LanguageCode {
    return this.currentLanguage();
  }

  public toggleLanguage() {
    this.currentLanguage.update(lang => lang === 'en' ? 'th' : 'en');
  }
}
