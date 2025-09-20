// Asset imports for place images
import dhiAinImg from "@assets/ذي عين_1757793151104.jpg";
import raghdanImg from "@assets/رغدان_1757793151105.jpg";
import hamdaWaterfallImg from "@assets/شلال الحمده_1757793151105.jpg";
import khairaWaterfallImg from "@assets/شلال خيره_1757793151106.jpg";
import ainJamalWaterfallImg from "@assets/شلال عين الجمل_1757793151106.jpg";
import khairaForestImg from "@assets/غابة خيره_1757793151107.jpg";
import bakhroshCastleImg from "@assets/قلعه بخروش_1757793151107.jpg";
import hussamParkImg from "@assets/منتزه الامير حسام_1757793151107.jpg";

// Additional tourist attraction imports
import lavenderGardenImg from "@assets/حديقة الافندر_1757970030008.jpg";
import sultanParkImg from "@assets/حديقة الامير سلطان_1757970030009.jpg";
import aqiqDamImg from "@assets/سد وادي العقيق_1757970030010.jpg";
import sharashirWaterfallImg from "@assets/شلال الشراشير_1757970030010.jpg";
import shoulaWaterfallImg from "@assets/شلال الشوله11_1757970030011.jpg";
import ghadirWaterfallImg from "@assets/شلال الغدير_1757970030012.jpg";
import umDaqiqWaterfallImg from "@assets/شلال ام الدقيق_1757970030013.jpg";
import safaBaraqWaterfallImg from "@assets/شلال صفا البراق_1757970030013.jpg";
import ainJamalSpringImg from "@assets/عين الجمل_1757970030013.jpg";
import brothersMuseumImg from "@assets/متحف الاخوين_1757970030014.jpg";
import khalabParkImg from "@assets/منتزه الخلب_1757970030014.jpg";
import danaParkImg from "@assets/منتزه الدانه_1757970030015.jpg";
import sunriseParkImg from "@assets/منتزه الشروق_1757970030015.jpg";
import waterfallParkImg from "@assets/منتزه الشلال_1757970030015.jpg";
import janabeenDamParkImg from "@assets/منتزه سد الجنابين_1757970030016.jpg";
import heritageInnImg from "@assets/نزل العائد التراثي_1757970030016.jpg";
import qadhaValleyImg from "@assets/وادي القدحة_1757970030017.jpg";
import qadhaValleyMasirImg from "@assets/وادي القدحه بمسير_1757970030017.jpg";
import turbaZahranValleyImg from "@assets/وادي تربه زهران_1757970030017.jpg";
import thuradValleyImg from "@assets/وادي ثراد_1757970030018.jpg";

// Map of asset paths to imported URLs
const assetMap: Record<string, string> = {
  "@assets/ذي عين_1757793151104.jpg": dhiAinImg,
  "@assets/رغدان_1757793151105.jpg": raghdanImg,
  "@assets/شلال الحمده_1757793151105.jpg": hamdaWaterfallImg,
  "@assets/شلال خيره_1757793151106.jpg": khairaWaterfallImg,
  "@assets/شلال عين الجمل_1757793151106.jpg": ainJamalWaterfallImg,
  "@assets/غابة خيره_1757793151107.jpg": khairaForestImg,
  "@assets/قلعه بخروش_1757793151107.jpg": bakhroshCastleImg,
  "@assets/منتزه الامير حسام_1757793151107.jpg": hussamParkImg,
  
  // Additional tourist attractions
  "@assets/حديقة الافندر_1757970030008.jpg": lavenderGardenImg,
  "@assets/حديقة الامير سلطان_1757970030009.jpg": sultanParkImg,
  "@assets/سد وادي العقيق_1757970030010.jpg": aqiqDamImg,
  "@assets/شلال الشراشير_1757970030010.jpg": sharashirWaterfallImg,
  "@assets/شلال الشوله11_1757970030011.jpg": shoulaWaterfallImg,
  "@assets/شلال الغدير_1757970030012.jpg": ghadirWaterfallImg,
  "@assets/شلال ام الدقيق_1757970030013.jpg": umDaqiqWaterfallImg,
  "@assets/شلال صفا البراق_1757970030013.jpg": safaBaraqWaterfallImg,
  "@assets/عين الجمل_1757970030013.jpg": ainJamalSpringImg,
  "@assets/متحف الاخوين_1757970030014.jpg": brothersMuseumImg,
  "@assets/منتزه الخلب_1757970030014.jpg": khalabParkImg,
  "@assets/منتزه الدانه_1757970030015.jpg": danaParkImg,
  "@assets/منتزه الشروق_1757970030015.jpg": sunriseParkImg,
  "@assets/منتزه الشلال_1757970030015.jpg": waterfallParkImg,
  "@assets/منتزه سد الجنابين_1757970030016.jpg": janabeenDamParkImg,
  "@assets/نزل العائد التراثي_1757970030016.jpg": heritageInnImg,
  "@assets/وادي القدحة_1757970030017.jpg": qadhaValleyImg,
  "@assets/وادي القدحه بمسير_1757970030017.jpg": qadhaValleyMasirImg,
  "@assets/وادي تربه زهران_1757970030017.jpg": turbaZahranValleyImg,
  "@assets/وادي ثراد_1757970030018.jpg": thuradValleyImg,
};

// Default fallback image for unknown assets
const defaultPlaceImage = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';

/**
 * Resolves asset paths to actual URLs
 * @param assetPath - The asset path from the database (e.g., "@assets/image.jpg")
 * @returns The resolved URL or fallback image
 */
export function resolveAssetUrl(assetPath: string | null | undefined): string {
  if (!assetPath) {
    return defaultPlaceImage;
  }
  
  // If it's already a full URL, return as-is
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }
  
  // Resolve @assets paths to server static route
  if (assetPath.startsWith('@assets/')) {
    // Convert @assets/filename.jpg to /assets/filename.jpg
    const filename = assetPath.replace('@assets/', '');
    return `/assets/${filename}`;
  }
  
  // Support legacy /images paths by ensuring they're preserved
  if (assetPath.startsWith('/images/')) {
    return assetPath;
  }
  
  // For any other paths, return as-is (relative paths, etc.)
  return assetPath;
}