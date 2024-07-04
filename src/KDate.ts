class _KDate {
  private _date: Date;
  constructor();
  constructor(value: number | string | Date);
  constructor(
    year: number,
    monthIndex: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  );

  constructor(...args: unknown[]) {
    this._date = new Date(...(args as []));
  }
  get year() {
    return this._date.getFullYear();
  }
  get month() {
    return this._date.getMonth() + 1;
  }
  get date() {
    return this._date.getDate();
  }
  get hours() {
    return this._date.getHours();
  }
  get minutes() {
    return this._date.getMinutes();
  }
  get seconds() {
    return this._date.getSeconds();
  }
  get ms() {
    return this._date.getMilliseconds();
  }
  get day() {
    return this._date.getDay();
  }
  set year(year: number) {
    this._date.setFullYear(year);
  }
  set month(monthIndex: number) {
    this._date.setMonth(monthIndex - 1);
  }
  set date(date: number) {
    this._date.setDate(date);
  }
  set hours(hours: number) {
    this._date.setHours(hours);
  }
  set minutes(minutes: number) {
    this._date.setMinutes(minutes);
  }
  set seconds(seconds: number) {
    this._date.setSeconds(seconds);
  }
  set ms(ms: number) {
    this._date.setMilliseconds(ms);
  }
  get dateObject() {
    return new Date(this._date);
  }
  [Symbol.toPrimitive]() {
    return this.getTime();
  }
  toJSON() {
    return this._date.toJSON();
  }
  getTime() {
    return this._date.getTime();
  }

  static now() {
    return Date.now();
  }

} 
Object.defineProperty(globalThis, 'KDate', {
  enumerable: false,
  value: _KDate,
  writable: false,
});

export {};
declare global {
  // eslint-disable-next-line no-var
  var KDate: typeof _KDate;
}
