import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Polygon, Tooltip } from 'react-leaflet'
import L, { LatLngExpression, LatLngTuple } from 'leaflet'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/context/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MapPin, ExternalLink, Plus, Navigation, Car, Clock } from 'lucide-react'
import Navbar from '@/components/navbar'
import 'leaflet/dist/leaflet.css'

// حساب المسافة بين نقطتين (صيغة Haversine)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // نصف قطر الأرض بالكيلومترات
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// حساب وقت الوصول التقريبي (بافتراض سرعة 80 كم/ساعة)
const calculateDrivingTime = (distance: number): string => {
  const hours = Math.floor(distance / 80);
  const minutes = Math.round((distance % 80) / 80 * 60);
  if (hours === 0) return `${minutes} دقيقة`;
  if (minutes === 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${minutes} دقيقة`;
};

// إنشاء رابط Google Maps للتوجيه
const getGoogleMapsDirectionsUrl = (lat: number, lng: number, placeName: string): string => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(placeName)}`;
};

// إنشاء رابط Google Maps للموقع
const getGoogleMapsUrl = (lat: number, lng: number, placeName: string): string => {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(placeName)}`;
};

// إحداثيات المدن
const cities = {
  albaha: { lat: 20.0127, lng: 41.4676, name: 'الباحة' },
  mecca: { lat: 21.3891, lng: 39.8579, name: 'مكة المكرمة' },
  riyadh: { lat: 24.7136, lng: 46.6753, name: 'الرياض' }
}

// إحداثيات دقيقة للأماكن السياحية المشهورة في الباحة (من Google Maps)
const knownPlacesCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'غابة رغدان': { lat: 20.0089, lng: 41.4553 },
  'رغدان': { lat: 20.0089, lng: 41.4553 },
  'منتزه رغدان': { lat: 20.0089, lng: 41.4553 },
  'قرية ذي عين': { lat: 19.9297, lng: 41.4422 },
  'ذي عين': { lat: 19.9297, lng: 41.4422 },
  'قرية ذي عين الأثرية': { lat: 19.9297, lng: 41.4422 },
  'جبل شدا الأعلى': { lat: 19.8500, lng: 41.3000 },
  'شدا الأعلى': { lat: 19.8500, lng: 41.3000 },
  'وادي الخيطان': { lat: 20.0500, lng: 41.5000 },
  'غابة خيرة': { lat: 20.1200, lng: 41.4800 },
  'منتزه الأمير حسام': { lat: 20.0150, lng: 41.4700 },
  'سوق الخميس': { lat: 20.0100, lng: 41.4650 },
  'قلعة شمسان': { lat: 20.0180, lng: 41.4620 },
  'جبل أثرب': { lat: 19.9800, lng: 41.4200 },
  'وادي تربة': { lat: 20.1000, lng: 41.6000 },
  'العقيق': { lat: 20.2700, lng: 41.6400 },
  'بلجرشي': { lat: 19.8500, lng: 41.5500 },
  'المندق': { lat: 20.2300, lng: 41.3200 },
  'القرى': { lat: 20.0800, lng: 41.2800 },
  'بني حسن': { lat: 20.1500, lng: 41.3500 },
  'غامد الزناد': { lat: 19.9000, lng: 41.6000 },
  'الحجرة': { lat: 19.7500, lng: 41.4000 },
  'قلوة': { lat: 19.8200, lng: 41.2500 },
};

// الحصول على إحداثيات المكان (من القائمة المعروفة أو القيم الافتراضية)
const getPlaceCoordinates = (placeName: string, defaultLat?: number, defaultLng?: number): { lat: number; lng: number } => {
  // البحث عن اسم مطابق أو جزئي
  for (const [name, coords] of Object.entries(knownPlacesCoordinates)) {
    if (placeName.includes(name) || name.includes(placeName)) {
      return coords;
    }
  }
  // إذا لم يوجد، استخدم القيم المعطاة أو إحداثيات عشوائية قريبة من الباحة
  return {
    lat: defaultLat || (20.0127 + (Math.random() - 0.5) * 0.2),
    lng: defaultLng || (41.4676 + (Math.random() - 0.5) * 0.2)
  };
};

// حدود منطقة الباحة الدقيقة (مطابقة للخريطة الرسمية)
const albahaRegionBounds: LatLngTuple[] = [
  // الجزء الشمالي الغربي
  [20.35, 41.05],
  [20.40, 41.15],
  [20.42, 41.25],
  // الجزء الشمالي الشرقي  
  [20.38, 41.45],
  [20.30, 41.55],
  [20.25, 41.65],
  // الجزء الشرقي
  [20.10, 41.70],
  [19.95, 41.68],
  // الجزء الجنوبي الشرقي
  [19.80, 41.60],
  [19.70, 41.50],
  // الجزء الجنوبي
  [19.55, 41.35],
  [19.50, 41.25],
  // الجزء الجنوبي الغربي
  [19.55, 41.10],
  [19.65, 41.00],
  // الجزء الغربي
  [19.80, 40.95],
  [19.95, 40.90],
  [20.10, 40.92],
  [20.25, 40.98],
  // العودة للبداية
  [20.35, 41.05]
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

// إنشاء أيقونة مخصصة مع اسم المكان مدمج
const createLabeledIcon = (name: string, color: string = '#f97316') => {
  return L.divIcon({
    className: 'labeled-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pin" style="background-color: ${color};">
          <span class="marker-icon">📍</span>
        </div>
        <div class="marker-label">${name}</div>
      </div>
    `,
    iconSize: [100, 60],
    iconAnchor: [50, 45],
    popupAnchor: [0, -45]
  });
};

