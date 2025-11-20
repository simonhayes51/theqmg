import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VenueMap = ({ venues, center = [54.978252, -1.61778], zoom = 10, height = '500px' }) => {
  // Filter venues that have coordinates
  const venuesWithCoords = venues.filter(v => v.latitude && v.longitude);

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
  const mapCenter = venuesWithCoords.length > 0 && !center
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
        {venuesWithCoords.map((venue) => (
          <Marker
            key={venue.id}
            position={[parseFloat(venue.latitude), parseFloat(venue.longitude)]}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-bold text-lg mb-2">{venue.name}</h3>
                {venue.address && (
                  <p className="text-sm text-gray-600">
                    {venue.address}
                    {venue.city && `, ${venue.city}`}
                    {venue.postcode && ` ${venue.postcode}`}
                  </p>
                )}
                {venue.phone && (
                  <p className="text-sm text-gray-600 mt-1">
                    📞 {venue.phone}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VenueMap;
