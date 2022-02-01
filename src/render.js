/* global API_HOST API_ENDPOINT_GET_CHART */
import {init} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
const slot = document.querySelector('#chart-slot');
async function getChartData({chartIDs, data}){
    const response = await fetch(API_HOST + API_ENDPOINT_GET_CHART, {
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
        const mobileImg = img.cloneNode(true);
        slot.insertAdjacentHTML('afterbegin', chartData[i].template);
        img.insertAdjacentElement('beforebegin', slot);
        const picContainer = slot.querySelector('.js-picture-container');
        img.style.marginTop = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.top + '%' : 0;
        img.style.marginBottom = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.bottom + '%' : 0;
        img.classList.add('fullscreen');
        mobileImg.src = img.src.replace('.png','-mobile.png');
        mobileImg.style.marginTop = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.mobile.top + '%' : 0;
        mobileImg.style.marginBottom = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.mobile.bottom + '%' : 0;
        mobileImg.classList.add('mobile');
        picContainer.appendChild(img);
        picContainer.appendChild(mobileImg);
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
        case true: // ids passed in from URL param string. ie. from chartViewer preview
            idString = searchParamsOrData.get('ids');
            ids = idString ? idString.split(',') : [];
            chartData = await renderGriffins(ids, !!ids.length);
            break;
        default:
        if (searchParamsOrData && searchParamsOrData instanceof Object ){
            // data passed in directly. i.e., from tool's iframe
            chartData = await renderGriffins(null, true, searchParamsOrData);
        } else {
            // ids passed in from griffin images on page, such as in production
            chartData = await renderGriffins(chartIDs);
        }
    }
    adjustIframeHeight();
    if (!(!!window.MSInputMethodContext && !!document.documentMode) && !!Array.prototype.flat) {
        return init(chartData, !!ids);
    }
}