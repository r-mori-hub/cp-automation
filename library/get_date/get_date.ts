// 現在の年と月を得るための関数
export function getYearMonthFolder() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}_${month}`;
}