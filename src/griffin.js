import Highcharts from 'Highcharts'; // defined as an external in webpack config
import HCRegression from '../submodules/highcharts-regression'; // local fork
import options from './options.json';
import addCustomColorProperties, { removeCustomPatterns } from './scripts/addCustomColorProperties';
import {addCustomPatterns} from './scripts/addCustomColorProperties';
import returnFormatter from './scripts/return-number-formatter';
import returnPointFormatter from './scripts/return-point-formatter';
import returnLegendFormatter from './scripts/return-legend-formatter';
import returnDataLabelFormatter from './scripts/return-datalabel-formatter';
import returnNumberFormatter from './scripts/return-number-formatter';
import hash from './scripts/hash';
import {adjustIframeHeight} from './render';
import defaultsDeep from 'lodash.defaultsdeep';
const _ = { defaultsDeep };
let chartDataArray;
const isTop = window.self == top;
HCRegression(Highcharts);
export function beforeRenderExtensions(options, config){
    /**
     * lockHeight calculations now done at runtime rather than being saved into the chart config
     */
    if (config.griffinConfig.LockHeight && 
        config.highchartsConfig.responsive.rules[0] && 
        config.highchartsConfig.responsive.rules[0].chartOptions.chart &&
        config.highchartsConfig.responsive.rules[0].chartOptions.chart.height.includes('%')){
        let percentage = parseFloat(config.highchartsConfig.responsive.rules[0].chartOptions.chart.height) / 100;
        config.highchartsConfig.responsive.rules[0].chartOptions.chart.height = Math.round(percentage * +config.griffinConfig.MaxWidth);
    }
    /**
     * custom options are now merged with chart config at runtime rather than when the chart is saved. previous method
     * had ill effects, with the custom options being merge again and again
     */
    var customOptions = config.griffinConfig.CustomSettings;
    if (customOptions && typeof customOptions == 'object' && Object.keys(customOptions).length > 0) {
        config.highchartsConfig = _.defaultsDeep(customOptions, config.highchartsConfig);
    }
    var customCSS = config.griffinConfig.CustomCSS;
    var hashId = config.griffinConfig.hashId
    if (customCSS) {
        let style;
        if (document.getElementById("css-" + hashId)) {
            document.getElementById("css-" + hashId).innerHTML = customCSS;
            style = document.getElementById("css-" + hashId);
        } else {
            style = document.createElement('style');
            style.id = "css-" + hashId
            style.innerHTML = customCSS;
            document.head.appendChild(style)
        }
        for (let x=0;x<style.sheet.cssRules.length;x++){
            let rule = style.sheet.cssRules[x];
            rule.selectorText = "figure#chart-" + hashId + " " + rule.selectorText;
        }

    }
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
        // fn is called for each series. should call it only once. `this` is the Series
        if (this.index == this.chart.series.length - 1){
            // this.chart.redraw();
            document.body.dispatchEvent(chartLoaded);
            console.log('resize iframe');
            adjustIframeHeight();
        }
    });
    extendObj(options, ['plotOptions','line','dataLabels','formatter'], function(){
        var that = this;
            setTimeout(function(){
                var index = that.point.index;
                
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
    if (!isTop && window.frameElement.nodeName == "IFRAME") {
        e.preventDefault();
        return; // if the docu is in an iframe ie in the chartbuilder tool, let the tool's eventListener fire instead of this
    }
    var figure = this.parentElement.parentElement.parentElement;
    if ( figure.classList.contains('js-griffin--chart-builder') ){
        e.preventDefault();
        return;
    }
    var dataLayer = window.dataLayer || null;
    if (dataLayer && window.griffinGTMDownloadFn ) {
        window.griffinGTMDownloadFn(); // set the Fn elsewhere
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
    var imageSource = pictureContainer.querySelector('img') ? pictureContainer.querySelector('img').src : '';
    var mobileImageSource = pictureContainer.querySelector('img.mobile') ? pictureContainer.querySelector('img.mobile').src : '';
    var anchor = parent.querySelector('.js-griffin-anchor');
    var isLazy = parent.classList.contains('js-griffin--lazy');
    var imageLink;
    var mobileImageLink;

    if (isLazy){
        parent.classList.add('lazy-load--ready');
    }
    if (!parent.hasDownload && sourceNote) {
        imageLink = document.createElement('a');
        imageLink.textContent = 'View image';
        imageLink.className = 'griffin-download-btn';
        imageLink.setAttribute('data-index', i);
        imageLink.setAttribute('target', '_blank');
        imageLink.href = imageSource
        imageLink.addEventListener('click', getImage);
        sourceNote.insertAdjacentElement('beforeend', imageLink);
        mobileImageLink = document.createElement('a');
        mobileImageLink.textContent = 'View image';
        mobileImageLink.className = 'griffin-download-btn';
        mobileImageLink.classList.add('mobile')
        mobileImageLink.setAttribute('data-index', i);
        mobileImageLink.setAttribute('target', '_blank');
        mobileImageLink.href = mobileImageSource
        mobileImageLink.addEventListener('click', getImage);
        sourceNote.insertAdjacentElement('beforeend', mobileImageLink);
        parent.hasDownload = true;

    }
    config.griffinConfig.hashId = hash(config.griffinConfig.ChartLabel + config.griffinConfig.ChartTitle + config.griffinConfig.ChartSubtitle + config.griffinConfig.ChartDescription + config.griffinConfig.ChartNotes);
    beforeRenderExtensions(options, config);
    extendObj(config.highchartsConfig, ['yAxis[0]', 'labels', 'formatter'], returnFormatter(config.griffinConfig.NumberFormat, null, config.griffinConfig.YAxisDecimals));
    if (!config.griffinConfig.CustomSettings.tooltip || Object.keys(config.griffinConfig.CustomSettings.tooltip).length == 0) {
        extendObj(config.highchartsConfig,
            ['tooltip', 'pointFormatter'],
            returnPointFormatter({
                numberFormat: config.griffinConfig.NumberFormat,
                seriesLength: config.highchartsConfig.series.length,
                decimals: config.griffinConfig.LabelDecimals,
                chartType: config.highchartsConfig.chart.type
            })
        );
    } 
    extendObj(config.highchartsConfig, ['legend', 'labelFormatter'], returnLegendFormatter(config.highchartsConfig.chart.type));
    /**
    * short term fix for scatter plots. should allow for sifferent defaults based on chart types
    * ***** ALSO ***** why are some modifications made to the options (defaults) and others on the config object? 
    * where are they merged?
    */
    if (config.highchartsConfig.chart.type == 'scatter') {
        extendObj(config.highchartsConfig, ['xAxis', 'tickLength'], 7);
        extendObj(config.highchartsConfig, ['yAxis[0]', 'tickLength'], 7);
        extendObj(config.highchartsConfig, ['xAxis', 'tickWidth'], 1);
        extendObj(config.highchartsConfig, ['yAxis[0]', 'tickWidth'], 1);
        extendObj(config.highchartsConfig, ['xAxis', 'tickmarkPlacement'], 'on');
    }
    if (config.highchartsConfig.chart.type == 'tilemap') {
        config.highchartsConfig.yAxis = {visible: false}
        config.highchartsConfig.xAxis.visible = false;
        config.highchartsConfig.chart.inverted = true;
        config.highchartsConfig.chart.styledMode = false;
        // we only need to extendObj if the property doesn't exist
        extendObj(config.highchartsConfig, ['tooltip', 'useHTML'], true);
        // tilemaps have extra information per point and so they need a separate formatter
        if (!config.griffinConfig.CustomSettings.plotOptions?.series?.dataLabels?.format) {
        extendObj(config.highchartsConfig, ['plotOptions', 'tilemap', 'dataLabels', 'formatter'], returnDataLabelFormatter({
            numberFormat: config.griffinConfig.NumberFormat,
            decimals: config.griffinConfig.LabelDecimals,
            showNumber: config.griffinConfig.LastLabelOnly == 'show-numbers'
        })
        );
    }
        if (config.griffinConfig.CustomSettings.colorAxis && !config.griffinConfig.CustomSettings.colorAxis.dataClasses) {
            extendObj(config.griffinConfig.CustomSettings.colorAxis, ['labels', 'formatter'], returnNumberFormatter(config.griffinConfig.NumberFormat, 'legend',
                config.griffinConfig.LabelDecimals
            ));
        }
        config.highchartsConfig.plotOptions.series.states = {inactive: {enabled: true}}
        config.highchartsConfig.tooltip.padding = 1;
        extendObj(config.highchartsConfig, ['plotOptions', 'series', 'point', 'events', 'mouseOver'], function() {
            this.graphic.attr({opacity: 0.7});
        })
    } else {
        config.highchartsConfig.yAxis.forEach(function (axis) {
            axis.title.text = axis.title.text || null;
            axis.max = isNaN(+axis.max) ? null : +axis.max
            axis.min = isNaN(+axis.min) ? null : +axis.min
        });
        config.highchartsConfig.legend.symbolWidth = 18;
    }
    config.highchartsConfig.dataLabelNumberFormatter = returnFormatter(config.griffinConfig.NumberFormat, 'tooltip', config.griffinConfig.LabelDecimals);

    // todo: report highcharts specificity bug
    if (config.highchartsConfig.chart.type !== 'line') {
    extendObj(config.highchartsConfig, ['plotOptions', 'series', 'dataLabels', 'formatter'], config.highchartsConfig.dataLabelNumberFormatter)
    }

    if (config.griffinConfig.SelectedColorPalette == 'custom') {
        addCustomColorProperties({
            colors: config.griffinConfig.CustomColors,
            hash: hash(config.griffinConfig.CustomColors.join(''))
        });
    }
    if (config.griffinConfig.PatternColors && config.griffinConfig.PatternColors.some(d => d)){
        if (config.griffinConfig.SelectedColorPalette == 'custom') {
        addCustomPatterns({ patterns: config.griffinConfig.PatternColors, hash: hash(config.griffinConfig.PatternColors.flat().join('')) });
        } else {
            removeCustomPatterns(hash(config.griffinConfig.PatternColors.flat().join('')))
        }
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
    chartDataArray = v ? v.flat() : v;
    window.Charts = [];
   // const griffins = !isFromParams ? document.querySelectorAll('.js-griffin') : [document.querySelector('#chart-slot')];
    const griffins = document.querySelectorAll('.js-griffin');
    if (window.CSS && CSS.supports('color', 'var(--primary)')) {
        for (var i = 0; i < griffins.length; i++){
            
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