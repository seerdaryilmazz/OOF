import _ from "lodash";

export class StringUtils
{
    static formatNumber(value = 0, scale = 2)
      {
         return value.toLocaleString('en-US',{minimumFractionDigits: scale, maximumFractionDigits: scale});
      }
}