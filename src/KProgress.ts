import { clamp } from './Other';

export type ProgressState = {
  readonly now: number;
  readonly total: number;
  readonly numerable: boolean;
  readonly state: 'pending' | 'fulfilled' | 'rejected';
  readonly error?: unknown;
};
export default class KProgress extends Promise<ProgressState> {
  protected _total: number;
  protected _now: number;
  protected _resolve: (value: ProgressState | PromiseLike<ProgressState>) => void = () => {};
  protected _reject: (reason?: unknown) => void = () => {};
  protected _state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  protected _numberable: boolean;
  private listeners: Record<string, ((state: ProgressState) => void)[]> = Object.create(null);
  protected _rejectReason: unknown = void 0;
  public get now() {
    return this._numberable ? this._now : void 0;
  }
  public get total() {
    return this._total;
  }
  public set total(total: number) {
    this._total = total;
    this.emit('totalChange');
  }
  public get numerable() {
    return this._numberable;
  }
  public set numerable(numerable: boolean) {
    this._numberable = numerable;
    this.emit('numerableChange');
  }
  public get state() {
    return this._state;
  }
  public get error() {
    return this._state === 'rejected' ? this._rejectReason : void 0;
  }

  constructor(options: { total?: number; current?: number; numerable?: boolean }) {
    super((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this._total = options.total ?? 1;
    this._now = options.current ?? 0;
    this._numberable = options.numerable ?? true;
    this.then(
      () => {
        this._now = this._total;
        this._state = 'fulfilled';
        this.emit('progress');
        this.emit('stateChange');
      },
      (reason) => {
        this._state = 'rejected';
        this._rejectReason = reason;
        this.emit('stateChange');
      }
    );
  }

  addEventListener(e: 'progress', callback: (state: ProgressState) => void): () => void;
  addEventListener(e: 'numerableChange', callback: (state: ProgressState) => void): () => void;
  addEventListener(e: 'totalChange', callback: (state: ProgressState) => void): () => void;
  addEventListener(e: 'stateChange', callback: (state: ProgressState) => void): () => void;

  addEventListener(e: string, callback: (state: ProgressState) => void): () => void {
    if (e in this.listeners) {
      this.listeners[e].push(callback);
    } else {
      this.listeners[e] = [callback];
    }
    return () => {
      this.listeners[e] = this.listeners[e].filter((item) => item !== callback);
    };
  }
  get stateValue(): ProgressState {
    return {
      now: this._now,
      total: this._total,
      numerable: this._numberable,
      state: this._state,
      error: this._state === 'rejected' ? this._reject : void 0,
    };
  }
  private emit(type: 'progress' | 'numerableChange' | 'stateChange' | 'totalChange'): void {
    this.listeners[type] &&
      this.listeners[type].forEach((callback) => {
        callback(this.stateValue);
      });
  }
  setCurrent(current: number): void {
    if (this._state !== 'pending') throw new Error('Progress is not pending');
    this._now = clamp(current, 0, this._total);
    this.emit('progress');
  }
  add(value: number): void {
    this.setCurrent(this._now + value);
  }
  finish() {
    this._resolve(this.stateValue);
  }
  reject(reason?: unknown): void {
    this._reject(reason);
  }
  
}
