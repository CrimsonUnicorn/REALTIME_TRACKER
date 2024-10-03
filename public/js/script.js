const socket = io();

//if navigator.geolocation is available
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("sendLocation", { latitude, longitude }); //send location to server with "sendLocation" event
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
} else {
  console.log("Geolocation is not available");
}
//map initialization
const map = L.map("map").setView([0, 0], 16);

//add openstreetmap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap ",
}).addTo(map);
// L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
//   attribution: "Humanitarian OpenStreetMap",
// }).addTo(map);

//add marker
const markers = {};

//receive location from server with "receiveLocation" event
socket.on("receiveLocation", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude], 16);
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  }
});

//remove marker when user disconnects
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
