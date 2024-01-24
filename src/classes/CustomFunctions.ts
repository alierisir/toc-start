import { Project } from "./Project";

interface IBasicDate {
  day: string;
  month: string;
  monthNumber: string;
  year: string;
  nDay: number;
  nMonth: number;
  nYear: number;
  nHour: number;
  nMinute: number;
  nSecond: number;
  nMillisecond: number;
}

export function basicToNativeDate(date: IBasicDate): Date {
  const { nYear, nMonth, nDay, nHour, nMinute, nSecond, nMillisecond } = date;
  const nativeDate = new Date(
    nYear,
    nMonth,
    nDay,
    nHour,
    nMinute,
    nSecond,
    nMillisecond
  );
  return nativeDate;
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
    nHour: date.getHours(),
    nMinute: date.getMinutes(),
    nSecond: date.getSeconds(),
    nMillisecond: date.getMilliseconds(),
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

export function getInitials(name: string) {
  const words = name.split(" ");
  const count = words.length;
  let initials: string;
  if (count < 2) {
    //If project name is only 1 word, get first two letters.
    initials = words[0][0] + words[0][1];
  } else {
    //If project name is more than 1 word, get first and last word's first letters.
    initials = words[0][0] + words[count - 1][0];
  }
  return initials;
}

export function getRandomColor() {
  const colors = [
    "#50ad45",
    "#7c45ad",
    "#ad4545",
    "#45a3ad",
    "#4745ad",
    "#bd53c3",
    "#56b84f",
    "#a647b8",
    "#b84f4f",
    "#4faab8",
    "#4f4fb8",
    "#d362d1",
    "#ad5845",
    "#45adad",
    "#ad8145",
    "#4596ad",
  ];
  const selectedColor =
    colors[Math.floor((Math.random() * 100) % colors.length)];
  return selectedColor;
}

export const editDummy = {
  name: "placeholder",
  description: "description",
  cost: "cost",
  progress: "progress",
  status: "status",
  role: "role",
  date: "date",
};

console.log("custom-functions! - test area start");
//write code to check here

console.log("custom-functions! - test area end");
