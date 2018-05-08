$(document).ready(function () {
  if ($("#map")[0]) {

    var mymap = L.map('map').setView([40.5050025, -7.9053189], 7);

    L.tileLayer('https://api.mapbox.com/styles/v1/fogospt/cjgppvcdp00aa2spjclz9sjst/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZm9nb3NwdCIsImEiOiJjamZ3Y2E5OTMyMjFnMnFxbjAxbmt3bmdtIn0.xg1X-A17WRBaDghhzsmjIA', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoidG9tYWhvY2siLCJhIjoiY2pmYmgydHJnMzMwaTJ3azduYzI2eGZteiJ9.4Z0iB0Pgbb3M_8t9VG10kQ'
    }).addTo(mymap);

    addRisk(mymap);
    mymap.on('click', function (e) {
      mymap.setView(e.latlng);
      window.history.pushState('obj', 'Fogos.pt', '/');
      $('.sidebar').removeClass('active');
      $('#map').find('.fa-map-marker-alt').removeClass('active').addClass('fa-map-marker').removeClass('fa-map-marker-alt');
    });

    var res = window.location.pathname.match(/^\/fogo\/(\d+)/);
    if (res && res.length === 2) {
      plot(res[1]);
    }

    var url = 'https://fogos.pt/new/fires';
    $.ajax({
      url: url,
      method: 'GET',
      success: function (data) {
        data = JSON.parse(data);
        if (data.success) {
          for (i in data.data) {
            addMaker(data.data[i], mymap)
          }
        }
      }
    });
  }
});

function addMaker(item, mymap) {
    var coords = [item.lat, item.lng];

    var el = document.createElement('div');
    el.className = 'marker';

    var marker = L.marker(coords);

    marker.properties = {};
    marker.properties.item = item;

    marker.setIcon(L.divIcon({
        className: 'count-icon-emergency',
        html: '<i class="fas fa-map-marker map-marker status-' + item.statusCode + '"></i>',
        iconSize: [40, 40]
    }));

    marker.addTo(mymap).on('click', function (e) {
        $('#map').find('.fa-map-marker-alt').removeClass('active').addClass('fa-map-marker').removeClass('fa-map-marker-alt');

        mymap.setView(e.latlng, 10);

        var $icon = $(e.target._icon);
        $icon.find('i').addClass('active');
        $icon.find('i').removeClass('fa-map-marker');
        $icon.find('i').addClass('fa-map-marker-alt');

        var item = e.sourceTarget.properties.item;
        $('.sidebar').addClass('active');
        $('.f-local').text(item.location);
        $('.f-man').text(item.man);
        $('.f-aerial').text(item.aerial);
        $('.f-terrain').text(item.terrain);
        $('.f-nature').text(item.natureza);
        $('.f-start').text(item.date + ' ' + item.hour);

        window.history.pushState('obj', 'newtitle', '/fogo/' + item.id);
        status(item.id);
        plot(item.id);
        danger(item.id);
        addPageview();
    });

}

function plot(id) {
    var url = 'https://fogos.pt/fires/data?id=' + id;
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            data = JSON.parse(data);
            if (data.success && data.data.length) {
                labels = [];
                var man = [];
                var terrain = [];
                var aerial = [];
                for (d in data.data) {
                    labels.push(data.data[d].label);
                    man.push(data.data[d].man);
                    terrain.push(data.data[d].terrain);
                    aerial.push(data.data[d].aerial);
                }

                var ctx = document.getElementById("myChart");
                var myLineChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Humanos',
                            data: man,
                            fill: false,
                            backgroundColor: '#EFC800',
                            borderColor: '#EFC800'
                        },
                            {
                                label: 'Aéreos',
                                data: aerial,
                                fill: false,
                                backgroundColor: '#4E88B2',
                                borderColor: '#4E88B2'
                            },
                            {
                                label: 'Terrestres',
                                data: terrain,
                                fill: false,
                                backgroundColor: '#6D720B',
                                borderColor: '#6D720B'
                            }]
                    },
                    options: {
                        elements: {
                            line: {
                                tension: 0, // disables bezier curves
                            }
                        },
                        scales: {
                            yAxes: [{
                                ticks: {}
                            }]
                        }
                    }
                });
            } else {
                $('#info').find('canvas').remove();
                $('#info').append('<p>Não há dados disponiveis</p> ');
            }
        }
    });

}


function status(id) {
    $('#status').empty();
    var url = '/views/status/' + id;
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            $('.f-status').html(data);
        }
    });
}

function danger(id) {
    var url = '/views/risk/' + id;
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            $('.f-danger').html(data);
        }
    });

}


function getColor(d) {
    return d === 1 ? '#509e2f' :
        d === 2 ? '#ffe900' :
            d === 3 ? '#e87722' :
                d === 4 ? '#cb333b' :
                    d === 5 ? '#6f263d' :
                        'rgb(255,  255,  255)';
}


function addRisk(mymap) {

    var concelhosStyle = {
        "color": "#ff7800",
        "weight": 2,
        "opacity": 1,
        "stroke": true,
        "fill": false
    };

    var concelhosLayer = L.geoJSON(concelhos, {
        style: concelhosStyle
    });

    var url = 'https://fogos.pt/v1/risk-today';
    $.ajax({
        url: url,
        method: 'GET',
        success: function (data) {
            data = JSON.parse(data);
            if (data.success) {
                var riscosHoje = L.geoJson(concelhos, {
                    style: function (feature) {
                        var d = data.data.local[feature.properties.DICO].data.rcm;
                        return {weight: 1.0, color: '#666', fillOpacity: 0.6, fillColor: getColor(d)};
                    },
                });

                overlayPane = {
                    "Concelhos": concelhosLayer,
                    "Risco Hoje": riscosHoje,
                };

                layerControl = L.control.layers(null, overlayPane, {position: 'topright'});
                layerControl.addTo(mymap);
            }
        }
    });
}

function addPageview() {
    if (window.ga) {
        ga('send', 'pageview', location.pathname);
    }
}