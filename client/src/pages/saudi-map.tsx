import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon } from 'react-leaflet'
import L, { LatLngExpression, LatLngTuple } from 'leaflet'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MapPin, ExternalLink, Plus } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// إحداثيات المدن
const cities = {
  albaha: { lat: 20.0127, lng: 41.4676, name: 'الباحة' },
  mecca: { lat: 21.3891, lng: 39.8579, name: 'مكة المكرمة' },
  riyadh: { lat: 24.7136, lng: 46.6753, name: 'الرياض' }
}

// حدود منطقة الباحة التقريبية
const albahaRegionBounds: LatLngTuple[] = [
  [20.5, 41.0],
  [20.6, 41.3],
  [20.4, 41.7],
  [20.1, 41.8],
  [19.8, 41.6],
  [19.6, 41.3],
  [19.7, 41.0],
  [19.9, 40.8],
  [20.2, 40.9],
  [20.5, 41.0]
]

// إنشاء أيقونات مخصصة
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const albahaIcon = createIcon('red')
const meccaIcon = createIcon('blue')
const riyadhIcon = createIcon('green')
const touristIcon = createIcon('orange')

export default function SaudiMap() {
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [editingPlace, setEditingPlace] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // استخدام API الأماكن السياحية الفعلية
  const { data: places = [], isLoading: placesLoading } = useQuery({
    queryKey: ['/api/places'],
  })
  
  // التأكد من أن places هو مصفوفة
  const placesArray = Array.isArray(places) ? places : []

  // خطوط الطرق المحسنة والأكثر دقة
  const roadToMecca: LatLngTuple[] = [
    [cities.albaha.lat, cities.albaha.lng],
    [20.0, 41.2],
    [19.9, 41.0],
    [19.8, 40.8],
    [20.1, 40.6],
    [20.4, 40.4],
    [20.7, 40.2],
    [21.0, 40.0],
    [21.2, 39.9],
    [cities.mecca.lat, cities.mecca.lng]
  ]

  const roadToRiyadh: LatLngTuple[] = [
    [cities.albaha.lat, cities.albaha.lng],
    [20.2, 41.8],
    [20.5, 42.2],
    [21.0, 42.8],
    [21.5, 43.5],
    [22.2, 44.2],
    [22.8, 44.8],
    [23.2, 45.2],
    [23.6, 45.6],
    [24.0, 46.0],
    [24.3, 46.3],
    [cities.riyadh.lat, cities.riyadh.lng]
  ]

  const handleUpdateWebsite = (placeId: string, website: string) => {
    // لا نحتاج setPlaces لأننا نستخدم API الآن
    setIsDialogOpen(false)
    setEditingPlace(null)
    // يمكن إضافة API call لتحديث الموقع هنا لاحقاً
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="hero-gradient text-white p-8 rounded-2xl shadow-lg mb-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🗺️ خريطة المملكة التفاعلية
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-2">
                استكشف جمال منطقة الباحة والمدن السعودية
              </p>
              <p className="text-lg opacity-75">
                تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              الخريطة التفاعلية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-4 gap-6">
              {/* الخريطة */}
              <div className="lg:col-span-3">
                <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <MapContainer
                    center={[cities.albaha.lat, cities.albaha.lng]}
                    zoom={8}
                    style={{ height: '100%', width: '100%' }}
                    data-testid="saudi-map"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* حدود منطقة الباحة المبرزة */}
                    <Polygon
                      positions={albahaRegionBounds}
                      pathOptions={{
                        fillColor: '#22c55e',
                        fillOpacity: 0.2,
                        color: '#16a34a',
                        weight: 3,
                        opacity: 0.8
                      }}
                    />
                    
                    {/* دائرة إضافية للتركيز على مركز الباحة */}
                    <Circle
                      center={[cities.albaha.lat, cities.albaha.lng]}
                      radius={15000}
                      fillColor="#22c55e"
                      fillOpacity={0.15}
                      color="#16a34a"
                      weight={2}
                    />

                    {/* علامات المدن الرئيسية */}
                    <Marker position={[cities.albaha.lat, cities.albaha.lng]} icon={albahaIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <h3 className="font-bold text-lg">{cities.albaha.name}</h3>
                          <p className="text-sm">عاصمة منطقة الباحة</p>
                          <p className="text-xs text-gray-600">منطقة سياحية رائعة بمناخ معتدل</p>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[cities.mecca.lat, cities.mecca.lng]} icon={meccaIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <h3 className="font-bold text-lg">{cities.mecca.name}</h3>
                          <p className="text-sm">أقدس مدينة في الإسلام</p>
                          <p className="text-xs text-gray-600">قبلة المسلمين في العالم</p>
                        </div>
                      </Popup>
                    </Marker>

                    <Marker position={[cities.riyadh.lat, cities.riyadh.lng]} icon={riyadhIcon}>
                      <Popup>
                        <div className="text-center p-2">
                          <h3 className="font-bold text-lg">{cities.riyadh.name}</h3>
                          <p className="text-sm">عاصمة المملكة العربية السعودية</p>
                          <p className="text-xs text-gray-600">المركز السياسي والاقتصادي</p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* علامات الأماكن السياحية من قاعدة البيانات */}
                    {!placesLoading && placesArray.map((place: any) => {
                      // استخدام إحداثيات عشوائية قريبة من الباحة للأماكن بدون إحداثيات
                      const lat = place.latitude || (20.0127 + (Math.random() - 0.5) * 0.3)
                      const lng = place.longitude || (41.4676 + (Math.random() - 0.5) * 0.3)
                      
                      return (
                        <Marker key={place.id} position={[lat, lng]} icon={touristIcon}>
                          <Popup>
                            <div className="p-3 min-w-[250px] text-right">
                              <h3 className="font-bold text-lg mb-2 text-green-800">{place.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{place.description}</p>
                              
                              {place.imageUrl && (
                                <img 
                                  src={place.imageUrl} 
                                  alt={place.name}
                                  className="w-full h-24 object-cover rounded-md mb-2"
                                />
                              )}
                              
                              <div className="flex flex-col gap-2">
                                <div className="text-xs text-gray-500">
                                  📍 {place.location}
                                </div>
                                
                                {place.category && (
                                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {place.category}
                                  </div>
                                )}
                                
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => {
                                    window.open(`/places/${place.id}`, '_blank')
                                  }}
                                  data-testid={`button-view-place-${place.id}`}
                                >
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                  عرض التفاصيل
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                    })}

                    {/* خط الطريق إلى مكة (أحمر) */}
                    <Polyline 
                      positions={roadToMecca} 
                      color="red" 
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 10"
                    />

                    {/* خط الطريق إلى الرياض (أزرق) */}
                    <Polyline 
                      positions={roadToRiyadh} 
                      color="blue" 
                      weight={4}
                      opacity={0.8}
                      dashArray="10, 10"
                    />
                  </MapContainer>
                </div>
              </div>

              {/* شرح الخريطة */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">دليل الخريطة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">الباحة (المنطقة المركزية)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">مكة المكرمة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">الرياض</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span className="text-sm">أماكن سياحية</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-red-500"></div>
                      <span className="text-sm">طريق الباحة - مكة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-blue-500"></div>
                      <span className="text-sm">طريق الباحة - الرياض</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">الأماكن السياحية في الباحة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {placesLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">جاري تحميل الأماكن...</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {placesArray.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">لا توجد أماكن سياحية</p>
                        ) : (
                          placesArray.map((place: any) => (
                            <div key={place.id} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border">
                              <div className="flex items-start gap-3">
                                {place.imageUrl && (
                                  <img 
                                    src={place.imageUrl} 
                                    alt={place.name}
                                    className="w-12 h-12 object-cover rounded-md"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-green-800 dark:text-green-200">{place.name}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">📍 {place.location}</div>
                                  {place.category && (
                                    <div className="text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded mt-1 inline-block">
                                      {place.category}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}