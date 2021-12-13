import {init} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
import secrets from '@Root/secrets.json';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
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
    const slot = document.querySelector('#chart-slot');
    chartData.forEach(d => {
        slot.insertAdjacentHTML('beforeend', d.template);
    });
}
function adjustIframeHeight(){
    const isTop = window.self == top;
    if (!isTop && window.frameElement.nodeName == "IFRAME") {
        requestIdleCallback(() => {
            // setTimeout(() => {
            var body = document.body,
                html = document.documentElement;

            var height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight);
            window.frameElement.style.height = height + 'px';
            //  }, 1000);
        }, { timeout: 1000 })
    }
}
export async function renderAndInit(searchParamsOrData){
    var chartData, ids;
    switch (searchParamsOrData instanceof URLSearchParams && searchParamsOrData.length) {
        case true:
            ids = searchParamsOrData.get('ids').split(',');
            chartData = await renderGriffins(ids, true);
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
        init(chartData, !!ids);
    }
}