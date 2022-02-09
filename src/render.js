/* global API_HOST API_ENDPOINT_GET_CHART */
import {init} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
const griffinTypes = Array.from(griffinImages).map(img => img.dataset.griffinType);
const slot = document.querySelector('#chart-slot');
async function getChartData({chartIDs, data, publishedFlags}){
    const response = await fetch(API_HOST + API_ENDPOINT_GET_CHART, {
        method: 'POST',
        body: JSON.stringify({
            chartIDs,
            data,
            publishedFlags
        })
    });
    return response.json();
}
async function renderGriffins({chartIDs, isFromParam, data, publishedFlags = []}){
    const chartData = await getChartData({chartIDs, data, publishedFlags});
    if (isFromParam){
        renderFromParam(chartData);
    } else {
        renderFromImages(chartData, griffinTypes)
    }
    return chartData;
}
function renderFromImages(chartData){
    griffinImages.forEach((img, i) => {
        const slot = document.createElement('div');
        const mobileImg = document.getElementById('mobile-' + img.dataset.id)
        slot.insertAdjacentHTML('beforeend', chartData[i].template);
        img.insertAdjacentElement('beforebegin', slot);
        const picContainer = slot.querySelector('.js-picture-container');
        img.style.marginTop = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.top + '%' : 0;
        img.style.marginBottom = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.bottom + '%' : 0;
        img.classList.add('fullscreen');
        mobileImg.src = img.src.replace('.png','-mobile.png');
        mobileImg.style.marginTop = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.mobile.top + '%' : 0;
        mobileImg.style.marginBottom = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.mobile.bottom + '%' : 0;
        picContainer.appendChild(img);
        picContainer.appendChild(mobileImg);
        if (griffinTypes[i] == 'static'){
            slot.querySelector('.js-_griffin').classList.remove('js-griffin');
        }
        if (griffinTypes[i] == 'lazy'){
            slot.querySelector('.js-_griffin').classList.add('js-griffin--lazy');
        }
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
    var chartData, idString, ids, pString, p;
    switch (searchParamsOrData instanceof URLSearchParams) {
        case true: // ids passed in from URL param string. ie. from chartViewer preview
            idString = searchParamsOrData.get('ids');
            ids = idString ? idString.split(',') : [];
            pString = searchParamsOrData.get('p');
            p = pString ? pString.split(',') : [];
            chartData = await renderGriffins({chartIDs: ids, isFromParam: !!ids.length, publishedFlags: p});
            break;
        default:
        if (searchParamsOrData && searchParamsOrData instanceof Object ){
            // data passed in directly. i.e., from tool's iframe
            chartData = await renderGriffins({chartIDs: null, isFromParam: true, data: searchParamsOrData});
        } else {
            // ids passed in from griffin images on page, such as in production
            chartData = await renderGriffins({chartIDs});
        }
    }
    adjustIframeHeight();
    if (!(!!window.MSInputMethodContext && !!document.documentMode) && !!Array.prototype.flat) {
        return init(chartData, !!ids);
    }
}