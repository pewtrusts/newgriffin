import Highcharts from 'Highcharts'; // defined as an external in webpack config
import HCRegression from '../submodules/highcharts-regression'; // local fork
import options from './options.json';
import addCustomColorProperties from './scripts/addCustomColorProperties';
import {addCustomPatterns} from './scripts/addCustomColorProperties';
import returnFormatter from './scripts/return-number-formatter';
import returnPointFormatter from './scripts/return-point-formatter';
import returnLegendFormatter from './scripts/return-legend-formatter';
import hash from './scripts/hash';
let chartDataArray;
const isTop = window.self == top;
HCRegression(Highcharts);
export function beforeRenderExtensions(options, config){
    extendObj(options, ['plotOptions', 'pie', 'dataLabels', 'formatter'], function () {
        return this.point.name + '<br>' + returnFormatter('percentage','tooltip',config.griffinConfig.LabelDecimals).call({ value: this.percentage / 100 });
    })
   /* options.plotOptions.pie.dataLabels.formatter = function () {
        return this.point.x;
    };*/
    extendObj(options, ['plotOptions','pie','point','events','legendItemClick'], function(e){
        e.preventDefault();
        return false;
    });
    extendObj(options, ['plotOptions','series','dataLabels','format'], undefined);
    extendObj(options, ['plotOptions','series','events','afterAnimate'], function(){
        var chartLoaded = new CustomEvent('chartLoaded', {bubbles: true});
        document.body.dispatchEvent(chartLoaded);
    });
    extendObj(options, ['plotOptions','line','dataLabels','formatter'], function(){
        var that = this;
            setTimeout(function(){
                var index = that.point.index;
                console.log(that.point.dataLabel);
                switch (index) {
                    case 0:
                        that.point.dataLabel.element.classList.add('first-datalabel');
                        if (that.point.series.data[index + 1] && that.point.series.data[index + 1].y > that.point.y){
                            that.point.dataLabel.element.classList.add('datapoint--upward');
                        } else {
                            that.point.dataLabel.element.classList.add('datapoint--tip');
                            //that.point.dataLabel.text.element.setAttribute('dx', that.point.dataLabel.width / 2);
                        }
                        break;
                    case that.point.series.data.length - 1:
                        that.point.dataLabel.element.classList.add('last-datalabel');
                        if (that.point.series.data[index - 1].y > that.point.y){
                            that.point.dataLabel.element.classList.add('datapoint--downward');
                            that.point.dataLabel.text.element.setAttribute('dx', that.point.dataLabel.width / 2);
                        } else {
                         //   that.point.dataLabel.element.classList.add('datapoint--upward');
                        }
                        break;
                    default:
                        if (that.point.series.data[index - 1].y <= that.point.y && that.point.series.data[index + 1].y >= that.point.y) {
                            that.point.dataLabel.element.classList.add('datapoint--upward');
                        } else if (that.point.series.data[index - 1].y >= that.point.y && that.point.series.data[index + 1].y <= that.point.y) {
                            that.point.dataLabel.element.classList.add('datapoint--downward');
                            that.point.dataLabel.text.element.setAttribute('dx', that.point.dataLabel.width / 2);
                        } else if (that.point.series.data[index - 1].y <= that.point.y){
                            that.point.dataLabel.element.classList.add('datapoint--tip');
                        } else {
                            if (that.point.series.chart.plotHeight - that.point.dataLabel.y > 50){
                                that.point.dataLabel.element.classList.add('datapoint--dip');
                            }
                        }
                }
            });
        return this.series.chart.userOptions.dataLabelNumberFormatter.call(this);
    });
    
    Highcharts.setOptions(options);
}
Highcharts.SVGElement.prototype.addClass = function (className, replace) {
    var currentClassName = replace ? '' : (this.attr('class') || '');
    // Trim the string and remove duplicates
    className = (className || '')
    .split(/ /g)
    .reduce(function (newClassName, name) {
        var split, regex;
        if (currentClassName.indexOf(name) === -1) {0
            split = name.split(/-\d+$/);
            if (split.length > 1 ) {
                regex = new RegExp(split[0] + '-\\d+$');
                newClassName[0] = newClassName[0].replace(regex, '');
            }
            newClassName.push(name);
        }
        return newClassName;
    }, (currentClassName ?
        [currentClassName] :
        []))
        .join(' ');
        if (className !== currentClassName) {
            this.attr('class', className);
        }
        return this;
    };
