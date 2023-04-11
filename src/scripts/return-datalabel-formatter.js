/* global  */
import returnNumberFormatter from './return-number-formatter';
export default function _returnDataLabelFormatter(obj) {
    var numberFormat = obj.numberFormat;
    var decimals = obj.decimals
    var numberFormatter = returnNumberFormatter(numberFormat, 'datalabel', decimals);

    return function() {
        console.log(this)
        return `<div class="datalabel">${this.point.id}<br> <span class="mobile-hide">${numberFormatter.call(this.point.value)}</span></div>`
    }
}