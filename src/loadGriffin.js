(function(){
    var hcStyles, griffinStyles, hc, griffin;
    if (!window.griffinV5IsLoaded){
        window.griffinV5IsLoaded = true;
        hcStyles = document.createElement('link');
        hcStyles.setAttribute('rel','stylesheet');
        hcStyles.setAttribute('href','https://code.highcharts.com/10.3/css/highcharts.css');
        griffinStyles = document.createElement('link');
        griffinStyles.setAttribute('rel','stylesheet');
        griffinStyles.setAttribute('href','/-/media/data-visualizations/interactives/griffin-v5_1/griffin-styles.css');
        hc = document.createElement('script');
        hc.async = false;
        // hc.setAttribute('src','https://code.highcharts.com/10.3/highcharts.js');
        hc.setAttribute('src','https://code.highcharts.com/maps/10.3/highmaps.js');
        hctm = document.createElement('script');
        hctm.async = false;
        hctm.setAttribute('src','https://code.highcharts.com/10.3/modules/tilemap.js');
        hcMore = document.createElement('script');
        hcMore.async = false;
        hcMore.setAttribute('src','https://code.highcharts.com/10.3/highcharts-more.js');
        hcAnnotations = document.createElement('script');
        hcAnnotations.async = false;
        hcAnnotations.setAttribute('src','https://code.highcharts.com/10.3/modules/annotations.js');
        griffin = document.createElement('script');
        griffin.setAttribute('src','/-/media/data-visualizations/interactives/griffin-v5_1/griffin.js');
        griffin.async = false;
        document.head.appendChild(hcStyles);
        document.head.appendChild(griffinStyles);
        document.head.appendChild(hc);
        document.head.appendChild(hctm);
        document.head.appendChild(hcMore);
        document.head.appendChild(hcAnnotations);
        document.head.appendChild(griffin);
    }
})();
