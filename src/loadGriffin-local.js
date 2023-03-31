(function(){
    var hcStyles, griffinStyles, hc, griffin;
    if (!window.griffinV5IsLoaded){
        window.griffinV5IsLoaded = true;
        hcStyles = document.createElement('link');
        hcStyles.setAttribute('rel','stylesheet');
        hcStyles.setAttribute('href','https://code.highcharts.com/9.3/css/highcharts.css');
        griffinStyles = document.createElement('link');
        griffinStyles.setAttribute('rel','stylesheet');
        griffinStyles.setAttribute('href','/griffin-styles.css');
        hc = document.createElement('script');
        hc.async = false;
        hc.setAttribute('src','https://code.highcharts.com/9.3/highcharts.js');
        hc.setAttribute('onload', "javascript:console.log('hc loaded')")
        hcMore = document.createElement('script');
        hcMore.async = false;
        hcMore.setAttribute('src','https://code.highcharts.com/9.3/highcharts-more.js');
        hcAnnotations = document.createElement('script');
        hcAnnotations.async = false;
        hcAnnotations.setAttribute('src','https://code.highcharts.com/9.3/modules/annotations.js');
        griffin = document.createElement('script');
        griffin.setAttribute('src','/griffin.js');
        griffin.async = false;
        griffin.setAttribute('onload', "javascript:console.log('griffin loaded')")
        document.head.appendChild(hcStyles);
        document.head.appendChild(griffinStyles);
        document.head.appendChild(hc);
        document.head.appendChild(hcMore);
        document.head.appendChild(hcAnnotations);
        document.head.appendChild(griffin);
    }
})();



