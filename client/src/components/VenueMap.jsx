import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom marker icon with better visibility
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path fill="#DC143C" stroke="#003DA5" stroke-width="2" d="M16 0C7.2 0 0 7.2 0 16c0 12 16 26 16 26s16-14 16-26c0-8.8-7.2-16-16-16z"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [12, 41]
});

const VenueMap = ({ venues, center = [54.978252, -1.61778], zoom = 10, height = '500px' }) => {
  // Filter venues that have coordinates
  const venuesWithCoords = venues.filter(v => v.latitude && v.longitude);

  console.log('VenueMap - Total venues:', venues.length);
  console.log('VenueMap - Venues with coordinates:', venuesWithCoords.length);
  console.log('VenueMap - Venues data:', venuesWithCoords);

  if (venuesWithCoords.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center" style={{ height }}>
        <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">No venues with map coordinates yet.</p>
        <p className="text-sm text-gray-500 mt-2">Add latitude and longitude to venues to display them on the map.</p>
      </div>
    );
  }

  // Calculate center if there are venues
  const mapCenter = venuesWithCoords.length > 0
    ? [
        venuesWithCoords.reduce((sum, v) => sum + parseFloat(v.latitude), 0) / venuesWithCoords.length,
        venuesWithCoords.reduce((sum, v) => sum + parseFloat(v.longitude), 0) / venuesWithCoords.length
      ]
    : center;

  return (
    <div className="rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venuesWithCoords.map((venue) => {
          const position = [parseFloat(venue.latitude), parseFloat(venue.longitude)];
          console.log(`Rendering marker for ${venue.name} at position:`, position);
          return (
            <Marker
              key={venue.id}
              position={position}
              icon={customIcon}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2 text-brit-navy">{venue.name}</h3>
                  {venue.address && (
                    <p className="text-sm text-gray-600 mb-1">
                      {venue.address}
                      {venue.city && `, ${venue.city}`}
                      {venue.postcode && ` ${venue.postcode}`}
                    </p>
                  )}
                  {venue.phone && (
                    <p className="text-sm text-gray-600 mt-2">
                      📞 {venue.phone}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default VenueMap;
