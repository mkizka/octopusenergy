import { getHalfHourlyReadings } from "./api.ts";
import { TZDate } from "npm:@date-fns/tz";
import { endOfMonth, format, getDate } from "npm:date-fns";

const sumByKey = <T extends Record<string, number>>(
  items: T[],
  key: keyof T,
) => {
  return items.reduce((acc, item) => acc + item[key], 0);
};

const roundNumber = (num: number, decimalPlaces: number) => {
  const factor = 10 ** decimalPlaces;
  return Math.round(num * factor) / factor;
};

const main = async () => {
  const readings = await getHalfHourlyReadings();

  // 日付ごとに合計値を計算
  const results: Record<string, { value: number; costEstimate: number }> = {};
  for (const reading of readings) {
    const date = new TZDate(reading.startAt, "Asia/Tokyo");
    const key = format(date, "yyyy-MM-dd");
    if (!results[key]) {
      results[key] = {
        value: Number(reading.value),
        costEstimate: Number(reading.costEstimate),
      };
    } else {
      results[key].value += Number(reading.value);
      results[key].costEstimate += Number(reading.costEstimate);
    }
  }
  console.table(results);

  // 合計値を表示
  const sumValue = sumByKey(Object.values(results), "value");
  const sumCostEstimate = sumByKey(Object.values(results), "costEstimate");

  // 30日間の推定料金を計算
  const avgCostEstimate = sumCostEstimate / Object.keys(results).length;
  const sumCostEstimate30 = avgCostEstimate * 30;

  // 月末までの推定料金を計算
  const now = TZDate.tz("Asia/Tokyo");
  const remainingDays = getDate(endOfMonth(now)) - getDate(now);
  const sumCostEstimateAll = sumCostEstimate + avgCostEstimate * remainingDays;

  console.table({
    "今日": format(now, "yyyy-MM-dd"),
    "月末までの日数": `${remainingDays} 日`,
    "合計使用量": `${roundNumber(sumValue, 3)} kWh`,
    "推定料金(今日まで)": `${roundNumber(sumCostEstimate, 3)} 円`,
    "推定料金(30日間)": `${roundNumber(sumCostEstimate30, 3)} 円`,
    "推定料金(月末まで)": `${roundNumber(sumCostEstimateAll, 3)} 円`,
  });
};

main().catch(console.error);