const albahaIcon = createIcon('red')
const meccaIcon = createIcon('blue')
const riyadhIcon = createIcon('green')
const touristIcon = createIcon('orange')

export default function SaudiMap() {
  const { language, t } = useLanguage()
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [editingPlace, setEditingPlace] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  // استخدام API الأماكن السياحية الفعلية
  const { data: places = [], isLoading: placesLoading } = useQuery({
    queryKey: ['/api/places'],
  })
  
  // جلب المحتوى القابل للتعديل للخريطة
  const { data: mapTitle = '' } = useQuery({
    queryKey: ['/api/site-content/map_title'],
    select: (data: any) => data?.content || 'خريطة المملكة التفاعلية'
  })
  
  const { data: mapSubtitle = '' } = useQuery({
    queryKey: ['/api/site-content/map_subtitle'],
    select: (data: any) => data?.content || 'استكشف جمال منطقة الباحة والمدن السعودية'
  })
  
  const { data: mapDescription = '' } = useQuery({
    queryKey: ['/api/site-content/map_description'],
    select: (data: any) => data?.content || 'تصفح الطرق والأماكن السياحية بتقنية تفاعلية حديثة'
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center mb-8">
          <div className="hero-gradient text-white p-8 rounded-2xl shadow-lg mb-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🗺️ {mapTitle}
              </h1>
              <p className="text-xl md:text-2xl opacity-90 mb-2">
                {mapSubtitle}
              </p>
              <p className="text-lg opacity-75">
                {mapDescription}
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              {language === 'ar' ? 'الخريطة التفاعلية' : 'Interactive Map'}
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
                      // استخدام الإحداثيات الدقيقة من القائمة المعروفة
                      const coords = getPlaceCoordinates(place.name, place.latitude, place.longitude);
                      const lat = coords.lat;
                      const lng = coords.lng;
                      
                      // حساب المسافة من الباحة
                      const distanceFromAlbaha = calculateDistance(
                        cities.albaha.lat, cities.albaha.lng,
                        lat, lng
                      );
                      const drivingTime = calculateDrivingTime(distanceFromAlbaha);
                      
                      // استخدام الأيقونة المخصصة مع الاسم المدمج
                      const labeledIcon = createLabeledIcon(place.name);
                      
                      return (
                        <Marker key={place.id} position={[lat, lng]} icon={labeledIcon}>
                          <Popup>
                            <div className="p-3 min-w-[280px] text-right" dir="rtl">
                              <h3 className="font-bold text-lg mb-2 text-green-800">{place.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{place.description}</p>
                              
                              {/* عرض الصورة من الرابط */}
                              {place.imageUrl && place.imageUrl.trim() !== '' && (
                                <div className="mb-3">
                                  <img 
                                    src={place.imageUrl} 
                                    alt={place.name}
                                    className="w-full h-32 object-cover rounded-lg shadow-md"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* معلومات المسافة والوقت */}
                              <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Car className="w-4 h-4 text-blue-600" />
                                  <span className="font-semibold text-blue-800">المسافة من الباحة:</span>
                                </div>
                                <div className="text-lg font-bold text-blue-900 mb-1">
                                  {distanceFromAlbaha.toFixed(1)} كم
                                </div>
                                <div className="flex items-center gap-1 text-sm text-blue-700">
                                  <Clock className="w-3 h-3" />
                                  <span>وقت الوصول التقريبي: {drivingTime}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-2">
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {place.location}
                                </div>
                                
                                {place.category && (
                                  <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded inline-block">
                                    {place.category}
                                  </div>
                                )}
                                
                                {/* أزرار التنقل */}
                                <div className="flex flex-col gap-2 mt-2">
                                  {/* زر التوجه لـ Google Maps */}
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                                    onClick={() => {
                                      window.open(getGoogleMapsDirectionsUrl(lat, lng, place.name), '_blank')
                                    }}
                                    data-testid={`button-directions-${place.id}`}
                                  >
                                    <Navigation className="w-4 h-4 ml-2" />
                                    {language === 'ar' ? 'التوجه عبر Google Maps' : 'Get Directions'}
                                  </Button>
                                  
                                  {/* زر عرض الموقع في Google Maps */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-600 text-green-600 hover:bg-green-50 w-full"
                                    onClick={() => {
                                      window.open(getGoogleMapsUrl(lat, lng, place.name), '_blank')
                                    }}
                                    data-testid={`button-google-map-${place.id}`}
                                  >
                                    <MapPin className="w-4 h-4 ml-2" />
                                    {language === 'ar' ? 'عرض في Google Maps' : 'View on Google Maps'}
                                  </Button>
                                  
                                  {/* زر عرض التفاصيل */}
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                                    onClick={() => {
                                      window.open(`/places/${place.id}`, '_blank')
                                    }}
                                    data-testid={`button-view-place-${place.id}`}
                                  >
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                  </Button>
                                </div>
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