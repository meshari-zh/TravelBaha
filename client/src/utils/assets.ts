// Asset imports for place images
import dhiAinImg from "@assets/ذي عين_1757793151104.jpg";
import raghdanImg from "@assets/رغدان_1757793151105.jpg";
import hamdaWaterfallImg from "@assets/شلال الحمده_1757793151105.jpg";
import khairaWaterfallImg from "@assets/شلال خيره_1757793151106.jpg";
import ainJamalWaterfallImg from "@assets/شلال عين الجمل_1757793151106.jpg";
import khairaForestImg from "@assets/غابة خيره_1757793151107.jpg";
import bakhroshCastleImg from "@assets/قلعه بخروش_1757793151107.jpg";
import hussamParkImg from "@assets/منتزه الامير حسام_1757793151107.jpg";

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
  
  // Resolve @assets paths to imported URLs
  if (assetPath.startsWith('@assets/')) {
    return assetMap[assetPath] || defaultPlaceImage;
  }
  
  // For any other paths, return as-is (relative paths, etc.)
  return assetPath;
}