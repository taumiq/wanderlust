console.log("Listing coordinates:", listing.geometry.coordinates);
console.log("Type:", typeof listing.geometry.coordinates);
console.log("Is Array:", Array.isArray(listing.geometry.coordinates));

var map = new maplibregl.Map({
    container: 'map',
    //style: 'https://api.maptiler.com/maps/streets/style.json?key=4jAiW2atdWAp2L5oC6Oj',
    style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=4jAiW2atdWAp2L5oC6Oj',
    
    //style: 'https://api.maptiler.com/maps/streets-v2/?key=4jAiW2atdWAp2L5oC6Oj#0.3/-5.26383/23.29287', // stylesheet location
    //center: [77.2090, 28.6139], // starting position [lng, lat]
    center: listing.geometry.coordinates,
    zoom: 9// starting zoom
  });

  


  
  const marker = new maplibregl.Marker({color: "red"})
          .setLngLat(listing.geometry.coordinates)
          .setPopup(new maplibregl.Popup({offset: 25})
          .setHTML(`<h4>${listing.title}, ${listing.location}</h4><p>Precise location shared upon booking.</p>`))
          .addTo(map);
    