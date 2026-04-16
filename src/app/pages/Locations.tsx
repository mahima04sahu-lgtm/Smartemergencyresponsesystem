import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MapPin, Building, Plane } from 'lucide-react';
import { MOCK_LOCATIONS } from '../utils/mockData';

export function Locations() {
  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'hotel': return Building;
      case 'resort': return Building;
      case 'airport': return Plane;
      default: return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Locations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LOCATIONS.map(location => {
            const Icon = getLocationIcon(location.type);
            return (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        {location.name}
                      </CardTitle>
                      <Badge variant="secondary" className="mt-2 capitalize">
                        {location.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-sm">{location.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Zones ({location.zones.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {location.zones.map(zone => (
                          <Badge key={zone} variant="outline" className="text-xs">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">Location ID: {location.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
