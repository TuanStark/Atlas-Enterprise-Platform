export class DateUtil {
  private constructor() {}

  public static now(): Date {
    return new Date();
  }

  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);

    result.setDate(result.getDate() + days);

    return result;
  }

  public static addMonths(date: Date, months: number): Date {
    const result = new Date(date);

    result.setMonth(result.getMonth() + months);

    return result;
  }

  public static isPast(date: Date): boolean {
    return date.getTime() < Date.now();
  }

  public static isFuture(date: Date): boolean {
    return date.getTime() > Date.now();
  }
}
