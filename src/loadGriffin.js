(function(){
    var hcStyles, griffinStyles, hc, hcMore, hcAnnotations, griffin;
    if (!window.griffinV5IsLoaded){
        window.griffinV5IsLoaded = true;
        hcStyles = document.createElement('link');
        hcStyles.setAttribute('rel','stylesheet');
        hcStyles.setAttribute('href','https://code.highcharts.com/9.3/css/highcharts.css');
        griffinStyles = document.createElement('link');
        griffinStyles.setAttribute('rel','stylesheet');
        griffinStyles.setAttribute('href','/-/media/data-visualizations/interactives/griffin-v5/griffin-styles.css');
        hc = document.createElement('script');
        hc.defer = true;
        hc.setAttribute('src','https://code.highcharts.com/9.3/highcharts.js');
        hcMore = document.createElement('script');
        hcMore.defer = true;
        hcMore.setAttribute('src','https://code.highcharts.com/9.3/highcharts-more.js');
        hcAnnotations = document.createElement('script');
        hcAnnotations.defer = true;
        hcAnnotations.setAttribute('src','https://code.highcharts.com/9.3/modules/annotations.js');
        griffin = document.createElement('script');
        griffin.defer = true;
        griffin.setAttribute('src','/-/media/data-visualizations/interactives/griffin-v5/griffin.js');
        document.head.appendChild(hcStyles);
        document.head.appendChild(griffinStyles);
        document.head.appendChild(hc);
        document.head.appendChild(hcMore);
        document.head.appendChild(hcAnnotations);
        document.head.appendChild(griffin);
    }
})();
