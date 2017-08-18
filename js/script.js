//Set variables
var foursquareBaseURL = 'https://api.foursquare.com/v2/venues/search?ll='
var foursquareID = "FHQBKCL3EAF43I1M13253BF5ASCJUCHZ34NG5J3KPOLNAZVG";
var foursquareSecret = "SYMFBJTLBUXYLMQYCTUQRL3M5VEUKS1JIGZGGUOJQSAHUXLU";
var grandCayman = {lat: 19.3155684, lng: -81.356851}

//Load ViewModel
function ViewModel() {
    var self = this;
    //Sets location list
    self.snorkelList = ko.observableArray([]);
    //Receives value from search
    self.searchTerm = ko.observable("");

//Center Map View on Grand Cayman Island
    map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: grandCayman
});

//Location information passed to Foursquare
var Location = function(location) {
    var self = this;
    self.name = location.name;
    self.lat = location.lat;
    self.lng = location.lng;

    self.visible = ko.observable(true);

//Data feed into Foursquare
var foursquareURL = foursquareBaseURL + self.lat + ',' + self.lng + '&client_id=' + foursquareID + '&client_secret=' + foursquareSecret + '&v=20170817' + '&query=' + self.name;

// Receive data from Foursquare
$.getJSON(foursquareURL).done(function(location) {
    var results = location.response.venues[0];
    self.category = results.category;
        if (typeof self.category === 'undefined'){
            self.category = "";
    }
    self.address = results.location.formattedAddress[0];
    })

// If Foursquare (or my work) breaks
    .fail(function() {
        alert("Foursquare took some \"me\" time... please try again.");
    });

// Assuming nothing breaks, populates the InfoWindow data
    this.contentString = '<div class="info-window-content"><div class="title"><b>' + location.name + "</b></div>" +
        '<div class="content">' + self.address + "</div>";

    this.infoWindow = new google.maps.InfoWindow({content: self.contentString});

    this.marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: map,
            title: location.name
    });

    this.showMarker = ko.computed(function() {
        if(this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);


//Populate InfoWindow on click
    this.marker.addListener('click', function(){
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + location.name + "</b></div>" +
        '<div class="content">' + self.address + "</div>" +
        "</div>";

        self.infoWindow.close();
        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this);

//Add bounce animation to site marker icon
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

    snorkelList.forEach(function(snorkelSpot){
        self.snorkelList.push( new Location(snorkelSpot));
    });

//Displays Array (all or partial) based on search criteria
//Compares lower-case input to lower-case location (apples to apples) names to "knock out" search terms that don't apply
    this.filteredList = ko.computed( function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.snorkelList().forEach(function(snorkelSpot){
                snorkelSpot.visible(true);
            });
            return self.snorkelList();
        } else {
            return ko.utils.arrayFilter(self.snorkelList(), function(snorkelSpot) {
                var string = snorkelSpot.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                snorkelSpot.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
}

//Activates Knockout
function startApp() {
    ko.applyBindings(new ViewModel());
}

function mapError() {
    alert("The gnomes that make Google Maps work are napping. Please refresh.");
}