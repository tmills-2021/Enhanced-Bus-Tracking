mapboxgl.accessToken = 'pk.eyJ1IjoidG1pbGxzMzMiLCJhIjoiY2tzOXI3ejhuMGJoeDJ3cDU5eXA0YmljcSJ9.-oFdA3QXyc_TfzzqFICNdg';

var map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11',
	center: [-71.104081,42.365554],
	zoom: 14
});

map.on('load', () => {
    map.addSource('busStops', {
        'type': 'geojson',
        data: {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": {"description": "Start"},
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        -71.091542, 
                        42.358862
                    ]
                }
            }]
        }
    });

	map.addLayer({
		'id': 'busStops',
		'type': 'circle',
		'source': 'busStops',
		'paint': {
			'circle-color': '#4264fb',
			'circle-radius': 6,
			'circle-stroke-width': 2,
			'circle-stroke-color': '#ffffff'
		}
	});
    run();
	setInterval(run, 15000);
});

const busColors = {
	'EMPTY': '#00ff00',
 	'MANY_SEATS_AVAILABLE': '#91df00',
	'FEW_SEATS_AVAILABLE': '#c4ba00',
	'STANDING_ROOM_ONLY': '#e59100',
	'CRUSHED_STANDING_ROOM_ONLY': '#f96000',
	'FULL': '#ff0000',
	'NOT_ACCEPTING_PASSENGERS': '#ff0000',
	'NO_DATA_AVAILABLE': '#000000',
	'NOT_BOARDABLE': '#000000'
}

async function run(){
    // get bus data    
	const locations = await getBusLocations();
	console.log(new Date());
	console.log(locations);

    let busStops = [];
	let bounds = new mapboxgl.LngLatBounds();

    locations.forEach((stops,i) => {
		let busID = stops['attributes']['label'];
		let busOccupancy = stops['attributes']['occupancy_status'];
		let busLatitude = stops['attributes']['latitude'];
		let busLongitude = stops['attributes']['longitude'];
        busStops.push({
            "type": "Feature",
			"geometry": {
                "type": "Point",
                "coordinates": [busLongitude, busLatitude]
            },
            "properties": {
                "Bus": busID,
				"marker-color": busColors[busOccupancy],
				"marker-symbol": "bus"
            }
        })
		
		bounds.extend([busLongitude, busLatitude]);

    });

	const geojson = {
        "type": "FeatureCollection", "features": busStops
    }

	map.getSource('busStops').setData(geojson);
	map.fitBounds(bounds, { padding: 100 });
	mapbox.featureLayer().setGeoJSON(geojson).addTo(map);

	
}

// Request bus data from MBTA
async function getBusLocations(){
	const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip';
	const response = await fetch(url);
	const json     = await response.json();
	return json.data;
}