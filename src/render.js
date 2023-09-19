/* global API_HOST API_ENDPOINT_GET_CHART */
import {init, extendObj} from './griffin.js';
import './css/griffin-styles.scss';
import '../submodules/shared-css/styles.css';
const griffinImages = document.querySelectorAll('.js-griffin-image');
const chartIDs = Array.from(griffinImages).map(img => img.dataset.id);
const griffinTypes = Array.from(griffinImages).map(img => img.dataset.griffinType);
const slot = document.querySelector('#chart-slot');
async function getChartData({chartIDs, data, publishedFlags, project, isFromParam}){
    if (isFromParam) {
        const response = await fetch(API_HOST + API_ENDPOINT_GET_CHART, {
            method: 'POST',
            body: JSON.stringify({
                chartIDs,
                data,
                publishedFlags,
                project
            })
        });
        return response.json();
    }
    if (window.globalChartData) {
        return window.globalChartData;
    }
}
async function renderGriffins({chartIDs, isFromParam, data, publishedFlags = [], isForThumbnail, project}){
    const chartData = await getChartData({chartIDs, data, publishedFlags, project, isFromParam});
    if (isForThumbnail){
        /**
         * the griffin chart tool renders charts in puppeteer and screenshots images of them. the thumbnail image
         * appears in the chart tool itself and works best without the legend so that the focus is on the chart
         * code below disables the legend, makes sure any responsive rules don't overrule the disabling, and adjusts
         * the height of the chart so that the graph is the same size as it is with the legend.
         */
        chartData[0].chartData.highchartsConfig.legend.enabled = false;
        for ( var i = 0; i < chartData[0].chartData.highchartsConfig.responsive.rules.length; i++){
            extendObj(chartData[0].chartData.highchartsConfig.responsive.rules[i], ['chartOptions','legend','enabled'], false)
        }
        //chartData[0].chartData.highchartsConfig.responsive.rules.push({chartOptions:{legend:{enabled:false}},condition:{minWidth:1}})
        if (chartData[0].imageMargins && typeof chartData[0].chartData.highchartsConfig.chart.height == 'string' && chartData[0].chartData.highchartsConfig.chart.height.includes('%')){
            let height = Math.round(366 * parseFloat(chartData[0].chartData.highchartsConfig.chart.height) / 100);
            chartData[0].chartData.highchartsConfig.chart.height = height - chartData[0].imageMargins.mobile.mbLegendHeight;
        } else if (chartData[0].imageMargins){
            chartData[0].chartData.highchartsConfig.chart.height = +chartData[0].chartData.highchartsConfig.chart.height - chartData[0].imageMargins.mobile.mbLegendHeight;   
        }

    }
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
        // const mobileImg = document.getElementById('mobile-' + img.dataset.id)
        if (Array.isArray(chartData[i])) {
            chartData[i].forEach((d) => {
                slot.insertAdjacentHTML('beforeend', d.template);
            })
        } else {
        slot.insertAdjacentHTML('beforeend', chartData[i].template);
        }
        img.insertAdjacentElement('beforebegin', slot);
        const mobileImg = img.nextElementSibling
        const picContainer = slot.querySelector('.js-picture-container');
        img.style.marginTop = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.top + '%' : 0;
        img.style.marginBottom = chartData[i].imageMargins ? '-' + chartData[i].imageMargins.fullWidth.bottom + '%' : 0;
        img.classList.add('fullscreen');
        // mobileImg.src = img.src.replace('.png','-mobile.png');
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
export function adjustIframeHeight(){
    const isTop = window.self == top;
    if (!isTop && window.frameElement && window.frameElement.nodeName == "IFRAME") {
        requestIdleCallback(() => {
            window.frameElement.style.height = slot.offsetHeight + 40 + 'px';
        }, { timeout: 200 })
    }
}
export async function renderAndInit(searchParamsOrData){
    var chartData, idString, ids, pString, p, tString, t, project, widthString;
    switch (searchParamsOrData instanceof URLSearchParams) {
        case true: // ids passed in from URL param string. ie. from chartViewer preview
            idString = searchParamsOrData.get('ids');
            ids = idString ? idString.split(',') : [];
            pString = searchParamsOrData.get('p');
            p = pString ? pString.split(',') : [];
            tString = searchParamsOrData.get('t'); // true or false for isThumbnail image creation
            t = tString == 'true';
            project = searchParamsOrData.get('project');
            console.log(project);
            widthString = searchParamsOrData.get('width');
            widthString ? slot.style.width = widthString+"px" : "";
            if (widthString && widthString < 501) {
                slot.classList.add('mobile-preview')
            }
            chartData = await renderGriffins({chartIDs: ids, isFromParam: !!ids.length || !!project, publishedFlags: p, isForThumbnail: t, project});
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
        return init(chartData, !!ids)
    }
}