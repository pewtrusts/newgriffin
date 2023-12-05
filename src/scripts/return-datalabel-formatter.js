/* global  */
import returnNumberFormatter from './return-number-formatter';
export default function _returnDataLabelFormatter(obj) {
    var numberFormat = obj.numberFormat;
    var decimals = obj.decimals
    var showNumber = obj.showNumber
    var numberFormatter = returnNumberFormatter(numberFormat, 'datalabel', decimals);

    return function() {
        if (showNumber) {
            return `<div>${this.point.id}<br> <span>${numberFormatter.call(this.point.value)}</span></div>`
        } else {
            return `<div class="datalabel">${this.point.id}`
        }
    }
}