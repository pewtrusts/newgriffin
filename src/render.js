import {init} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
import secrets from '@Root/secrets.json';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
const slot = document.querySelector('#chart-slot');
async function getChartData({chartIDs, data}){
    const response = await fetch(secrets.API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
            chartIDs,
            data
        })
    });
    return response.json();
}
async function renderGriffins(chartIDs, isFromParam, data){
    const chartData = await getChartData({chartIDs, data});
    if (isFromParam){
        renderFromParam(chartData);
    } else {
        renderFromImages(chartData)
    }
    return chartData;
}
function renderFromImages(chartData){
    griffinImages.forEach((img, i) => {
        const slot = document.createElement('div');
        slot.insertAdjacentHTML('afterbegin', chartData[i].template);
        img.insertAdjacentElement('beforebegin', slot);
        const picContainer = slot.querySelector('.js-picture-container');
        picContainer.appendChild(img);
        img.style.marginTop = chartData[i].chartData.margins[0];
        img.style.marginBottom = chartData[i].chartData.margins[1];
    });
}
function renderFromParam(chartData){
    chartData.forEach(d => {
        slot.insertAdjacentHTML('beforeend', d.template);
    });
}
function adjustIframeHeight(){
    const isTop = window.self == top;
    if (!isTop && window.frameElement.nodeName == "IFRAME") {
        requestIdleCallback(() => {
            window.frameElement.style.height = slot.offsetHeight + 40 + 'px';
        }, { timeout: 200 })
    }
}
export async function renderAndInit(searchParamsOrData){
    var chartData, idString, ids;
    switch (searchParamsOrData instanceof URLSearchParams) {
        case true:
            idString = searchParamsOrData.get('ids');
            ids = idString ? idString.split(',') : [];
            chartData = await renderGriffins(ids, !!ids.length);
            break;
        default:
        if (searchParamsOrData && searchParamsOrData instanceof Object && !(searchParamsOrData instanceof URLSearchParams)){
            chartData = await renderGriffins(null, true, searchParamsOrData);
        } else {
            chartData = await renderGriffins(chartIDs);
        }
    }
    adjustIframeHeight();
    if (!(!!window.MSInputMethodContext && !!document.documentMode) && !!Array.prototype.flat) {
        return init(chartData, !!ids);
    }
}