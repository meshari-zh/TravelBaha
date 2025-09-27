import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L, { LatLngExpression, LatLngTuple } from 'leaflet'
import { useState } from 'react'
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

// أماكن سياحية في الباحة
const touristPlaces = [
  {
    id: 1,
    name: 'جبل شدا الأعلى',
    lat: 19.8333,
    lng: 41.3167,
    description: 'جبل رائع يوفر إطلالة خلابة على المنطقة',
    website: ''
  },
  {
    id: 2,
    name: 'قرية ذي عين الأثرية',
    lat: 19.9289,
    lng: 41.4378,
    description: 'قرية تراثية مبنية بالحجر تعود للقرن العاشر الهجري',
    website: ''
  },
  {
    id: 3,
    name: 'منتزه رغدان',
    lat: 20.0158,
    lng: 41.4625,
    description: 'منتزه طبيعي جميل مع مساحات خضراء واسعة',
    website: ''
  },
  {
    id: 4,
    name: 'غابة رغدان',
    lat: 20.0200,
    lng: 41.4700,
    description: 'غابة كثيفة مثالية للمشي والاستجمام',
    website: ''
  }
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
  const [selectedPlace, setSelectedPlace] = useState<typeof touristPlaces[0] | null>(null)
  const [editingPlace, setEditingPlace] = useState<typeof touristPlaces[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [places, setPlaces] = useState(touristPlaces)

  // خطوط الطرق
  const roadToMecca: LatLngTuple[] = [
    [cities.albaha.lat, cities.albaha.lng],
    [20.5, 40.8],
    [21.0, 40.2],
    [cities.mecca.lat, cities.mecca.lng]
  ]

  const roadToRiyadh: LatLngTuple[] = [
    [cities.albaha.lat, cities.albaha.lng],
    [20.5, 42.0],
    [22.0, 44.0],
    [23.5, 45.5],
    [cities.riyadh.lat, cities.riyadh.lng]
  ]

  const handleUpdateWebsite = (placeId: number, website: string) => {
    setPlaces(prev => prev.map(place => 
      place.id === placeId ? { ...place, website } : place
    ))
    setIsDialogOpen(false)
    setEditingPlace(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            خريطة المملكة العربية السعودية
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            استكشف منطقة الباحة والمدن السعودية الرئيسية
          </p>
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
                    
                    {/* دائرة تركيز على الباحة */}
                    <Circle
                      center={[cities.albaha.lat, cities.albaha.lng]}
                      radius={30000}
                      fillColor="green"
                      fillOpacity={0.1}
                      color="green"
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

                    {/* علامات الأماكن السياحية */}
                    {places.map((place) => (
                      <Marker key={place.id} position={[place.lat, place.lng]} icon={touristIcon}>
                        <Popup>
                          <div className="p-3 min-w-[200px]">
                            <h3 className="font-bold text-lg mb-2">{place.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                            
                            <div className="flex flex-col gap-2">
                              {place.website && (
                                <a 
                                  href={place.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  زيارة الموقع
                                </a>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingPlace(place)
                                  setIsDialogOpen(true)
                                }}
                                className="text-xs"
                                data-testid={`button-edit-place-${place.id}`}
                              >
                                <Plus className="w-3 h-3 ml-1" />
                                {place.website ? 'تعديل الرابط' : 'إضافة رابط'}
                              </Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

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
                    <CardTitle className="text-lg">الأماكن السياحية</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {places.map((place) => (
                        <div key={place.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="font-medium">{place.name}</div>
                          {place.website && (
                            <a 
                              href={place.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              زيارة الموقع
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* نموذج إضافة/تعديل رابط الموقع */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlace?.website ? 'تعديل رابط الموقع' : 'إضافة رابط الموقع'}
              </DialogTitle>
            </DialogHeader>
            
            {editingPlace && (
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const website = formData.get('website') as string
                handleUpdateWebsite(editingPlace.id, website)
              }} className="space-y-4">
                <div>
                  <Label htmlFor="place-name">اسم المكان</Label>
                  <Input
                    id="place-name"
                    value={editingPlace.name}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">رابط الموقع</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                    defaultValue={editingPlace.website}
                    data-testid="input-website-url"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" data-testid="button-save-website">
                    حفظ
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}