window.Highcharts = Highcharts;
export function extendObj(base, properties, value){
    properties.reduce(function(acc,cur,i){
        var split = cur.split('['), prop, index;
        if ( split.length == 1 ){ // ie no index, not an array
            acc[cur] = i == properties.length - 1 ? value : ( acc[cur] || {} );
            return acc[cur] 
        } else {
            prop = split[0];
            index = parseInt(split[1]);
            acc[prop] = acc[prop] || [];
            acc[prop][index] = i == properties.length - 1 ? value : (acc[prop][index] || {});
            return acc[prop][index];
        }
    }, base);
    /**
     * TO DO: somewhere there's inconsistency with 'categorical' and 'category' axis types
     * prevent chartUpdate from redrawing until end.
     */
}
function getImage(e){
    e.preventDefault();
    if (!isTop && window.frameElement.nodeName == "IFRAME") {
        return; // if the docu is in an iframe ie in the chartbuilder tool, let the tool's eventListener fire instead of this
    }
    var figure = this.parentElement.parentElement.parentElement;
    if ( figure.classList.contains('js-griffin--chart-builder') ){
        return;
    }
    var imageSource = figure.querySelector('picture.fullscreen source').getAttribute('srcset').split(/ \dx,? ?/)[1];
    var chartTitle = figure.querySelector('h1');
    var chartTitleText = chartTitle ? chartTitle.textContent : '[no title]';
    var a = document.createElement("a");
    a.href = imageSource;
    a.setAttribute("download", 'chart.png');
    a.click();
    var dataLayer = window.dataLayer || null;
    if (dataLayer && window.griffinGTMDownloadFn ) {
        window.griffinGTMDownloadFn(chartTitleText); // set the Fn elsewhere
    }
}
function setObserver(anchor, container, config, pictureContainer){
    function animate(){
        window.requestAnimationFrame(function () {
            window.Charts.push(Highcharts.chart(container, config));
        });
    }
    var observer = new IntersectionObserver(function(entries){
        if ( entries[0].isIntersecting ){
            pictureContainer.style.display = 'none';
            if (window.requestIdleCallback){
                requestIdleCallback(animate, {timeout:500});
            } else {
                animate();
            }
            observer.disconnect();
        }
    });
    observer.observe(anchor);
}
export function initSingleGriffin(griffin, i, _parent){
    var parent = _parent || griffin;
    var chart;
    var isChartBuilder = parent.classList.contains('js-griffin--chart-builder');
    var inner = isChartBuilder ? griffin.querySelector('.js-griffin-config').textContent : null;
    var config = inner ? JSON.parse(inner) : chartDataArray[i].chartData;
    var container = griffin.querySelector('.js-hc-container');
    var sourceNote = parent.querySelector('.js-griffin-credit');
    var pictureContainer = parent.querySelector('.js-picture-container');
    var anchor = parent.querySelector('.js-griffin-anchor');
    var isLazy = parent.classList.contains('js-griffin--lazy');
    var btn;
    if (isLazy){
        parent.classList.add('lazy-load--ready');
    }
    if (!parent.hasDownload) {
        btn = document.createElement('button');
        btn.textContent = 'Download image';
        btn.className = 'griffin-download-btn';
        btn.setAttribute('data-index', i);
        btn.setAttribute('role', 'button');
        btn.addEventListener('click', getImage);
        sourceNote.insertAdjacentElement('beforeend', btn);
        parent.hasDownload = true;

    }
    beforeRenderExtensions(options, config);
    extendObj(config.highchartsConfig, ['yAxis[0]', 'labels', 'formatter'], returnFormatter(config.griffinConfig.NumberFormat, null, config.griffinConfig.YAxisDecimals));
    extendObj(config.highchartsConfig,
        ['tooltip', 'pointFormatter'],
        returnPointFormatter({
            numberFormat: config.griffinConfig.NumberFormat,
            seriesLength: config.highchartsConfig.series.length,
            decimals: config.griffinConfig.LabelDecimals
        })
    );
    extendObj(config.highchartsConfig, ['legend', 'labelFormatter'], returnLegendFormatter(config.highchartsConfig.chart.type));
    config.highchartsConfig.dataLabelNumberFormatter = returnFormatter(config.griffinConfig.NumberFormat, 'tooltip', config.griffinConfig.LabelDecimals);
    config.highchartsConfig.yAxis.forEach(function (axis) {
        axis.title.text = axis.title.text || null;
    });
    if (config.griffinConfig.SelectedColorPalette == 'custom') {
        addCustomColorProperties({
            colors: config.griffinConfig.CustomColors,
            hash: hash(config.griffinConfig.CustomColors.join(''))
        });
    }
    if (config.griffinConfig.PatternColors && config.griffinConfig.PatternColors.some(d => d)){
        addCustomPatterns({ patterns: config.griffinConfig.PatternColors, hash: hash(config.griffinConfig.PatternColors.flat().join('')) });
    }
    /**
     * workaround for FF bug that seems sometimes include the first letter of a subsequent <tspan>
     * in the previous one. doesn't show in DOM inspector, but does on screen
     */
    if (config.highchartsConfig.xAxis.categories && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        config.highchartsConfig.xAxis.categories = config.highchartsConfig.xAxis.categories.map(cat => {
            return cat.replace(/ +/g, ' ').replace(/ /g, '  ');
        });
    }
    if (isLazy && window.IntersectionObserver && !isChartBuilder) {
        setObserver(anchor, container, config.highchartsConfig, pictureContainer);
    } else {
        pictureContainer.style.display = 'none';
        chart = Highcharts.chart(container, config.highchartsConfig);
        window.Charts.push(chart);
        return chart;
    }
}
export function init(v, /*isFromParams*/){
    chartDataArray = v;
    window.Charts = [];
   // const griffins = !isFromParams ? document.querySelectorAll('.js-griffin') : [document.querySelector('#chart-slot')];
    const griffins = document.querySelectorAll('.js-griffin');
    if (window.CSS && CSS.supports('color', 'var(--primary)')) {
        for (var i = 0; i < griffins.length; i++){
            console.log(i + ' of ' + griffins.length);
            const singletons = griffins[i].querySelectorAll('.js-griffin-container');
            if (singletons.length > 1){
                // TO DO: FIGURE OUT MULTIPLES
                /*for (var j = 0; j < singletons.length; j++){
                    initSingleGriffin(singletons[j],i, griffins[i]);
                }*/
            } else {
                /**
                 * when Griffin is called from the chart builder tool, we need to return the instance
                 * but we need to avoid returning the instance otherwise so that the for loop will continue
                 * through. the tool will always only send 1 instance. if that changes we'll need another way to 
                 * differentiate
                 */
                if (griffins.length == 1){
                    return initSingleGriffin(griffins[i],i);
                } else {
                    initSingleGriffin(griffins[i], i);
                }
            }
        }
        return;
    }
}
if (!(!!window.MSInputMethodContext && !!document.documentMode) && !!Array.prototype.flat){
    init();
}