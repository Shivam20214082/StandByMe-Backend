mapboxgl.accessToken ="pk.eyJ1Ijoic3ViaGFtcHJlZXQiLCJhIjoiY2toY2IwejF1MDdodzJxbWRuZHAweDV6aiJ9.Ys8MP5kVTk5P9V2TDvnuDg";

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
  })
  
  function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude])
  }
  
  function errorLocation() {
    setupMap([-2.24, 53.48])
  }
  
  function setupMap(center) {
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: center,
      zoom: 15
    })
  
    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav)
  
    var directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken
    })
  
    map.addControl(directions, "top-left")
  }


  function logout() {
    fetch("/logout")
      .then(() => {
        // reload the page after logging out
        window.location.reload();
        window.location.href = "/";
      })
      .catch((error) => console.error(error));
  }

  function redirectToNewPage() {
    window.location.href = "/login";
  }
  function direct() {
    window.location.href = "/dashboard";
  }


  // Function to get the user's location
  function showLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendEmergencySMS);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  // Function to send emergency SMS
  function sendEmergencySMS(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const request = new XMLHttpRequest();
    request.open("POST", "/send-emergency-sms", true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        console.log("Emergency SMS sent successfully.");
      }
    };

    const data = JSON.stringify({
      latitude: latitude,
      longitude: longitude,
    });

    request.send(data);
  }