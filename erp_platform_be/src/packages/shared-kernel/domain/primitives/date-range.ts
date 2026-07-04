import { ValidationException } from '../../exceptions/validation.exception';

export class DateRange {
    private constructor(
        public readonly startDate: Date,
        public readonly endDate: Date,
    ) { }

    public static create(
        startDate: Date,
        endDate: Date,
    ): DateRange {
        if (startDate > endDate) {
            throw new ValidationException(
                'Start date cannot be after end date.',
            );
        }

        return new DateRange(startDate, endDate);
    }

    public contains(date: Date): boolean {
        return date >= this.startDate && date <= this.endDate;
    }

    public overlaps(other: DateRange): boolean {
        return (
            this.startDate <= other.endDate &&
            this.endDate >= other.startDate
        );
    }

    public durationInDays(): number {
        const millisecondsPerDay = 1000 * 60 * 60 * 24;

        return Math.ceil(
            (this.endDate.getTime() - this.startDate.getTime()) /
            millisecondsPerDay,
        );
    }
} v