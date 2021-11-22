import {init} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
import secrets from './../secrets.json';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
async function getChartData(chartIDs){
    const response = await fetch(secrets.API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
            chartIDs
        })
    });
    return response.json();
}
async function renderGriffins(chartIDs, isFromParam){
    const chartData = await getChartData(chartIDs);
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
    slot.insertAdjacentHTML('afterbegin', chartData[0].template);
}
export async function renderAndInit(searchParams){
    var chartData;
    const id = searchParams && searchParams.get('id');
    if ( id ){
        chartData = await renderGriffins([id], true);
    } else {
        chartData = await renderGriffins(chartIDs);
    }
    if (!(!!window.MSInputMethodContext && !!document.documentMode) && !!Array.prototype.flat) {
        init(chartData, !!id);
    }
}