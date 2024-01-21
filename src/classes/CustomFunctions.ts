interface IBasicDate {
  day: string;
  month: string;
  monthNumber: string;
  year: string;
  nDay: number;
  nMonth: number;
  nYear: number;
}

export function correctDate(date: string | Date): IBasicDate {
  if (date instanceof Date) return formatDate(date);
  else return formatDateString(date);
}

function formatDateString(strDate: string): IBasicDate {
  const date = new Date(strDate);
  return formatDate(date);
}

export function formatDate(date: Date): IBasicDate {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthNumbers = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  const formatted: IBasicDate = {
    day: date.getDate().toString(),
    month: months[date.getMonth()],
    year: date.getFullYear().toString(),
    monthNumber: monthNumbers[date.getMonth()],
    nDay: date.getDate(),
    nMonth: date.getMonth(),
    nYear: date.getFullYear(),
  };
  return formatted;
}

export function dateAfterFromPoint(
  date: Date | string,
  years: number = 0,
  months: number = 0,
  days: number = 0
) {
  const { nDay, nMonth, nYear } = correctDate(date);
  //The Date() constructor can be called with two or more arguments,
  //in which case they are interpreted as the year, month, day, hour, minute, second, and millisecond, respectively, in local time.
  return new Date(nYear + years, nMonth + months, nDay + days);
}

export function monthsAfterToday(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}
