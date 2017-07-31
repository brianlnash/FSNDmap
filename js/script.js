'use strict';

var initialLocations = [
    {
    name: "Smith's Barcadere",
    lat: 19.276628,
    lng: -81.390988,
    },
    {
    name: "Cemetery Beach",
    lat: 19.3656096,
    lng: -81.3953804,
    },
    {
    name: "Rum Point Beach",
    lat: 19.368535,
    lng: -81.276545,
    },
    {
    name: "Turtle Reef",
    lat: 19.3824723,
    lng: -81.4166321,
    },
    {
    name: "Cheeseburger Reef",
    lat: 19.3035886,
    lng: -81.3849887,
    },
];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;


var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.URL = "";
    this.street = "";
    this.city = "";
    this.phone = "";

    this.visible = ko.observable(true);

    var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll='+ this.lat + ',' + this.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20170730' + '&query=' + this.name;

    $.getJSON(foursquareURL).done(function(data) {
        var results = data.response.venues[0];
        self.URL = results.url;
        if (typeof self.URL === 'undefined'){
            self.URL = "";
        }
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.phone = results.contact.phone;
        if (typeof self.phone === 'undefined'){
            self.phone = "";
        } else {
            self.phone = formatPhone(self.phone);
        }
    }).fail(function() {
        alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
    });

    this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content">' + self.phone + "</div></div>";

    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(data.lat, data.lng),
            map: map,
            title: data.name
    });

    this.showMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function(){
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content"><a href="' + self.URL +'">' + self.URL + "</a></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>" +
        '<div class="content"><a href="tel:' + self.phone +'">' + self.phone +"</a></div></div>";

        self.infoWindow.setContent(self.contentString);

        self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function AppViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map-canvas'), {
            zoom: 12,
            center: {lat: 19.3155684, lng: -81.356851}
    });

    // Foursquare API settings
    clientID = "FHQBKCL3EAF43I1M13253BF5ASCJUCHZ34NG5J3KPOLNAZVG";
    clientSecret = "SYMFBJTLBUXYLMQYCTUQRL3M5VEUKS1JIGZGGUOJQSAHUXLU";

    initialLocations.forEach(function(locationItem){
        self.locationList.push( new Location(locationItem));
    });

    this.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem){
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
}

function startApp() {
    ko.applyBindings(new AppViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}