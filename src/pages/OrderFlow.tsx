import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  Search,
  Plus,
  Minus,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ChefHat,
  Package,
  X,
  User,
  MapPin,
  Users,
  Star,
  Sparkles,
  Flame,
  Coffee,
  IceCream,
  Pizza,
  Soup,
  Utensils,
  Award,
  ShieldCheck,
  Truck,
  Trash2,
  Lock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  FileText,
  Phone,
  Mail,
  ClipboardList,
  Tag,
  Pencil,
  Building2,
  CheckCircle2,
  Crown,
  Layers,
  Leaf,
  UtensilsCrossed,
  Calculator,
  Info,
} from "lucide-react";
import { DEMO_CATERERS } from "../data";
import { toast } from "../components/Toast";
import { useAuth } from "../contexts/AuthContext";
import { storeNotification } from "../lib/orderUtils";
import { saveWithSupabaseSync } from "../lib/supabase";
import { MapPickerModal } from "../components/MapPickerModal";
import { AddressAutocomplete } from "../components/AddressAutocomplete";

const getCategoryIcon = (categoryName: string) => {
  const norm = categoryName.toLowerCase();
  if (norm.includes("starter") || norm.includes("appetizer")) {
    return <Sparkles size={18} />;
  }
  if (
    norm.includes("bread") ||
    norm.includes("roti") ||
    norm.includes("naan") ||
    norm.includes("rumali")
  ) {
    return <Coffee size={18} />;
  }
  if (norm.includes("sweet") || norm.includes("dessert")) {
    return <Award size={18} />;
  }
  if (
    norm.includes("biryani") ||
    norm.includes("rice") ||
    norm.includes("pulao")
  ) {
    return <Soup size={18} />;
  }
  if (
    norm.includes("curry") ||
    norm.includes("gravy") ||
    norm.includes("sabji")
  ) {
    return <Utensils size={18} />;
  }
  if (norm.includes("fry") || norm.includes("dry")) {
    return <Flame size={18} />;
  }
  if (norm.includes("ice cream")) {
    return <IceCream size={18} />;
  }
  return <Pizza size={18} />;
};

const getFoodImage = (itemName: string) => {
  const name = itemName.toLowerCase();

  if (name.includes("spring roll")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("gobi 65") ||
    name.includes("gobi") ||
    name.includes("cauliflower")
  ) {
    return "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("manchurian")) {
    return "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("nugget")) {
    return "https://images.unsplash.com/photo-1562967914-608f82629710?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("gold coin") || name.includes("coin")) {
    return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("samosa")) {
    return "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("bajji") ||
    name.includes("bhaji") ||
    name.includes("pakora") ||
    name.includes("fritter")
  ) {
    return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("paneer") &&
    (name.includes("tikka") || name.includes("kabab"))
  ) {
    return "https://images.unsplash.com/photo-1567184109411-47a7a3746aed?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("paneer") &&
    (name.includes("butter") ||
      name.includes("masala") ||
      name.includes("curry"))
  ) {
    return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("chicken") && name.includes("65")) {
    return "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("chicken") ||
    name.includes("mutton") ||
    name.includes("fish") ||
    name.includes("prawn")
  ) {
    return "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("roti") ||
    name.includes("naan") ||
    name.includes("bread") ||
    name.includes("paratha") ||
    name.includes("kulcha")
  ) {
    return "https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("biryani") ||
    name.includes("pulao") ||
    name.includes("rice") ||
    name.includes("fried rice")
  ) {
    return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("dal") ||
    name.includes("dall") ||
    name.includes("tadka") ||
    name.includes("makhani")
  ) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("sweet") ||
    name.includes("gulab") ||
    name.includes("jamun") ||
    name.includes("halwa") ||
    name.includes("kheer")
  ) {
    return "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=450&auto=format&fit=crop&q=80";
  }
  if (name.includes("ice cream") || name.includes("kulfi")) {
    return "https://images.unsplash.com/photo-1501443712940-3decff3f6d90?w=450&auto=format&fit=crop&q=80";
  }
  if (
    name.includes("curry") ||
    name.includes("masala") ||
    name.includes("kofta") ||
    name.includes("korma")
  ) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=450&auto=format&fit=crop&q=80";
  }

  const placeholders = [
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=450&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=450&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=450&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=450&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=450&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=450&auto=format&fit=crop&q=80",
  ];
  const charSum = itemName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return placeholders[Math.abs(charSum) % placeholders.length];
};

const getFoodDescription = (itemName: string): string => {
  const name = itemName.toLowerCase().trim();

  if (name.includes("paneer butter masala")) {
    return "Fresh cottage cheese cubes cooked in creamy tomato gravy.";
  }
  if (name.includes("chicken 65")) {
    return "Spicy South Indian fried chicken appetizer.";
  }
  if (name.includes("paneer") && name.includes("tikka")) {
    return "Delectable cottage cheese chunks marinated in spiced yogurt and grilled to golden perfection.";
  }
  if (name.includes("paneer")) {
    return "Fresh cottage cheese cubes cooked in rich tomato and butter-infused legacy gravy.";
  }
  if (
    name.includes("chicken") &&
    (name.includes("tikka") ||
      name.includes("tandoori") ||
      name.includes("kebab") ||
      name.includes("kabab"))
  ) {
    return "Tender juicy chicken chunks cooked in traditional clay oven with secret blends of spices.";
  }
  if (
    name.includes("chicken") &&
    (name.includes("masala") ||
      name.includes("butter") ||
      name.includes("curry") ||
      name.includes("gravy"))
  ) {
    return "Homestyle juicy chicken pieces slow-cooked in a rich spiced traditional curry mixture.";
  }
  if (name.includes("chicken")) {
    return "Crispy seasoned chicken preparation garnished with chopped herbs and fresh curry leaves.";
  }
  if (name.includes("gobi") || name.includes("cauliflower")) {
    return "Fresh cauliflower florets seasoned with handpicked spices and cooked crispy.";
  }
  if (name.includes("manchurian")) {
    return "Crispy savory fritters tossed in classic sweet, sour, and mildly spicy Indo-Chinese sauce.";
  }
  if (name.includes("spring roll")) {
    return "Golden crispy wrappers stuffed with seasoned julienned fresh farm vegetables.";
  }
  if (name.includes("samosa")) {
    return "Crispy golden pastry triangles shell filled with spiced peas and mashed potatoes.";
  }
  if (name.includes("biryani")) {
    return "Fragrant basmati rice layered with rich herbs, saffron, and slow-cooked in traditional style.";
  }
  if (name.includes("pulao") || name.includes("fried rice")) {
    return "Aromatic long-grain basmati rice tossed with fresh garden vegetables and mild spices.";
  }
  if (name.includes("rice") || name.includes("jeera")) {
    return "Steaming aromatic basmati rice tossed with roasted cumin seeds and fresh herbs.";
  }
  if (
    name.includes("dal") ||
    name.includes("tadka") ||
    name.includes("makhani")
  ) {
    return "Slow-cooked lentils with fresh cream, melted butter, and tempered with cumin and garlic.";
  }
  if (
    name.includes("roti") ||
    name.includes("naan") ||
    name.includes("paratha") ||
    name.includes("kulcha") ||
    name.includes("bread")
  ) {
    return "Freshly baked traditional flatbread prepared in a hot tandoor clay oven.";
  }
  if (name.includes("jamun") || name.includes("gulab")) {
    return "Golden fried milk-solid dumplings soaked in aromatic rose and cardamom flavored sugar syrup.";
  }
  if (name.includes("halwa")) {
    return "Warm premium traditional dessert cooked slow with ghee, milk solids, and dry fruits.";
  }
  if (name.includes("ice cream") || name.includes("kulfi")) {
    return "Rich, creamy frozen dessert churned with authentic culinary flavors and sweet delight.";
  }
  if (name.includes("fruit") || name.includes("salad")) {
    return "Assortment of fresh seasonal garden fruits dressed with dynamic light sweet syrups.";
  }
  if (name.includes("soup") || name.includes("shorba")) {
    return "Warm comforting seasoned broth infused with fine herbs and aromatic local spices.";
  }
  if (name.includes("dry") || name.includes("fry")) {
    return "Roasted to perfection in a traditional hot wok with authentic Indian spices.";
  }

  const genericDescriptions = [
    "Traditional chef special preparation crafted with handpicked high-quality local ingredients.",
    "Carefully crafted culinary highlight seasoned with authentic fresh herbs and house spices.",
    "A delicious classic preparation designed to delight your senses with every single bite.",
    "Perfectly balanced premium recipe slow-cooked to lock in rich authentic textures and flavor.",
  ];

  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const descIdx = Math.abs(hash) % genericDescriptions.length;
  return `Authentic ${itemName}. ${genericDescriptions[descIdx]}`;
};

const isItemPremium = (itemName: string): boolean => {
  const name = itemName.toLowerCase();
  return (
    name.includes("biryani") ||
    name.includes("mutton") ||
    name.includes("fish") ||
    name.includes("prawn") ||
    name.includes("royal") ||
    name.includes("deluxe") ||
    name.includes("premium") ||
    name.includes("tikka") ||
    name.includes("kabab") ||
    name.includes("kebab") ||
    name.includes("special") ||
    name.includes("butter") ||
    name.includes("paneer") ||
    name.includes("tandoori")
  );
};

const isItemNonVeg = (itemName: string, categoryName: string = ""): boolean => {
  const name = itemName.toLowerCase().trim();
  const cat = categoryName.toLowerCase().trim();
  if (
    cat.includes("non-veg") ||
    cat.includes("non veg") ||
    cat.includes("mutton") ||
    cat.includes("chicken") ||
    cat.includes("fish") ||
    cat.includes("egg")
  ) {
    return true;
  }
  return (
    name.includes("chicken") ||
    name.includes("mutton") ||
    name.includes("fish") ||
    name.includes("prawn") ||
    name.includes("egg") ||
    (name.includes("kebab") &&
      !name.includes("veg") &&
      !name.includes("paneer") &&
      !name.includes("gobi") &&
      !name.includes("hara bhara"))
  );
};

const isCategoryNonVeg = (categoryName: string = "", items: string[] = []): boolean => {
  const cat = categoryName.toLowerCase().trim();
  if (
    cat.includes("non-veg") ||
    cat.includes("non veg") ||
    cat.includes("nonveg") ||
    cat.includes("chicken") ||
    cat.includes("mutton") ||
    cat.includes("fish") ||
    cat.includes("prawn") ||
    cat.includes("seafood") ||
    cat.includes("meat") ||
    cat.includes("egg") ||
    cat.includes("keema")
  ) {
    return true;
  }
  if (cat.includes("veg")) {
    return false;
  }
  if (items.length > 0 && items.every((item) => isItemNonVeg(item, categoryName))) {
    return true;
  }
  return false;
};

const VegLeafIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" />
  </svg>
);

const NonVegDrumstickIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M15.4 3.6c-2.6 0-4.9 1.6-5.8 4-.7 1.8-.4 3.8.5 5.4L5.5 17.6a1.9 1.9 0 0 1-1.9-.4 1.5 1.5 0 0 0-2.1 2.1c.5.5 1.2.7 1.9.6-.1.7.1 1.4.6 1.9a1.5 1.5 0 0 0 2.1-2.1 1.9 1.9 0 0 1-.4-1.9l4.6-4.6c1.6.9 3.6 1.2 5.4.5 2.4-.9 4-3.2 4-5.8 0-2.4-1.9-4.3-4.3-4.3Z" />
  </svg>
);

const getItemPrice = (itemName: string, categoryName: string = ""): number => {
  const lower = itemName.toLowerCase().trim();
  // Exact prices matching reference image:
  if (lower.includes("fresh lime")) return 50;
  if (lower.includes("guava punch")) return 60;
  if (lower.includes("virgin mojito")) return 70;
  if (lower.includes("sweet lassi") || lower.includes("salted lassi")) return 50;
  if (lower.includes("mango juice")) return 60;
  if (lower.includes("orange juice")) return 60;
  if (lower.includes("watermelon")) return 50;
  if (lower.includes("masala chaas") || lower.includes("chaas") || lower.includes("butter milk")) return 40;
  if (lower.includes("pineapple")) return 60;
  if (lower.includes("fruit punch") || lower.includes("rose milk") || lower.includes("badam milk")) return 60;
  if (lower.includes("blue lagoon") || lower.includes("smoothie") || lower.includes("kiwi")) return 70;
  if (lower.includes("jal jeera") || lower.includes("aam panna")) return 50;
  if (lower.includes("cold coffee") || lower.includes("mint lemon")) return 50;
  if (lower.includes("mocktail")) return 70;

  // Curries, Breads & Rice, Desserts:
  if (lower.includes("biryani") || lower.includes("mutton") || lower.includes("prawn")) return 120;
  if (lower.includes("chicken") || lower.includes("fish")) return 90;
  if (lower.includes("paneer") || lower.includes("tikka") || lower.includes("kebab") || lower.includes("kabab")) return 80;
  if (lower.includes("kofta") || lower.includes("korma") || lower.includes("curry") || lower.includes("masala")) return 70;
  if (lower.includes("ice cream") || lower.includes("gulab") || lower.includes("halwa") || lower.includes("sweet") || lower.includes("dessert")) return 60;
  if (lower.includes("naan") || lower.includes("roti") || lower.includes("kulcha") || lower.includes("bread")) return 40;
  if (lower.includes("dal") || lower.includes("rice") || lower.includes("sambar") || lower.includes("raita") || lower.includes("salad")) return 40;

  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    hash = (hash << 5) - hash + itemName.charCodeAt(i);
    hash |= 0;
  }
  const tiers = [40, 50, 60, 70, 80];
  return tiers[Math.abs(hash) % tiers.length];
};

const getFallbackPackage = (pkgId: string, startingPrice: number) => {
  const basePrice = startingPrice || 350;

  // Veg categories
  const vegCategories = [
    {
      categoryName: "Welcome Drinks",
      selectionRule: "Select Any 1 Item",
      items: [
        "Fresh Lime Soda",
        "Guava Punch",
        "Virgin Mojito",
        "Sweet Lassi",
        "Mango Juice",
        "Orange Juice",
        "Watermelon Juice",
        "Masala Chaas",
        "Pineapple Juice",
      ],
    },
    {
      categoryName: "Starters (Veg)",
      selectionRule: "Select Any 2 Items",
      items: [
        "Paneer Tikka",
        "Gobi 65",
        "Veg Spring Roll",
        "Veg Samosa",
        "Crispy Corn",
      ],
    },
    {
      categoryName: "Main Course (Paneer)",
      selectionRule: "Select Any 1 Item",
      items: ["Paneer Butter Masala", "Kadhai Paneer", "Shahi Paneer"],
    },
    {
      categoryName: "Main Course (Veg)",
      selectionRule: "Select Any 2 Items",
      items: [
        "Dal Makhani",
        "Mixed Veg Curry",
        "Veg Diwani Handi",
        "Aloo Gobi Fry",
      ],
    },
    {
      categoryName: "Breads & Rice",
      selectionRule: "Select Any 3 Items",
      items: [
        "Butter Naan",
        "Tandoori Roti",
        "Rumali Roti",
        "Veg Biryani",
        "Jeera Rice",
        "Steamed Rice",
      ],
    },
    {
      categoryName: "Sweets & Desserts",
      selectionRule: "Select Any 2 Items",
      items: [
        "Gulab Jamun with Ice Cream",
        "Double Ka Meetha",
        "Gajar Ka Halwa",
        "Vanilla Ice Cream",
      ],
    },
  ];

  // Non-veg categories
  const nonVegCategories = [
    {
      categoryName: "Welcome Drinks",
      selectionRule: "Select Any 1 Item",
      items: [
        "Fresh Lime Soda",
        "Blue Lagoon Cooler",
        "Watermelon Mojito",
        "Masala Cola",
      ],
    },
    {
      categoryName: "Starters (Veg)",
      selectionRule: "Select Any 2 Items",
      items: ["Paneer Tikka", "Gobi 65", "Crispy Corn Fry", "Veg Gold Coin"],
    },
    {
      categoryName: "Starters (Non-Veg)",
      selectionRule: "Select Any 2 Items",
      items: [
        "Chicken 65",
        "Chicken Tikka Kebab",
        "Fish Fingers",
        "Tandoori Chicken",
      ],
    },
    {
      categoryName: "Main Course (Meat)",
      selectionRule: "Select Any 2 Items",
      items: [
        "Hyderabad Mutton Curry",
        "Butter Chicken Masala",
        "Andhra Fish Curry",
        "Chicken Kadai",
      ],
    },
    {
      categoryName: "Main Course (Veg)",
      selectionRule: "Select Any 2 Items",
      items: ["Dal Makhani", "Paneer Butter Masala", "Mixed Veg Kurma"],
    },
    {
      categoryName: "Breads & Rice",
      selectionRule: "Select Any 3 Items",
      items: [
        "Butter Naan",
        "Tandoori Roti",
        "Rumali Roti",
        "Special Hyderabadi Chicken Biryani",
        "Mutton Dum Biryani",
        "Jeera Rice",
      ],
    },
    {
      categoryName: "Sweets & Desserts",
      selectionRule: "Select Any 2 Items",
      items: [
        "Gulab Jamun with Ice Cream",
        "Qubani Ka Meetha",
        "Double Ka Meetha",
        "Vanilla Ice Cream",
        "Mango Kulfi",
      ],
    },
  ];

  const fallbacks: Record<string, any> = {
    v_silver: {
      id: "v_silver",
      packageName: "Silver Package",
      packageType: "Veg",
      pricePerPlate: basePrice,
      minimumGuests: 100,
      categories: vegCategories.slice(0, 4),
      description: "Simple & elegant vegetarian spread for family gatherings.",
    },
    v_gold: {
      id: "v_gold",
      packageName: "Gold Package",
      packageType: "Veg",
      pricePerPlate: basePrice + 100,
      minimumGuests: 150,
      categories: vegCategories.slice(0, 5),
      description:
        "Slightly richer premium veg spread with extra paneer delicacies.",
    },
    v_platinum: {
      id: "v_platinum",
      packageName: "Platinum Package",
      packageType: "Veg",
      pricePerPlate: basePrice + 250,
      minimumGuests: 200,
      categories: vegCategories,
      description: "Ultra luxury premium veg spread for signature events.",
    },
    nv_premium: {
      id: "nv_premium",
      packageName: "Premium Package",
      packageType: "Non-veg",
      pricePerPlate: basePrice + 450,
      minimumGuests: 150,
      categories: nonVegCategories.slice(0, 5),
      description: "Classic non-veg catering with double choice meat courses.",
    },
    nv_royal: {
      id: "nv_royal",
      packageName: "Royal Package",
      packageType: "Non-veg",
      pricePerPlate: basePrice + 750,
      minimumGuests: 200,
      categories: nonVegCategories.slice(0, 6),
      description:
        "Exquisite regal non-veg banquet for elite wedding celebrations.",
    },
    nv_grand: {
      id: "nv_grand",
      packageName: "Grand Royal",
      packageType: "Non-veg",
      pricePerPlate: basePrice + 1150,
      minimumGuests: 250,
      categories: nonVegCategories,
      description:
        "The ultimate royal banquet with exotic seafood, mutton, and dessert options.",
    },
  };

  return fallbacks[pkgId] || null;
};

const VegHeaderIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M12 22C12 22 12 14 16 11C18 9.5 20 9.5 21 10.5C22 11.5 21 13.5 19.5 15.5C16.5 19.5 12 22 12 22Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 22C12 22 12 14 8 11C6 9.5 4 9.5 3 10.5C2 11.5 3 13.5 4.5 15.5C7.5 19.5 12 22 12 22Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 15V3" strokeLinecap="round" />
    <path d="M12 11C13.5 9 15.5 8.5 17 9.5" strokeLinecap="round" />
    <path d="M12 9C10.5 7 8.5 6.5 7 7.5" strokeLinecap="round" />
  </svg>
);

const NonVegHeaderIcon = ({
  className = "w-7 h-7",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 16c2.5-2.5 2.5-6.5 0-9-1.5-1.5-4-1.5-5.5 0-2 2-2.5 5.5-5.5 8.5a1.5 1.5 0 0 0 0 2.1c1.5 1.5 4.5 1 6.5-1 1-1 3-1.5 4.5-0.6Z" />
    <path d="M5 19c-.5-.5-1-.2-1.5-.7a1.5 1.5 0 0 1 0-2.1c.5-.5.7-1 1.2-1.5" />
    <path d="M18.5 5.5A2.5 2.5 0 1 0 15 2c0 .5-.5 1-1 1" />
  </svg>
);

const DynamicCateringIcon = ({
  packageType = "",
  className = "w-8 h-8",
}: {
  packageType?: string;
  className?: string;
}) => {
  const lower = packageType.toLowerCase();
  const isVeg = lower.includes("veg") && !lower.includes("non");
  const isNonVeg =
    lower.includes("non-veg") ||
    lower.includes("non veg") ||
    lower.includes("nonveg");
  const isMixed =
    lower.includes("both") ||
    lower.includes("+") ||
    lower.includes("&") ||
    lower.includes("allow") ||
    (!isVeg && !isNonVeg);

  if (isVeg) {
    return <VegHeaderIcon className={cn("text-[#0F3D2E]", className)} />;
  } else if (isNonVeg && !isMixed) {
    return <NonVegHeaderIcon className={cn("text-red-700", className)} />;
  } else {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <VegHeaderIcon className="w-5.5 h-5.5 text-[#0F3D2E]" />
        <span className="text-[#D4AF37] font-black text-[10px]">&</span>
        <NonVegHeaderIcon className="w-5.5 h-5.5 text-red-700" />
      </div>
    );
  }
};

const CrownIcon = ({
  tier = "gold",
  className = "w-10 h-10",
}: {
  tier?: "bronze" | "silver" | "gold";
  className?: string;
}) => {
  let color = "#D4AF37"; // gold
  if (tier === "silver") color = "#A0A0A0";
  else if (tier === "bronze") color = "#CD7F32";

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path
        d="M2.5 19h19a.5.5 0 0 0 .5-.5V12l-4.5 4.5L12 6.5 6.5 16.5 2 12v6.5a.5.5 0 0 0 .5.5Z"
        fill={color}
        stroke={color}
        fillOpacity="0.15"
      />
      <circle cx="2" cy="11.5" r="1" fill={color} />
      <circle cx="6.5" cy="15.5" r="1" fill={color} />
      <circle cx="12" cy="5.5" r="1" fill={color} />
      <circle cx="17.5" cy="15.5" r="1" fill={color} />
      <circle cx="22" cy="11.5" r="1" fill={color} />
      <path d="M4 19v1.5a.5.5 0 0 0 .5.5h15a.5.5 0 0 0 .5-.5V19" fill="none" />
    </svg>
  );
};

const getPackageTier = (packageName: string = "", idx: number) => {
  const name = packageName.toLowerCase();
  if (
    name.includes("platinum") ||
    name.includes("diamond") ||
    name.includes("royal")
  )
    return "gold";
  if (name.includes("gold") || name.includes("classic") || idx === 1)
    return "gold";
  if (name.includes("silver") || idx === 2) return "silver";
  return "bronze"; // basic / others
};

const renderVegNonVegBadge = (packageType: string = "") => {
  const lower = packageType.toLowerCase();
  let isVeg = true;
  let isNonVeg = false;

  if (
    lower.includes("non-veg") ||
    lower.includes("non veg") ||
    lower.includes("nonveg")
  ) {
    if (
      lower.includes("both") ||
      lower.includes("allow") ||
      lower.includes("+") ||
      lower.includes("&")
    ) {
      isVeg = true;
      isNonVeg = true;
    } else {
      isVeg = false;
      isNonVeg = true;
    }
  } else if (
    lower.includes("both") ||
    lower.includes("+") ||
    lower.includes("&") ||
    lower.includes("mixed")
  ) {
    isVeg = true;
    isNonVeg = true;
  } else if (lower.includes("veg")) {
    isVeg = true;
    isNonVeg = false;
  } else {
    isVeg = true;
    isNonVeg = true;
  }

  const VegSymbol = () => (
    <div className="w-3.5 h-3.5 border border-green-600 p-[1px] flex items-center justify-center bg-white shrink-0 rounded-[1px]">
      <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
    </div>
  );

  const NonVegSymbol = () => (
    <div className="w-3.5 h-3.5 border border-red-600 p-[1px] flex items-center justify-center bg-white shrink-0 rounded-[1px]">
      <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
    </div>
  );

  let text = "VEG";
  if (isVeg && isNonVeg) text = "VEG + NON-VEG";
  else if (isNonVeg) text = "NON-VEG";

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-[#D4AF37]/35 shadow-sm select-none">
      {isVeg && <VegSymbol />}
      {isNonVeg && <NonVegSymbol />}
      <span className="text-[9px] font-black tracking-wider text-[#0F3D2E] uppercase font-sans leading-none pl-0.5">
        {text}
      </span>
    </div>
  );
};

const getSelectionRuleLabel = (rule: string | undefined): string => {
  if (!rule) return "Select Items From This Category";
  const clean = rule.trim();
  const match = clean.match(/(Select|Choose)\s+Any\s+(\d+)\s*(Items?)?/i);
  if (match) {
    const num = match[2];
    return `Select Any ${num} Items From This Category`;
  }
  return clean;
};

const OCCASIONS = [
  "Wedding", "Reception", "Birthday", "Anniversary", "Baby Shower",
  "House Warming", "Corporate Event", "Engagement", "Naming Ceremony",
  "Pooja", "Festival", "Kitty Party", "Kids Party", "Outdoor Party",
  "Office Party", "Pool Party", "Bachelor Party", "Others"
];

const MEAL_TIME_OPTIONS: Record<string, string[]> = {
  Breakfast: ["7 AM onwards", "8 AM onwards", "9 AM onwards"],
  Lunch: ["11 AM onwards", "12 PM onwards", "1 PM onwards", "2 PM onwards", "3 PM onwards", "4 PM onwards"],
  "Evening Snacks": ["4 PM onwards", "5 PM onwards", "6 PM onwards", "7 PM onwards"],
  Dinner: ["6 PM onwards", "7 PM onwards", "8 PM onwards", "9 PM onwards", "10 PM onwards"]
};

export const getPackageMinGuests = (pkg: any): number => {
  if (!pkg) return 50;
  if (typeof pkg.minimumGuests === "number" && pkg.minimumGuests > 0) return pkg.minimumGuests;
  if (typeof pkg.minGuests === "number" && pkg.minGuests > 0) return pkg.minGuests;
  if (pkg.pricingSlabs && Array.isArray(pkg.pricingSlabs) && pkg.pricingSlabs.length > 0) {
    const mins = pkg.pricingSlabs
      .map((s: any) => Number(s.minGuests))
      .filter((n: number) => !isNaN(n) && n > 0);
    if (mins.length > 0) return Math.min(...mins);
  }
  if (typeof pkg.guests === "number" && pkg.guests > 0) return pkg.guests;
  return 50;
};

export const getPackageMaxGuests = (pkg: any): number => {
  if (!pkg) return 5000;
  if (typeof pkg.maximumGuests === "number" && pkg.maximumGuests > 0) return pkg.maximumGuests;
  if (typeof pkg.maxGuests === "number" && pkg.maxGuests > 0) return pkg.maxGuests;
  if (pkg.pricingSlabs && Array.isArray(pkg.pricingSlabs) && pkg.pricingSlabs.length > 0) {
    const maxs = pkg.pricingSlabs
      .map((s: any) => Number(s.maxGuests))
      .filter((n: number) => !isNaN(n) && n > 0);
    if (maxs.length > 0) return Math.max(...maxs);
  }
  return 5000;
};

export default function OrderFlow() {
  const { id } = useParams();
  const { user } = useAuth();
  const [caterer, setCaterer] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<boolean | null>(null); // true = quote, false = booking
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [foodImages, setFoodImages] = useState<Record<string, string>>({});
  const [platformFeePerPlate, setPlatformFeePerPlate] = useState(() => {
    return parseFloat(localStorage.getItem("platformFeePerPlate") || "1");
  });

  const location = useLocation();

  useEffect(() => {
    import("../lib/supabase").then(({ fetchPlatformFeePerPlate }) => {
      fetchPlatformFeePerPlate().then((fee) => {
        setPlatformFeePerPlate(fee);
      });
    });
  }, []);

  useEffect(() => {
    fetch("/api/food-images")
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error(
          `Response was not JSON. Status: ${res.status}, Type: ${contentType}`,
        );
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.images)) {
          const mapping: Record<string, string> = {};
          data.images.forEach((img: any) => {
            if (img.image_url) {
              mapping[img.item_name.toLowerCase().trim()] = img.image_url;
            }
          });
          setFoodImages(mapping);
        }
      })
      .catch((err) => console.error("Error fetching custom food images:", err));
  }, []);

  useEffect(() => {
    if (caterer) {
      let selectedPkg = null;
      if (location.state?.packageIdx !== undefined) {
        if (
          typeof location.state.packageIdx === "number" &&
          caterer.menuPackages &&
          caterer.menuPackages.length > location.state.packageIdx
        ) {
          selectedPkg = caterer.menuPackages[location.state.packageIdx];
        } else {
          selectedPkg = getFallbackPackage(
            location.state.packageIdx,
            caterer.startingPrice || 350,
          );
        }
      }

      if (!selectedPkg) {
        if (caterer.menuPackages && caterer.menuPackages.length > 0) {
          selectedPkg = caterer.menuPackages[0];
        } else {
          selectedPkg = getFallbackPackage("v_silver", caterer.startingPrice || 350);
        }
      }

      if (selectedPkg) {
        setSelectedPackage(selectedPkg);
        setViewMode("package_detail");
        
        const pkgMin = getPackageMinGuests(selectedPkg);
        const targetGuestCount = location.state?.customGuestCount;
        if (typeof targetGuestCount === "number" && !isNaN(targetGuestCount) && targetGuestCount >= pkgMin) {
          setGuests(targetGuestCount);
          setGuestInputVal(String(targetGuestCount));
        } else {
          setGuests(pkgMin);
          setGuestInputVal(String(pkgMin));
        }
      }
    }
  }, [caterer, location.state]);

  useEffect(() => {
    let allCaterers = [...DEMO_CATERERS];
    const raw = localStorage.getItem("registrations");
    if (raw) {
      try {
        const allRegs = JSON.parse(raw);
        const regMapped = allRegs.map((r: any) => ({
          id: r.id,
          name: r.businessName,
          location: r.location || "Hyderabad",
          type: r.type || "Veg + Non-Veg",
          startingPrice: 350,
          description:
            r.description || "Welcome to our premium catering service.",
          menuPackages: r.menuPackages || r.packages || [],
          packages: r.packages || r.menuPackages || [],
        }));
        allCaterers = [...allCaterers, ...regMapped];
      } catch (e) {}
    }

    const found = allCaterers.find((c) => c.id === id);
    if (found) {
      setCaterer(found);
      if (false /* legacy check disabled, handled in main useEffect */) {
        const selectedPkg = found.menuPackages[location.state.packageIdx];
        setSelectedPackage(selectedPkg);
        setViewMode("package_detail");

        // Pre-fill Min Guests from active slab or package
        if (selectedPkg.pricingSlabs && selectedPkg.pricingSlabs.length > 0) {
          // Slabs should be sorted by minGuests
          const sortedSlabs = [...selectedPkg.pricingSlabs].sort(
            (a: any, b: any) => a.minGuests - b.minGuests,
          );
          setGuests(sortedSlabs[0].minGuests);
        } else if (selectedPkg.minimumGuests) {
          setGuests(selectedPkg.minimumGuests);
        }
      }
    }
  }, [id, location.state]);

  const [viewMode, setViewMode] = useState<
    "custom" | "package_detail" | "checkout"
  >("package_detail");
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const [guests, setGuests] = useState(100);
  const [guestInputVal, setGuestInputVal] = useState("100");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const minGuests = getPackageMinGuests(selectedPackage);
  const maxGuests = getPackageMaxGuests(selectedPackage);

  useEffect(() => {
    if (selectedPackage) {
      const pkgMin = getPackageMinGuests(selectedPackage);
      setGuests((prev) => {
        const num = Number(prev);
        if (isNaN(num) || num < pkgMin) {
          return pkgMin;
        }
        return num;
      });
    }
  }, [selectedPackage]);

  useEffect(() => {
    setGuestInputVal(String(guests));
  }, [guests]);

  const handleGuestSubmit = (valStr: string) => {
    const trimmed = valStr.trim();
    if (!trimmed) {
      setGuestInputVal(String(guests));
      return;
    }
    const cleanDigits = trimmed.replace(/\D/g, "");
    if (!cleanDigits) {
      setGuestInputVal(String(guests));
      toast("Please enter a valid positive number of guests", "error");
      return;
    }
    const parsed = parseInt(cleanDigits, 10);
    if (isNaN(parsed) || parsed < 1) {
      setGuestInputVal(String(guests));
      toast("Please enter a valid positive number of guests", "error");
      return;
    }
    if (parsed < minGuests) {
      toast(`Minimum requirement for this package is ${minGuests} guests`, "error");
    } else if (parsed > maxGuests) {
      toast(`Maximum guest limit is ${maxGuests} guests`, "error");
    }
    const validCount = Math.max(minGuests, Math.min(maxGuests, parsed));
    setGuests(validCount);
    setGuestInputVal(String(validCount));
  };

  const decrementGuests = () => {
    const current = Number(guests) || minGuests;
    const newCount = Math.max(minGuests, current - 10);
    setGuests(newCount);
    setGuestInputVal(String(newCount));
  };

  const incrementGuests = () => {
    const current = Number(guests) || minGuests;
    const newCount = Math.min(maxGuests, current + 10);
    setGuests(newCount);
    setGuestInputVal(String(newCount));
  };

  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>(
    {},
  );
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [mobileCartExpanded, setMobileCartExpanded] = useState(false);

  // Restore session state on load
  useEffect(() => {
    const savedSession = sessionStorage.getItem("orderFlowSession");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.catererId === id) {
          if (parsed.viewMode && parsed.viewMode !== "packages") setViewMode(parsed.viewMode);
          if (parsed.selectedPackage) {
            setSelectedPackage(parsed.selectedPackage);
            const pkgMin = getPackageMinGuests(parsed.selectedPackage);
            const savedGuests = Number(parsed.guests);
            if (!isNaN(savedGuests) && savedGuests >= pkgMin) {
              setGuests(savedGuests);
              setGuestInputVal(String(savedGuests));
            } else {
              setGuests(pkgMin);
              setGuestInputVal(String(pkgMin));
            }
          } else if (parsed.guests) {
            setGuests(parsed.guests);
            setGuestInputVal(String(parsed.guests));
          }
          if (parsed.orderForm) setOrderForm(parsed.orderForm);
          if (parsed.selectedItems) setSelectedItems(parsed.selectedItems);
        }
      } catch (e) {}
      sessionStorage.removeItem("orderFlowSession");
    }
  }, [id]);

  // Extract categories & items globally if building their own, or limit to package
  let packageDefinitions: any[] = [];
  if (caterer?.menuPackages && caterer.menuPackages.length > 0) {
    packageDefinitions = caterer.menuPackages;
  } else if (caterer) {
    // Fallback standard packages
    packageDefinitions = [
      getFallbackPackage("v_silver", caterer.startingPrice),
      getFallbackPackage("v_gold", caterer.startingPrice),
      getFallbackPackage("v_platinum", caterer.startingPrice),
      getFallbackPackage("nv_premium", caterer.startingPrice),
      getFallbackPackage("nv_royal", caterer.startingPrice),
      getFallbackPackage("nv_grand", caterer.startingPrice),
    ].filter(Boolean);
  }

  // Derive menu states based on selected package or fallback
  const [orderForm, setOrderForm] = useState({
    date: "",
    type: "Wedding",
    venue: "",
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Premium Event Details states
  const [selectedMeals, setSelectedMeals] = useState<string[]>(["Lunch"]);
  const [mealTimings, setMealTimings] = useState<Record<string, string>>({ Lunch: "12 PM onwards" });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [venueName, setVenueName] = useState("");
  const [venueType, setVenueType] = useState<"Indoor" | "Outdoor" | "">("");
  const [mapLocation, setMapLocation] = useState("");
  const [isVenueMapOpen, setIsVenueMapOpen] = useState(false);
  const [venueLat, setVenueLat] = useState<number | null>(null);
  const [venueLng, setVenueLng] = useState<number | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation is not supported by your browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setVenueLat(latitude);
        setVenueLng(longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "CaterNest-Location-Picker",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setOrderForm({ ...orderForm, venue: data.display_name });
              setMapLocation(data.display_name);
              const parts = data.display_name.split(",");
              if (parts.length > 0 && parts[0].trim()) {
                setVenueName(parts[0].trim());
              }
              toast("Location detected successfully!", "success");
            } else {
              const coords = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
              setOrderForm({ ...orderForm, venue: coords });
              setMapLocation(coords);
              toast("Location coordinates saved", "success");
            }
          }
        } catch (e) {
          console.warn("Reverse geocode failed", e);
          const coords = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setOrderForm({ ...orderForm, venue: coords });
          setMapLocation(coords);
          toast("Location coordinates saved", "success");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast("Unable to retrieve your current location.", "error");
      }
    );
  };

  const [isOccasionDropdownOpen, setIsOccasionDropdownOpen] = useState(false);
  const [occasionSearchQuery, setOccasionSearchQuery] = useState("");

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const dateInputRef = useRef<HTMLInputElement>(null);

  const addDate = (dateStr: string) => {
    if (!dateStr) return;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = `${day.toString().padStart(2, '0')} ${months[month]} ${year}`;
    if (!selectedDates.includes(formatted)) {
      const newDates = [...selectedDates, formatted];
      setSelectedDates(newDates);
      setOrderForm(prev => ({ ...prev, date: newDates.join(", ") }));
    }
  };

  const removeDate = (dateToRemove: string) => {
    const newDates = selectedDates.filter(d => d !== dateToRemove);
    setSelectedDates(newDates);
    setOrderForm(prev => ({ ...prev, date: newDates.join(", ") }));
  };

  const formatCalendarDate = (date: Date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate().toString().padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.includes(formatCalendarDate(date));
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const toggleCalendarDate = (date: Date) => {
    if (isDatePast(date)) return;
    const formatted = formatCalendarDate(date);
    if (selectedDates.includes(formatted)) {
      removeDate(formatted);
    } else {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      addDate(`${y}-${m}-${d}`);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysArray: (Date | null)[] = [];
    
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      daysArray.push(new Date(year, month, d));
    }
    return daysArray;
  };

  useEffect(() => {
    if (orderForm.date && selectedDates.length === 0) {
      const dates = orderForm.date.split(", ").map(d => d.trim()).filter(Boolean);
      setSelectedDates(dates);
    }
  }, [orderForm.date]);

  const navigate = useNavigate();

  const handleBooking = async (isQuote: boolean) => {
    console.log("[TRACE_LOG #2] handleBooking() entry, isQuote:", isQuote);

    console.log("[TRACE_LOG #3] user validation block, user:", user);
    if (!user) {
      console.log(
        "[TRACE_LOG #3.1] User validation FAILED. Redirecting to loginmodal.",
      );
      setPendingAction(isQuote);
      setShowLoginModal(true);
      return;
    }
    console.log("[TRACE_LOG #3.2] User validation PASSED.");

    console.log(
      "[TRACE_LOG #4] selectedPackage validation, selectedPackage:",
      selectedPackage,
    );
    console.log("[TRACE_LOG #5] guest count validation, guests:", guests);

    console.log("[TRACE_LOG #7] Before localStorage.getItem('orders')");
    const currentOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    console.log(
      "[TRACE_LOG #7.1] currentOrders loaded, count:",
      currentOrders.length,
    );

    const platformFee =
      appliedCoupon === "NEW" ? 0 : guests * platformFeePerPlate;

    let matchingSlab = selectedPackage?.pricingSlabs?.find(
      (slab: any) =>
        guests >= slab.minGuests &&
        (slab.maxGuests === null || guests <= slab.maxGuests),
    );
    if (
      !matchingSlab &&
      selectedPackage?.pricingSlabs &&
      selectedPackage.pricingSlabs.length > 0
    ) {
      const sorted = [...selectedPackage.pricingSlabs].sort(
        (a: any, b: any) => a.minGuests - b.minGuests,
      );
      if (guests < sorted[0].minGuests) matchingSlab = sorted[0];
      else matchingSlab = sorted[sorted.length - 1];
    }

    // Direct Validation of Booking details in the "Contact Information" step
    if (!orderForm.name || !orderForm.name.trim()) {
      toast("Please enter your name in the Contact Information section.", "error");
      return;
    }
    if (!orderForm.phone || !orderForm.phone.trim()) {
      toast("Please enter your phone number in the Contact Information section.", "error");
      return;
    }
    if (!orderForm.venue || !orderForm.venue.trim()) {
      toast("Please provide the venue details in Hyderabad.", "error");
      return;
    }

    const finalEventDate = (orderForm.date || selectedDates.join(", ")).trim();
    if (!finalEventDate) {
      toast("Please select an event date before confirming your booking.", "error");
      return;
    }

    console.log("[TRACE_LOG #6] Before newOrder object creation");
    const compiledVenue = venueName 
      ? `${venueName} ${venueType ? `(${venueType})` : ""}, Address: ${orderForm.venue}` 
      : orderForm.venue;

    // Detect any dietary preference tags clicked by the user
    const dietaryTagOptions = ["No Onion", "Jain Food", "Less Spice", "Kids Menu", "Separate Serving"];
    const detectedDietary = dietaryTagOptions.filter(tag => 
      orderForm.notes.toLowerCase().includes(tag.toLowerCase())
    );

    const calculatedTotal = currentPerPlatePrice * guests + platformFee;

    const newOrder = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id || "",
      customerEmail: orderForm.email && orderForm.email.trim() ? orderForm.email.trim() : (user.email || ""),
      catererId: caterer.id,
      catererName: caterer.name,
      customerName: orderForm.name.trim(),
      phone: orderForm.phone.trim(),
      customerPhone: orderForm.phone.trim(),
      eventDate: finalEventDate,
      eventDates: selectedDates.length > 0 ? selectedDates : [finalEventDate],
      eventType: orderForm.type || "Wedding",
      guests: guests,
      guestCount: guests,
      venue: compiledVenue || "",
      address: compiledVenue || "",
      venueName: venueName || "",
      venueType: venueType || "",
      venueAddress: orderForm.venue || "",
      mapLocation: mapLocation || "",
      googleMapsUrl: mapLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation)}` : "",
      latitude: venueLat,
      longitude: venueLng,
      mealSelection: selectedMeals.length > 0 ? selectedMeals.join(", ") : "Lunch",
      mealTimings: mealTimings,
      dietaryPreferences: detectedDietary,
      specialInstructions: orderForm.notes ? orderForm.notes.trim() : "",
      specialNotes: orderForm.notes ? orderForm.notes.trim() : "",
      notes: orderForm.notes ? orderForm.notes.trim() : "",
      packageDetails: selectedPackage,
      matchedSlab: matchingSlab,
      selectedItems: Object.keys(selectedItems).filter(
        (k: string) => selectedItems[k],
      ),
      totalEstimate: calculatedTotal,
      totalAmount: calculatedTotal,
      amount: calculatedTotal,
      platformFeePerPlate: platformFeePerPlate,
      pricePerPlate: currentPerPlatePrice,
      platformFee: platformFee,
      foodCost: currentPerPlatePrice * guests,
      status: "Pending Approval",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("[TRACE_LOG #6.1] Created newOrder object:", newOrder);

    console.log("[TRACE_LOG #8] Before localStorage.setItem('orders')");
    try {
      await saveWithSupabaseSync("orders", "orders", [
        ...currentOrders,
        newOrder,
      ]);
    } catch (syncErr) {
      console.error("Synced order failed, writing locally:", syncErr);
      localStorage.setItem(
        "orders",
        JSON.stringify([...currentOrders, newOrder]),
      );
    }
    console.log("[TRACE_LOG #8.1] After localStorage.setItem('orders')");

    console.log("ORDER CREATED", newOrder);

    // Store notifications for Customer, Caterer, and Admin Real-time flows
    try {
      storeNotification(
        newOrder.id,
        "New Booking Submitted 📨",
        `Your booking request for ${newOrder.catererName} on ${newOrder.eventDate} has been submitted and is waiting for caterer approval.`,
        "customer",
        newOrder.catererId,
      );
    } catch (err) {
      console.warn("Notification logging warn", err);
    }

    try {
      storeNotification(
        newOrder.id,
        "New Order Received 🧑‍🍳",
        `A new booking request has been received from ${newOrder.customerName} for ${newOrder.eventDate}.`,
        "caterer",
        newOrder.catererId,
      );
    } catch (err) {
      console.warn("Notification logging warn", err);
    }

    try {
      storeNotification(
        newOrder.id,
        "New Order Created 🔔",
        `Customer ${newOrder.customerName} submitted a new order request #${newOrder.id} for ${newOrder.catererName}.`,
        "admin",
      );
    } catch (err) {
      console.warn("Notification logging warn", err);
    }

    console.log("[TRACE_LOG #9] Before navigate('/orders')");
    toast(
      "Your booking request has been submitted and is waiting for caterer approval.",
      "success",
    );
    navigate("/orders");
  };

  const handleProceedToLogin = () => {
    sessionStorage.setItem(
      "orderFlowSession",
      JSON.stringify({
        catererId: caterer.id,
        viewMode,
        guests,
        selectedPackage,
        orderForm,
        selectedItems,
      }),
    );
    navigate("/login", { state: { from: `/order/${id}` } });
  };

  const menuCategories =
    selectedPackage?.categories?.map((c: any) => c.categoryName) || [];

  const [activeCategory, setActiveCategory] = useState(menuCategories[0] || "");
  const [highlightIncomplete, setHighlightIncomplete] = useState(false);
  const [validationTriggered, setValidationTriggered] = useState(false);
  const categoryTabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const categoryScrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeCategory && categoryTabRefs.current[activeCategory]) {
      categoryTabRefs.current[activeCategory]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeCategory]);

  useEffect(() => {
    if (highlightIncomplete) {
      const timer = setTimeout(() => {
        setHighlightIncomplete(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [highlightIncomplete]);

  useEffect(() => {
    // Reset active category when package changes
    if (selectedPackage?.categories && selectedPackage.categories.length > 0) {
      setActiveCategory(selectedPackage.categories[0].categoryName);
    }
  }, [selectedPackage]);

  const parseCategoryLimit = (rule?: string): number => {
    if (!rule) return 0;
    const clean = rule.trim().toLowerCase();
    if (clean === 'included' || clean === 'optional' || clean === 'needs review' || clean === 'needs_review') return 0;
    const match = clean.match(/\d+/);
    if (match) return parseInt(match[0], 10);
    if (clean.includes('one')) return 1;
    if (clean.includes('two')) return 2;
    if (clean.includes('three')) return 3;
    if (clean.includes('four')) return 4;
    if (clean.includes('five')) return 5;
    if (clean.includes('six')) return 6;
    return 0;
  };

  const limitPerCategory = (() => {
    if (!selectedPackage || !activeCategory) return 0;
    const cat = selectedPackage.categories?.find(
      (c: any) => c.categoryName === activeCategory,
    );
    return parseCategoryLimit(cat?.selectionRule);
  })();

  const toggleItem = (itemName: string, catName: string) => {
    setSelectedItems((prev) => {
      const isSelected = !!prev[itemName];
      const cat = selectedPackage.categories?.find(
        (c: any) => c.categoryName === catName,
      );
      const limit = parseCategoryLimit(cat?.selectionRule);

      if (!isSelected && limit > 0) {
        const itemsInCat = cat?.items || [];
        const selectedCount = itemsInCat.filter((i: string) => prev[i]).length;
        if (selectedCount >= limit) {
          return prev; // Reached limit, do not select
        }
      }
      return { ...prev, [itemName]: !isSelected };
    });
  };

  const handleQuantityChange = (itemName: string, catName: string, newQty: number) => {
    if (newQty <= 0) {
      if (selectedItems[itemName]) {
        toggleItem(itemName, catName);
      }
      setItemQuantities((prev) => ({ ...prev, [itemName]: 0 }));
    } else {
      if (!selectedItems[itemName]) {
        toggleItem(itemName, catName);
      }
      setItemQuantities((prev) => ({ ...prev, [itemName]: newQty }));
    }
  };

  const toggleItemWithQty = (itemName: string, catName: string) => {
    const isCurrentlySelected = !!selectedItems[itemName];
    toggleItem(itemName, catName);
    if (!isCurrentlySelected) {
      setItemQuantities((prev) => ({ ...prev, [itemName]: 1 }));
    } else {
      setItemQuantities((prev) => ({ ...prev, [itemName]: 0 }));
    }
  };

  const isCategoryComplete = (catName: string) => {
    if (!selectedPackage) return true;
    const cat = selectedPackage.categories?.find(
      (c: any) => c.categoryName === catName,
    );
    if (!cat) return true;
    const limit = parseCategoryLimit(cat.selectionRule);
    if (limit === 0) return true;

    const itemsInCat = cat.items || [];
    const selectedCount = itemsInCat.filter(
      (i: string) => selectedItems[i],
    ).length;
    return selectedCount >= limit;
  };

  const getCategoryRemainingCount = (catName: string) => {
    if (!selectedPackage) return 0;
    const cat = selectedPackage.categories?.find(
      (c: any) => c.categoryName === catName,
    );
    if (!cat) return 0;
    const limit = parseCategoryLimit(cat.selectionRule);
    if (limit === 0) return 0;

    const itemsInCat = cat.items || [];
    const selectedCount = itemsInCat.filter(
      (i: string) => selectedItems[i],
    ).length;
    return Math.max(0, limit - selectedCount);
  };

  const navigateToCategory = (catName: string) => {
    setActiveCategory(catName);
    const categoryContent = document.getElementById("active-category-content");
    if (categoryContent) {
      categoryContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const allCategoriesComplete =
    menuCategories.length > 0 && menuCategories.every(isCategoryComplete);
  const totalCategoriesCount = menuCategories.length;
  const doneCategoriesCount = menuCategories.filter(isCategoryComplete).length;
  const selectedItemsCount = Object.keys(selectedItems).filter(
    (k) => selectedItems[k],
  ).length;

  const currentPerPlatePrice = (() => {
    if (
      selectedPackage &&
      selectedPackage.pricingSlabs &&
      selectedPackage.pricingSlabs.length > 0
    ) {
      const matchingSlab = selectedPackage.pricingSlabs.find(
        (slab: any) =>
          guests >= slab.minGuests &&
          (slab.maxGuests === null || guests <= slab.maxGuests),
      );
      if (matchingSlab) return matchingSlab.price;

      // Fallback to highest bound if exceeded, or lowest if below
      const sorted = [...selectedPackage.pricingSlabs].sort(
        (a: any, b: any) => a.minGuests - b.minGuests,
      );
      if (guests < sorted[0].minGuests) return sorted[0].price;
      return sorted[sorted.length - 1].price;
    }
    return selectedPackage?.pricePerPlate || caterer?.startingPrice || 350;
  })();

  const platformFee = guests * platformFeePerPlate;

  if (!caterer)
    return (
      <div className="min-h-screen pt-32 pb-24 bg-gradient-to-b from-[#FBF4E4] via-[#FCF6E9] to-[#F7EDD9] flex flex-col items-center justify-center text-[#083A28] font-medium font-poppins">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-[#DFC78A] border-t-[#024731] mb-4" />
        Loading caterer details...
      </div>
    );

  const activeCategoryData = selectedPackage?.categories?.find(
    (c: any) => c.categoryName === activeCategory,
  );
  const isActiveCatNonVeg = isCategoryNonVeg(
    activeCategory,
    activeCategoryData?.items || [],
  );
  const activeCategoryIndex = Math.max(0, menuCategories.indexOf(activeCategory));

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col font-poppins transition-colors duration-300 pt-14 sm:pt-[58px] relative",
        viewMode === "custom" || viewMode === "checkout" || viewMode === "package_detail"
          ? "bg-[#FBF7EF] overflow-x-clip"
          : "bg-[#FAF8F3]"
      )}
    >
      {/* Subtle Botanical Leaf & Luxury Corner Accents for Menu Selection */}
      {viewMode === "custom" && (
        <>
          <div className="pointer-events-none select-none fixed top-[58px] right-0 w-72 h-44 overflow-hidden z-10 opacity-90 hidden sm:block">
            <svg viewBox="0 0 320 180" fill="none" className="w-full h-full">
              <path
                d="M110,-10 C185,48 250,76 330,86 L330,-10 Z"
                fill={isActiveCatNonVeg ? "url(#pmcCornerBurgundyTop)" : "url(#pmcCornerEmeraldTop)"}
              />
              <path
                d="M110,-10 C185,48 250,76 330,86"
                stroke="url(#pmcCornerGoldTop)"
                strokeWidth="3"
                fill="none"
              />
              <defs>
                <linearGradient id="pmcCornerEmeraldTop" x1="110" y1="-10" x2="330" y2="86" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#004B35" />
                  <stop offset="100%" stopColor="#00281D" />
                </linearGradient>
                <linearGradient id="pmcCornerBurgundyTop" x1="110" y1="-10" x2="330" y2="86" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#8B1E16" />
                  <stop offset="100%" stopColor="#5E110B" />
                </linearGradient>
                <linearGradient id="pmcCornerGoldTop" x1="110" y1="-10" x2="330" y2="86" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#F8D76A" />
                  <stop offset="50%" stopColor="#D9A323" />
                  <stop offset="100%" stopColor="#DFA91E" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="pointer-events-none select-none fixed bottom-0 left-0 w-64 h-44 overflow-hidden z-0 opacity-20 hidden lg:block">
            <svg viewBox="0 0 240 160" fill="none" className={cn("w-full h-full", isActiveCatNonVeg ? "text-[#8B1E16]" : "text-[#004B35]")}>
              <path d="M12 155 C35 110 72 82 124 72 C95 108 65 138 12 155 Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.18" />
              <path d="M8 120 C22 86 50 62 84 52 C68 82 40 105 8 120 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
              <path d="M58 158 C88 128 130 112 174 114 C138 138 98 154 58 158 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.12" />
            </svg>
          </div>
        </>
      )}

      {/* Subtle Botanical Gold Corner Flourishes for Package Detail & Checkout Views */}
      {(viewMode === "checkout" || viewMode === "package_detail") && (
        <>
          <div className="pointer-events-none select-none fixed top-[58px] left-0 w-32 h-36 overflow-hidden z-0 opacity-55 hidden lg:block">
            <svg viewBox="0 0 130 140" fill="none" className="w-full h-full text-[#C8941A]">
              <path d="M4 4 C14 48 16 88 8 130" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.65" />
              <path d="M10 38 C28 24 46 22 58 28 C44 40 28 44 10 38 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
              <path d="M12 72 C34 58 54 58 68 68 C48 80 30 82 12 72 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
              <path d="M8 102 C22 92 38 94 48 104 C34 112 20 112 8 102 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          <div className="pointer-events-none select-none fixed top-[58px] right-0 w-36 h-40 overflow-hidden z-0 opacity-55 hidden lg:block">
            <svg viewBox="0 0 140 150" fill="none" className="w-full h-full text-[#C8941A]">
              <path d="M132 6 C116 54 112 96 122 140" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.65" />
              <path d="M124 38 C104 22 82 22 68 30 C84 44 104 46 124 38 Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1" />
              <path d="M118 76 C94 60 72 62 56 72 C78 86 98 86 118 76 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
              <path d="M120 108 C102 98 84 100 72 110 C88 118 104 118 120 108 Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
          {viewMode === "package_detail" && (
            <div className="pointer-events-none select-none fixed bottom-0 left-0 w-36 h-36 overflow-hidden z-0 opacity-50 hidden lg:block">
              <svg viewBox="0 0 150 150" fill="none" className="w-full h-full text-[#C8941A]">
                <path d="M4 146 C36 108 62 78 98 56" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.6" />
                <path d="M36 110 C38 86 28 66 12 56 C14 80 22 96 36 110 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
                <path d="M60 88 C78 82 94 90 104 106 C84 106 70 100 60 88 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
                <path d="M78 68 C80 48 68 32 52 24 C56 44 64 58 78 68 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          )}
          <div className="pointer-events-none select-none fixed bottom-0 right-0 w-40 h-40 overflow-hidden z-0 opacity-50 hidden lg:block">
            <svg viewBox="0 0 160 160" fill="none" className="w-full h-full text-[#C8941A]">
              <path d="M156 156 C122 116 96 86 58 64" stroke="currentColor" strokeWidth="1.3" strokeOpacity="0.6" />
              <path d="M122 118 C118 94 128 74 144 62 C142 86 134 104 122 118 Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
              <path d="M98 94 C78 88 64 96 54 112 C74 112 88 106 98 94 Z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1" />
              <path d="M78 74 C76 54 88 38 104 30 C100 50 92 64 78 74 Z" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </>
      )}

      {/* Build Header */}
      {viewMode === "custom" ? (
        <div className="bg-[#FBF7EF]/95 backdrop-blur-sm border-b border-[#E8C77A]/50 sticky top-[56px] sm:top-[58px] z-20 select-none shadow-[0_4px_18px_rgba(0,46,34,0.05)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3">
            {/* Left Controls & Title Branding */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {/* Back button */}
              <button
                type="button"
                onClick={() => setViewMode("package_detail")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFDF8] border border-[#E8C77A] hover:border-[#D9A323] text-[#173D30] rounded-full font-semibold text-xs shadow-2xs hover:shadow-[0_2px_10px_rgba(217,163,35,0.2)] transition-all cursor-pointer shrink-0 whitespace-nowrap"
              >
                <ArrowLeft size={13} className="text-[#004B35]" />
                <span>Back</span>
              </button>

              {/* Brand Title */}
              <div className="flex items-center gap-2 min-w-0 border-l border-[#E8C77A]/50 pl-3 sm:pl-4">
                <div className="flex flex-col text-left min-w-0">
                  <h1
                    className="font-serif font-bold text-base sm:text-lg lg:text-[21px] tracking-tight text-[#002E22] uppercase leading-tight truncate"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    {caterer.name || "ELITE CATERING"}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] text-[#B8860B] font-sans leading-none mt-1 truncate">
                    <MapPin size={11} className="text-[#D9A323] shrink-0" />
                    <span className="truncate">
                      {caterer.tagline || caterer.location || "Curated Catering Menu"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Center Decorative Dining Cloche Divider */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-[260px] mx-auto px-2 opacity-90">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D9A323]/60 to-[#D9A323]" />
              <div className="mx-3 text-[#C8941A] flex items-center justify-center">
                <svg width="24" height="18" viewBox="0 0 28 20" fill="none" aria-hidden="true">
                  <circle cx="14" cy="3.5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 14C5 9.02944 9.02944 5 14 5C18.9706 5 23 9.02944 23 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M2.5 16.5H25.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M4 14H24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D9A323]/60 to-[#D9A323]" />
            </div>

            {/* Right Guests Selector with Editable Numeric Input */}
            <div className="flex items-center gap-2 shrink-0 sm:pr-4">
              <div className="flex items-center bg-[#FFFDF8] border border-[#E8C77A] rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={decrementGuests}
                  className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-[#173D30] hover:bg-[#FAF1D6]/70 border-r border-[#E8C77A]/60 transition-colors font-bold text-sm cursor-pointer"
                  title="Decrease Guests"
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={guestInputVal}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setGuestInputVal(val);
                  }}
                  onBlur={() => handleGuestSubmit(guestInputVal)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-11 sm:w-14 h-7 sm:h-8 text-center font-bold text-xs sm:text-sm text-[#002E22] bg-[#FFFDF8] outline-none focus:bg-[#FFF9EC] tabular-nums"
                  title="Click to type guest count directly"
                />
                <button
                  type="button"
                  onClick={incrementGuests}
                  className="w-7 sm:w-8 h-7 sm:h-8 flex items-center justify-center text-[#173D30] hover:bg-[#FAF1D6]/70 border-l border-[#E8C77A]/60 transition-colors font-bold text-sm cursor-pointer"
                  title="Increase Guests"
                >
                  +
                </button>
              </div>
              <span className="font-semibold text-xs text-[#173D30] hidden xs:inline">
                Guests
              </span>
            </div>
          </div>

          {/* Horizontal Category Tabs Row with Scroll Arrows & Track */}
          <div className="border-t border-[#E8C77A]/35 bg-[#FBF7EF]/95">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-1.5">
              <div className="flex items-center gap-2">
                {/* Left Scroll Arrow */}
                <button
                  type="button"
                  onClick={() =>
                    categoryScrollContainerRef.current?.scrollBy({
                      left: -260,
                      behavior: "smooth",
                    })
                  }
                  aria-label="Scroll categories left"
                  className="w-7 h-7 rounded-full bg-[#FFFDF8] border border-[#E8C77A] hover:border-[#D9A323] hover:bg-[#FFF9EC] text-[#173D30] flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Scrollable Category Pills */}
                <div
                  ref={categoryScrollContainerRef}
                  className="flex-1 flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
                >
                  {menuCategories.map((cat: string) => {
                    const catData = selectedPackage?.categories?.find(
                      (c: any) => c.categoryName === cat,
                    );
                    const catItems = catData?.items || [];
                    const selectedCount = catItems.filter(
                      (i: string) => selectedItems[i],
                    ).length;
                    const match = catData?.selectionRule?.match(/\d+/);
                    const catLimit = match ? parseInt(match[0], 10) : 0;
                    const hasSelectedItems = selectedCount > 0;
                    const isCompleted =
                      hasSelectedItems && (catLimit === 0 || selectedCount >= catLimit);
                    const isActive = activeCategory === cat;
                    const isCatNonVeg = isCategoryNonVeg(cat, catItems);
                    const isHighlighted =
                      highlightIncomplete && catLimit > 0 && selectedCount < catLimit;
                    const badgeLabel =
                      catLimit > 1 && hasSelectedItems && !isCompleted
                        ? `${selectedCount}/${catLimit}`
                        : `${selectedCount}`;

                    return (
                      <button
                        key={cat}
                        ref={(el) => {
                          categoryTabRefs.current[cat] = el;
                        }}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          "relative px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border select-none shrink-0",
                          isActive
                            ? isCatNonVeg
                              ? "bg-gradient-to-r from-[#8B1E16] to-[#6B140E] text-[#FFFDF8] border-[#D9A323] font-bold shadow-[0_4px_14px_rgba(139,30,22,0.34)] ring-1 ring-[#F8D76A]/45 -translate-y-[1px]"
                              : "bg-gradient-to-r from-[#004B35] to-[#003526] text-[#FFFDF8] border-[#D9A323] font-bold shadow-[0_4px_14px_rgba(217,163,35,0.34)] ring-1 ring-[#F8D76A]/45 -translate-y-[1px]"
                            : isCompleted
                              ? "bg-[#EAF7EC] hover:bg-[#DFF3E3] text-[#004B35] font-semibold border-[#74C69D] hover:border-[#40916C] shadow-[0_2px_6px_rgba(21,128,61,0.08)]"
                              : "bg-[#FFFDF8] hover:bg-[#FFF8E8] text-[#004B35] font-semibold border-[#E8C77A] hover:border-[#D9A323] shadow-[0_2px_6px_rgba(217,163,35,0.08)]",
                          isHighlighted &&
                            !isActive &&
                            "border-red-500 bg-red-50 text-red-700",
                        )}
                      >
                        {/* Leading Icon: Independent Green Checkmark if completed, plus Dietary Icon */}
                        {isCompleted && (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center shrink-0",
                              isActive ? "text-[#4ADE80]" : "text-[#15803D]",
                            )}
                            title="Completed"
                          >
                            <Check size={13} strokeWidth={3} />
                          </span>
                        )}

                        {(!isCompleted || isActive) && (
                          isCatNonVeg ? (
                            <NonVegDrumstickIcon
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isActive ? "text-[#FCA5A5]" : "text-[#A63A2E]",
                              )}
                            />
                          ) : (
                            <VegLeafIcon
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isActive ? "text-[#4ADE80]" : "text-[#C58E17]",
                              )}
                            />
                          )
                        )}

                        <span>{cat}</span>

                        {/* Circular Count Badge */}
                        <span
                          className={cn(
                            "min-w-[20px] h-5 px-1.5 rounded-full text-[10.5px] font-bold inline-flex items-center justify-center tabular-nums transition-colors",
                            isActive
                              ? isCatNonVeg
                                ? "bg-[#F4C430] text-[#4A0D09]"
                                : "bg-[#F4C430] text-[#002E22]"
                              : isCompleted
                                ? "bg-[#15803D] text-white"
                                : "bg-[#FBF0CC] text-[#9A6B11] border border-[#E8C77A]",
                          )}
                        >
                          {badgeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Scroll Arrow */}
                <button
                  type="button"
                  onClick={() =>
                    categoryScrollContainerRef.current?.scrollBy({
                      left: 260,
                      behavior: "smooth",
                    })
                  }
                  aria-label="Scroll categories right"
                  className="w-7 h-7 rounded-full bg-[#FFFDF8] border border-[#E8C77A] hover:border-[#D9A323] hover:bg-[#FFF9EC] text-[#173D30] flex items-center justify-center shadow-2xs transition-all cursor-pointer shrink-0"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Subtle Category Progress / Indicator Bar */}
              {menuCategories.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      "text-[9px] leading-none select-none",
                      isActiveCatNonVeg ? "text-[#8B1E16]/70" : "text-[#004B35]/70",
                    )}
                    aria-hidden="true"
                  >
                    ◀
                  </span>
                  <div className="flex-1 h-[3px] rounded-full bg-[#E8DFC8] overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isActiveCatNonVeg
                          ? "bg-gradient-to-r from-[#8B1E16] to-[#B03A2E]"
                          : "bg-gradient-to-r from-[#004B35] to-[#15803D]",
                      )}
                      style={{
                        width: `${Math.max(
                          8,
                          Math.round(
                            ((activeCategoryIndex + 1) / (menuCategories.length || 1)) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] leading-none select-none",
                      isActiveCatNonVeg ? "text-[#8B1E16]/70" : "text-[#004B35]/70",
                    )}
                    aria-hidden="true"
                  >
                    ▶
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : viewMode === "package_detail" ? (
        <div className="bg-transparent pt-3 pb-2 sm:pt-4 sm:pb-2.5 z-20 relative select-none">
          <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2.5">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#354B43] font-sans tracking-wide">
              <Link to="/" className="hover:text-[#8E6211] transition-colors font-semibold text-[#173D30]">Home</Link>
              <ChevronRight size={12} className="text-[#8E6211]/70 shrink-0" />
              <Link to="/explore" className="hover:text-[#8E6211] transition-colors font-semibold text-[#173D30]">Explore Caterers</Link>
              <ChevronRight size={12} className="text-[#8E6211]/70 shrink-0" />
              <Link to={`/caterer/${id}`} className="hover:text-[#8E6211] transition-colors font-semibold text-[#173D30] truncate max-w-[160px] sm:max-w-[240px]">{caterer?.name}</Link>
              <ChevronRight size={12} className="text-[#8E6211]/70 shrink-0" />
              <span className="text-[#B8860B] font-bold truncate max-w-[180px] sm:max-w-[260px]">{selectedPackage?.packageName || selectedPackage?.name || "Classic"}</span>
            </div>

            <div className="flex items-center justify-start gap-3 sm:gap-3.5">
              {/* Circular Gold Back Arrow Button */}
              <button
                type="button"
                onClick={() => {
                  navigate(`/caterer/${id}`, { state: { fromOrder: true, selectedPackageId: selectedPackage?.id, guests: guests } });
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#FFFDF8] to-[#F6E6B7] hover:from-white hover:to-[#FCEEBF] border border-[#D9A323] text-[#173D30] active:scale-95 transition-all cursor-pointer shrink-0 shadow-[0_3px_10px_rgba(217,163,35,0.16)]"
                title="Back to Caterer"
                aria-label="Back to Caterer"
              >
                <ArrowLeft size={17} strokeWidth={2.2} className="text-[#173D30]" />
              </button>

              {/* Serif Package Heading with Botanical Gold Wheat Sprig */}
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1
                    className="font-serif font-extrabold text-2xl sm:text-[30px] tracking-tight text-[#0B1F17] uppercase leading-none"
                    style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                  >
                    {selectedPackage?.packageName || "Classic"}
                  </h1>
                  <svg viewBox="0 0 64 28" fill="none" className="w-12 sm:w-14 h-6 text-[#D9A323] shrink-0" aria-hidden="true">
                    <path d="M4 24 C20 18 38 11 58 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <path d="M22 17 C20 10 25 5 32 4 C31 11 27 15 22 17 Z" fill="currentColor" fillOpacity="0.85" />
                    <path d="M35 12 C34 5 39 2 46 2 C44 8 40 11 35 12 Z" fill="currentColor" fillOpacity="0.85" />
                    <path d="M26 16 C33 17 39 21 41 26 C34 25 29 21 26 16 Z" fill="currentColor" fillOpacity="0.72" />
                    <path d="M40 11 C46 12 52 15 54 20 C47 19 43 16 40 11 Z" fill="currentColor" fillOpacity="0.72" />
                  </svg>
                </div>
                <span className="text-[10.5px] sm:text-xs font-sans font-bold text-[#354B43] uppercase tracking-[0.18em] mt-1 truncate">
                  {caterer.name} • {caterer.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : viewMode === "checkout" ? (
        <div className="bg-[#FBF7EF]/95 py-4 sm:py-5 z-10 relative">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <button
                type="button"
                onClick={() => setViewMode("custom")}
                aria-label="Back to Menu Selection"
                className="w-10 h-10 bg-white hover:bg-[#FFF9E8] border border-[#E8C77A] hover:border-[#D9A323] rounded-full transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-[0_3px_10px_rgba(0,46,34,0.06)] active:scale-95"
              >
                <ArrowLeft size={17} className="text-[#8E6211]" />
              </button>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFFDF8] to-[#FBF3DB] border border-[#D9A323]/75 flex items-center justify-center shrink-0 shadow-[0_3px_10px_rgba(217,163,35,0.12)]">
                <Calendar size={19} className="text-[#C8941A]" />
              </div>

              <div className="text-left min-w-0">
                <h1
                  className="font-serif text-[22px] sm:text-[30px] text-[#0B1F17] font-extrabold tracking-tight leading-tight truncate"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Book Your Event
                </h1>
                <p className="text-xs sm:text-[13.5px] text-[#354B43] font-semibold mt-0.5 truncate max-w-full">
                  {caterer.name} • {caterer.location}
                </p>
              </div>
            </div>

            {/* Decorative Gold Horizontal Diamond Separator */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-[290px] mx-auto px-2 select-none" aria-hidden="true">
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#D9A323]/65 to-[#D9A323]" />
              <div className="mx-2.5 flex items-center gap-1 text-[#C8941A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9A323]/70" />
                <span className="w-2.5 h-2.5 rotate-45 border-[1.5px] border-[#C8941A] bg-[#FBF7EF] flex items-center justify-center">
                  <span className="w-1 h-1 bg-[#D9A323]" />
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D9A323]/70" />
              </div>
              <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-[#D9A323]/65 to-[#D9A323]" />
            </div>

            <div className="inline-flex items-center gap-2 text-[#173D30] font-sans text-xs border border-[#E8C77A]/80 px-4 py-2 rounded-full bg-white shadow-[0_3px_12px_rgba(0,46,34,0.06)] shrink-0 font-bold tracking-wide">
              <ShieldCheck size={16} className="text-[#0B1F17] shrink-0" />
              <span className="hidden xs:inline">Secure Booking</span>
              <span className="xs:hidden">Secure</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFDF8] border-b border-[#DFC78A] py-4.5 shadow-sm z-10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("package_detail")}
                className="hover:bg-[#FAF3E2] border border-[#DFC78A] p-2 rounded-full transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              >
                <ArrowLeft size={18} className="text-[#083A28]" />
              </button>
              <div className="text-left">
                <h1
                  className="font-display font-bold text-xl sm:text-2xl leading-tight text-[#083A28] tracking-tight"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  {selectedPackage?.packageName || selectedPackage?.name || "Build Your Menu"}
                </h1>
                <p className="text-xs sm:text-sm text-[#5D665F] font-medium">
                  {caterer.name} • {caterer.location}
                </p>
              </div>
            </div>

            {viewMode !== "package_detail" && (
              <div className="flex items-center gap-4 hidden sm:flex">
                <div className="bg-[#FAF3E2] border border-[#DFC78A] rounded-lg p-1.5 flex items-center">
                  <button
                    onClick={decrementGuests}
                    className="w-8 h-8 flex items-center justify-center bg-[#FFFDF8] rounded-md shadow-sm text-[#083A28] border border-[#DFC78A] hover:bg-[#FAF0D4] cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <div className="px-4 font-bold text-[#083A28] w-28 text-center">
                    {guests} Guests
                  </div>
                  <button
                    onClick={incrementGuests}
                    className="w-8 h-8 flex items-center justify-center bg-[#FFFDF8] rounded-md shadow-sm text-[#083A28] border border-[#DFC78A] hover:bg-[#FAF0D4] cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {false && (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="bg-white rounded-2xl shadow-sm border border-brand-green-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-brand-green-900">
                {caterer.name}
              </h2>
              <p className="flex items-center gap-1 text-slate-600 text-sm mt-1">
                <MapPin size={16} className="text-slate-400" />{" "}
                {caterer.location}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 min-w-max">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 sm:hidden">
                Need Help?
              </span>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
                📞 Call
              </button>
              <button className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] font-bold text-sm rounded-xl hover:bg-[#25D366]/20 transition-colors">
                📱 WhatsApp
              </button>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                📍 Location
              </button>
            </div>
          </div>

          {packageDefinitions.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
              <ChefHat className="mx-auto mb-4 text-slate-300" size={48} />
              <h3 className="font-bold text-xl text-slate-700 mb-2">
                No Packages Found
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                This caterer has not uploaded their menu packages yet. Please
                check back later.
              </p>
            </div>
          ) : (
            <div>
              <div className="text-center mb-10">
                <h2 className="text-4xl font-display font-bold text-slate-900 mb-4 tracking-tight">
                  Choose Your Package
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px bg-brand-gold-300 w-12 border-0"></div>
                  <Star
                    size={12}
                    className="text-brand-gold-500 fill-brand-gold-500"
                  />
                  <div className="h-px bg-brand-gold-300 w-12 border-0"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packageDefinitions.map((pkg, idx) => {
                  const sortedSlabs = pkg.pricingSlabs
                    ? [...pkg.pricingSlabs].sort(
                        (a: any, b: any) => a.minGuests - b.minGuests,
                      )
                    : [];
                  const minGuests =
                    sortedSlabs.length > 0
                      ? sortedSlabs[0].minGuests
                      : pkg.minimumGuests || 100;
                  const minPrice =
                    sortedSlabs.length > 0
                      ? Math.min(...sortedSlabs.map((s: any) => s.price))
                      : pkg.pricePerPlate || caterer?.startingPrice || 350;
                  const totalCategories = pkg.categories
                    ? pkg.categories.length
                    : 0;

                  const tier = getPackageTier(pkg.packageName, idx);

                  let cardBgAndBorder =
                    "bg-gradient-to-b from-white to-slate-50/70 border-slate-200 hover:border-slate-350 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)]";
                  let headerColor = "text-[#0F3D2E]";
                  let buttonColor =
                    "bg-[#0F3D2E] text-white hover:bg-[#0A2F24] border-[1.5px] border-[#D4AF37]/50 hover:border-[#D4AF37] hover:shadow-[0_4px_15px_rgba(11,61,46,0.15)]";

                  if (tier === "gold") {
                    cardBgAndBorder =
                      "bg-gradient-to-b from-white to-[#FCFAF5] border-2 border-[#D4AF37]/45 hover:border-[#D4AF37] hover:shadow-[0_20px_50px_rgba(212,175,55,0.16)]";
                    headerColor = "text-[#886C1D]";
                    buttonColor =
                      "bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-white border-[1.5px] border-[#D4AF37]/65 hover:from-[#E4BC50] hover:to-[#C8A437] shadow-[0_4px_20px_rgba(212,175,55,0.22)]";
                  } else if (tier === "silver") {
                    cardBgAndBorder =
                      "bg-gradient-to-b from-white to-slate-50 border-2 border-slate-300 hover:border-slate-450 hover:shadow-[0_20px_50px_rgba(15,41,34,0.08)]";
                    headerColor = "text-slate-700";
                    buttonColor =
                      "bg-slate-800 text-white hover:bg-slate-900 border-[1.5px] border-[#C0C0C0]/50 hover:border-[#C0C0C0]/80 hover:shadow-[0_4px_15px_rgba(0,0,0,0.15)]";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        const pkgMin = getPackageMinGuests(pkg);
                        setSelectedPackage(pkg);
                        setSelectedItems({});
                        setGuests((prev) => Math.max(pkgMin, Number(prev) || pkgMin));
                        setGuestInputVal(String(Math.max(pkgMin, Number(guests) || pkgMin)));
                        setViewMode("package_detail");
                      }}
                      className={cn(
                        "rounded-2xl sm:rounded-[32px] p-4 sm:p-8 cursor-pointer hover:-translate-y-1.5 transition-all duration-350 flex flex-col relative overflow-visible group shadow-sm hover:shadow-md text-center mt-5 sm:mt-7",
                        cardBgAndBorder,
                      )}
                    >
                      {/* Luxury overlapping Crown design with 3D shadow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white border border-[#D4AF37]/35 shadow-[0_4px_12px_rgba(212,175,55,0.15)] flex items-center justify-center p-1.5 sm:p-2.5">
                          <CrownIcon
                            tier={tier}
                            className="w-6 h-6 sm:w-10 sm:h-10"
                          />
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/3 rounded-bl-full -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform blur-xl"></div>

                      <div className="mb-5 mt-4 relative z-10 flex flex-col items-center">
                        {/* Premium Veg / Non-Veg Badge */}
                        <div className="mb-3.5">
                          {renderVegNonVegBadge(pkg.packageType)}
                        </div>

                        <h4
                          className={cn(
                            "font-display font-bold text-2xl uppercase tracking-wider mb-1 line-clamp-1 h-8",
                            headerColor,
                          )}
                        >
                          {pkg.packageName || "Catering Package"}
                        </h4>
                      </div>

                      <div className="mb-6 relative z-10 flex-1 flex flex-col justify-between">
                        {/* Center-aligned Pricing with serif font (Requirement 3) */}
                        <div className="my-2 sm:my-4 py-2 sm:py-4 px-3 sm:px-6 bg-gradient-to-br from-[#FCFAF5] to-[#F5EFE1]/20 rounded-xl sm:rounded-2xl border border-[#D4AF37]/18 flex flex-col items-center justify-center relative overflow-hidden group-hover:border-[#D4AF37]/50 transition-all duration-300">
                          {/* Subtle background motif */}
                          <div className="absolute right-2 bottom-0 top-0 w-1/4 opacity-[0.06] pointer-events-none flex items-center justify-end select-none">
                            <svg
                              viewBox="0 0 100 100"
                              className="w-10 h-10 text-[#D4AF37]"
                              stroke="currentColor"
                            >
                              <path
                                d="M10 90 C10 90 10 40 50 20 C65 12 75 15 80 22 C85 29 80 45 65 60 C45 80 10 90 10 90 Z"
                                fill="none"
                                strokeWidth="1"
                              />
                            </svg>
                          </div>

                          <div className="text-xl sm:text-4.5xl font-display font-black text-[#0F3D2E] tracking-tight">
                            ₹{minPrice}
                          </div>
                          <div className="text-[9px] sm:text-[10px] font-sans font-black text-slate-450 uppercase tracking-widest mt-0.5">
                            / Plate
                          </div>
                        </div>

                        <p className="text-[10px] sm:text-[11px] italic text-slate-400 font-medium mb-3 sm:mb-5 px-3 line-clamp-1 sm:line-clamp-none">
                          "
                          {pkg.description ||
                            "Special selection carefully curated for your prestigious guests."}
                          "
                        </p>

                        {/* Premium Features Card styling inspired by the mockup (Requirement 5) */}
                        <div className="bg-[#FAF8F5]/85 rounded-xl sm:rounded-2xl border border-[#D4AF37]/12 py-2.5 sm:py-4 px-3 sm:px-4.5 space-y-2 sm:space-y-3.5 text-left shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-5.5 h-5.5 rounded-full bg-white border border-[#D4AF37]/25 flex items-center justify-center shrink-0 text-[#D4AF37] shadow-3xs">
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                            <span className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-slate-700">
                              {totalCategories} Categories Included
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-5.5 h-5.5 rounded-full bg-white border border-[#D4AF37]/25 flex items-center justify-center shrink-0 text-[#D4AF37] shadow-3xs">
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                            </div>
                            <span className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-slate-700">
                              Select Any 1 Item
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-5.5 h-5.5 rounded-full bg-white border border-[#D4AF37]/25 flex items-center justify-center shrink-0 text-[#D4AF37] shadow-3xs">
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                              </svg>
                            </div>
                            <span className="font-sans font-extrabold text-[10px] uppercase tracking-wider text-slate-700">
                              {minGuests}+ Guests Limit
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto relative z-10 pt-2">
                        <button
                          type="button"
                          className={cn(
                            "w-full py-2 sm:py-3.5 px-4 sm:px-6 font-sans font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 text-[10px] sm:text-2xs cursor-pointer group",
                            buttonColor,
                          )}
                        >
                          <span>View Details</span>
                          <ChevronRight
                            size={13}
                            className="stroke-[3] transition-transform group-hover:translate-x-1"
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === "package_detail" && selectedPackage && (
        <div className="flex-1 w-full max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-2 relative z-10 box-border">
          {/* Outer Luxury Double-Framed Ivory & Gold Container */}
          <div className="bg-[#FFFDF8] rounded-2xl p-2 sm:p-3 shadow-[0_14px_40px_rgba(0,46,34,0.09)] border-[1.5px] border-[#D9A323]/75 relative w-full max-w-full box-border">
            <div className="rounded-xl flex flex-col relative w-full max-w-full box-border">
              {/* Rich Dark Emerald Gradient Header Panel with Gold Accents & Catering Cloche Motif */}
              <div className="bg-gradient-to-r from-[#00513A] via-[#003B2A] to-[#00261B] text-white px-4 py-3.5 sm:px-6 sm:py-4.5 rounded-xl relative overflow-hidden select-none border-[1.5px] border-[#D9A323]/80 shadow-[0_6px_18px_rgba(0,46,34,0.16)]">
                {/* Subtle Gold Corner Filigree Curves matching Screenshot 2 */}
                <svg
                  viewBox="0 0 80 80"
                  fill="none"
                  className="pointer-events-none select-none absolute left-0 bottom-0 w-16 h-16 text-[#D9A323] opacity-75"
                  aria-hidden="true"
                >
                  <path d="M0 80 L0 36 C12 58 28 70 52 80 Z" fill="currentColor" fillOpacity="0.45" />
                  <path d="M0 36 C12 58 28 70 52 80" stroke="#F8D76A" strokeWidth="1.5" />
                </svg>
                <svg
                  viewBox="0 0 80 80"
                  fill="none"
                  className="pointer-events-none select-none absolute right-0 bottom-0 w-16 h-16 text-[#D9A323] opacity-75"
                  aria-hidden="true"
                >
                  <path d="M80 80 L80 36 C68 58 52 70 28 80 Z" fill="currentColor" fillOpacity="0.45" />
                  <path d="M80 36 C68 58 52 70 28 80" stroke="#F8D76A" strokeWidth="1.5" />
                </svg>

                {/* Faint Catering Cloche & Steam Watermark */}
                <svg
                  viewBox="0 0 120 80"
                  fill="none"
                  className="pointer-events-none select-none absolute left-1/2 -translate-x-1/4 top-1/2 -translate-y-1/2 w-36 h-24 text-[#D9A323] opacity-20 hidden sm:block"
                  aria-hidden="true"
                >
                  <circle cx="52" cy="18" r="4" stroke="currentColor" strokeWidth="2.2" />
                  <path d="M22 52 C22 35.4 35.4 22 52 22 C68.6 22 82 35.4 82 52" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M12 58 H92" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                  <path d="M16 52 H88" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M90 36 C96 30 92 22 98 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M100 40 C106 34 102 26 108 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    {/* Metallic Gold Medallion with Catering Cloche Icon */}
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-[#FCE79C] via-[#E2AE2F] to-[#B68112] border-2 border-[#FFF4CE]/85 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.28)] shrink-0">
                      <svg viewBox="0 0 36 28" fill="none" className="w-6.5 h-5.5 sm:w-7.5 sm:h-6 text-[#003B2A]" aria-hidden="true">
                        <circle cx="18" cy="5.5" r="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M6 19.5C6 12.8726 11.3726 7.5 18 7.5C24.6274 7.5 30 12.8726 30 19.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                        <path d="M3 22.5H33" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                        <path d="M5 19.5H31" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div className="text-left flex-1 min-w-0">
                      <h2
                        className="text-xl sm:text-2xl lg:text-[26px] font-serif font-bold text-white tracking-wide uppercase leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] truncate"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        {selectedPackage.packageName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        <span className="text-xs sm:text-[13.5px] text-[#E6EFEA] font-medium tracking-wide truncate">
                          {caterer.name} • {caterer.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side VEG/NON-VEG & Minimum Guest Badges */}
                  <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center shrink-0">
                    {(() => {
                      const lower = (selectedPackage.packageType || "Veg").toLowerCase();
                      let isVeg = true;
                      let isNonVeg = false;
                      if (lower.includes("non-veg") || lower.includes("non veg") || lower.includes("nonveg")) {
                        if (lower.includes("both") || lower.includes("allow") || lower.includes("+") || lower.includes("&")) {
                          isVeg = true;
                          isNonVeg = true;
                        } else {
                          isVeg = false;
                          isNonVeg = true;
                        }
                      } else if (lower.includes("both") || lower.includes("+") || lower.includes("&") || lower.includes("mixed")) {
                        isVeg = true;
                        isNonVeg = true;
                      } else if (lower.includes("veg")) {
                        isVeg = true;
                        isNonVeg = false;
                      } else {
                        isVeg = true;
                        isNonVeg = true;
                      }

                      return (
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF8] border border-[#E8C77A] shadow-sm select-none">
                          {isVeg && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#173D30] tracking-wide uppercase">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block shrink-0" />
                              <span>VEG</span>
                            </span>
                          )}
                          {isNonVeg && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-[#173D30] tracking-wide uppercase">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] inline-block shrink-0" />
                              <span>NON-VEG</span>
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00281D]/85 border border-[#D9A323]/85 text-xs font-bold text-[#FFFDF8] font-sans shadow-sm">
                      <Users size={13} className="text-[#F8D76A] shrink-0" />
                      <span className="tabular-nums">Min {getPackageMinGuests(selectedPackage)}+</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-5 px-1 sm:px-2 pb-1.5 bg-[#FFFDF8]">
                {/* 2-Column Responsive Layout on Desktop, 1-Column on Mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                  {/* LEFT COLUMN: Package Price Card & Pricing Tiers */}
                  <div className="lg:col-span-6 flex flex-col gap-5">
                    {/* Package Price Card */}
                    <div className="relative bg-gradient-to-b from-[#FFFDF8] via-[#FCF6E5] to-[#F8EBD0]/65 rounded-2xl border border-[#D9A323]/75 px-4 py-5 sm:px-6 sm:py-6 hover:border-[#D9A323] transition-all duration-300 overflow-hidden shadow-[0_6px_22px_rgba(217,163,35,0.10)] flex flex-col items-center justify-center text-center">
                      {/* Subtle Botanical Corner Accents */}
                      <svg aria-hidden="true" viewBox="0 0 110 90" fill="none" className="pointer-events-none select-none absolute top-0 left-0 w-24 h-20 text-[#C8941A] opacity-20">
                        <path d="M6 4 C20 26 42 44 74 54" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M22 22 C34 12 50 12 62 18 C48 28 34 30 22 22 Z" fill="currentColor" fillOpacity="0.45" />
                        <path d="M42 40 C54 32 68 34 78 42 C64 50 50 50 42 40 Z" fill="currentColor" fillOpacity="0.35" />
                      </svg>
                      <svg aria-hidden="true" viewBox="0 0 110 90" fill="none" className="pointer-events-none select-none absolute top-0 right-0 w-24 h-20 text-[#C8941A] opacity-20">
                        <path d="M104 4 C90 26 68 44 36 54" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M88 22 C76 12 60 12 48 18 C62 28 76 30 88 22 Z" fill="currentColor" fillOpacity="0.45" />
                        <path d="M68 40 C56 32 42 34 32 42 C46 50 60 50 68 40 Z" fill="currentColor" fillOpacity="0.35" />
                      </svg>

                      {/* Heading with Gold Crown */}
                      <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
                        <Crown size={15} className="text-[#C8941A] fill-[#D9A323] shrink-0" />
                        <span className="text-[11px] sm:text-xs font-sans font-extrabold tracking-[0.22em] text-[#0B1F17] uppercase">
                          PACKAGE PRICE
                        </span>
                      </div>

                      {/* Hero Gold Price Flanked by Symmetric Botanical Wreaths */}
                      <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-5 my-0.5">
                        {/* Left Gold Wreath */}
                        <svg viewBox="0 0 40 58" fill="none" className="w-8 sm:w-9 h-12 sm:h-14 text-[#D9A323] shrink-0" aria-hidden="true">
                          <path d="M28 52 C14 42 10 24 20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M15 41 C9 37 6 31 8 25 C14 29 16 35 15 41 Z" fill="currentColor" fillOpacity="0.82" />
                          <path d="M13 28 C8 23 7 16 11 11 C15 16 16 22 13 28 Z" fill="currentColor" fillOpacity="0.82" />
                          <path d="M20 45 C17 48 14 52 15 56 C20 53 22 49 20 45 Z" fill="currentColor" fillOpacity="0.72" />
                          <path d="M16 17 C14 11 16 6 21 3 C22 9 20 13 16 17 Z" fill="currentColor" fillOpacity="0.82" />
                        </svg>

                        <span
                          className="font-serif font-extrabold text-[40px] sm:text-[48px] leading-none select-all tabular-nums"
                          style={{
                            fontFamily: '"Playfair Display", Georgia, serif',
                            background: "linear-gradient(180deg, #E2A923 0%, #C68914 55%, #A66E08 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            filter: "drop-shadow(0px 1px 1px rgba(130, 88, 12, 0.14))",
                          }}
                        >
                          ₹{currentPerPlatePrice}
                        </span>

                        {/* Right Gold Wreath */}
                        <svg viewBox="0 0 40 58" fill="none" className="w-8 sm:w-9 h-12 sm:h-14 text-[#D9A323] shrink-0 -scale-x-100" aria-hidden="true">
                          <path d="M28 52 C14 42 10 24 20 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          <path d="M15 41 C9 37 6 31 8 25 C14 29 16 35 15 41 Z" fill="currentColor" fillOpacity="0.82" />
                          <path d="M13 28 C8 23 7 16 11 11 C15 16 16 22 13 28 Z" fill="currentColor" fillOpacity="0.82" />
                          <path d="M20 45 C17 48 14 52 15 56 C20 53 22 49 20 45 Z" fill="currentColor" fillOpacity="0.72" />
                          <path d="M16 17 C14 11 16 6 21 3 C22 9 20 13 16 17 Z" fill="currentColor" fillOpacity="0.82" />
                        </svg>
                      </div>

                      {/* Gold Ribbon Banner for PER PLATE */}
                      <div className="relative z-10 mt-2 inline-flex items-center justify-center px-6 py-1 bg-gradient-to-r from-[#E2AD30] via-[#F7D877] to-[#DBA222] rounded-sm shadow-[0_2px_8px_rgba(184,134,11,0.22)]">
                        <span className="text-[11px] font-sans font-extrabold text-[#173D30] uppercase tracking-[0.22em] leading-none">
                          PER PLATE
                        </span>
                      </div>

                      {/* Package Description Quote */}
                      <p className="relative z-10 text-xs sm:text-[13px] text-[#354B43] italic mt-3.5 text-center max-w-md leading-relaxed line-clamp-2">
                        "{selectedPackage.description || "Curated premium catering spread with chef-crafted delicacies tailored for your event."}"
                      </p>

                      {/* Food Categories & Customizable Pills */}
                      {selectedPackage.categories && selectedPackage.categories.length > 0 && (
                        <div className="relative z-10 flex flex-wrap items-center justify-center gap-2.5 mt-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F17] bg-white border border-[#E8C77A] px-3.5 py-1.5 rounded-full shadow-[0_2px_6px_rgba(0,46,34,0.05)]">
                            <Leaf size={13} className="text-[#108A48] fill-[#108A48]/15 shrink-0" />
                            <span>{selectedPackage.categories.length} Food Categories</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B1F17] bg-white border border-[#E8C77A] px-3.5 py-1.5 rounded-full shadow-[0_2px_6px_rgba(0,46,34,0.05)]">
                            <Star size={13} className="text-[#C8941A] fill-[#D9A323] shrink-0" />
                            <span>Fully Customizable</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pricing Slabs (Interactive Tiers Grid) */}
                    {selectedPackage.pricingSlabs && selectedPackage.pricingSlabs.length > 0 && (
                      <div className="pt-0.5">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <Layers size={16} className="text-[#C8941A] shrink-0" />
                            <span className="text-xs sm:text-[13px] font-sans font-extrabold text-[#0B1F17] uppercase tracking-[0.08em]">
                              PRICING TIERS
                            </span>
                          </div>
                          <span className="text-[11px] sm:text-xs font-medium text-[#354B43]">
                            Click tier to update guest count
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                          {(() => {
                            const sortedSlabs = [...selectedPackage.pricingSlabs].sort(
                              (a: any, b: any) => a.minGuests - b.minGuests
                            );
                            return sortedSlabs.map((slab: any, idx: number) => {
                              let isActive = false;
                              if (
                                guests >= slab.minGuests &&
                                (slab.maxGuests === null || guests <= slab.maxGuests)
                              ) {
                                isActive = true;
                              } else if (guests < sortedSlabs[0].minGuests && idx === 0) {
                                isActive = true;
                              } else if (
                                sortedSlabs[sortedSlabs.length - 1].maxGuests !== null &&
                                guests > sortedSlabs[sortedSlabs.length - 1].maxGuests &&
                                idx === sortedSlabs.length - 1
                              ) {
                                isActive = true;
                              } else if (slab.maxGuests === null && guests >= slab.minGuests) {
                                isActive = true;
                              }

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setGuests(slab.minGuests);
                                    setGuestInputVal(String(slab.minGuests));
                                  }}
                                  className={cn(
                                    "relative flex flex-col justify-center items-start px-3.5 py-3 rounded-xl border transition-all duration-200 text-left cursor-pointer",
                                    isActive
                                      ? "bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] border-[#D9A323] ring-1 ring-[#F8D76A]/55 shadow-[0_8px_18px_rgba(0,75,53,0.22)] text-white"
                                      : "bg-[#FFFDF8] hover:bg-[#FFF9E8] border-[#E8C77A]/85 hover:border-[#D9A323] shadow-[0_2px_8px_rgba(217,163,35,0.06)] text-[#0B1F17]"
                                  )}
                                >
                                  {isActive && (
                                    <span className="absolute -top-2 -right-2 w-5.5 h-5.5 rounded-full bg-gradient-to-br from-[#F8D76A] to-[#C8941A] border border-[#FFFDF8] flex items-center justify-center shadow-sm">
                                      <Check size={12} strokeWidth={3} className="text-[#002E22]" />
                                    </span>
                                  )}
                                  <span
                                    className={cn(
                                      "text-[10.5px] font-bold uppercase tracking-wider font-sans tabular-nums",
                                      isActive ? "text-[#F8D76A]" : "text-[#354B43]"
                                    )}
                                  >
                                    {slab.minGuests} {slab.maxGuests ? `- ${slab.maxGuests}` : "+"} GUESTS
                                  </span>
                                  <div className="mt-1 flex items-baseline gap-1 tabular-nums">
                                    <span
                                      className={cn(
                                        "text-lg sm:text-[19px] font-extrabold font-sans leading-none",
                                        isActive ? "text-white" : "text-[#0B1F17]"
                                      )}
                                    >
                                      ₹{slab.price}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-xs font-medium",
                                        isActive ? "text-[#DCEAE4]" : "text-[#5B6D65]"
                                      )}
                                    >
                                      / plate
                                    </span>
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: Guest Count Controls, Estimate Summary & Continue Button */}
                  <div className="lg:col-span-6 flex flex-col gap-4">
                    {/* Enter Guest Count Card */}
                    <div className="bg-[#FFFDF8] border border-[#E8C77A] rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_14px_rgba(0,46,34,0.04)]">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <label className="flex items-center gap-2 text-xs sm:text-[13px] font-sans font-extrabold text-[#0B1F17] uppercase tracking-[0.06em]">
                          <Users size={16} className="text-[#C8941A] shrink-0" />
                          <span>ENTER GUEST COUNT</span>
                        </label>
                        <span className="text-xs font-medium text-[#354B43] tabular-nums">
                          Min: {getPackageMinGuests(selectedPackage)} guests
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={decrementGuests}
                          className="w-11 h-11 flex items-center justify-center bg-gradient-to-b from-[#FFFDF8] to-[#F7E8C2] hover:from-white hover:to-[#FCEEBF] active:scale-95 text-[#0B1F17] rounded-xl border border-[#D9A323]/85 hover:border-[#B8860B] transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Decrease 10 guests"
                          aria-label="Decrease guests"
                        >
                          <Minus size={17} strokeWidth={2.5} />
                        </button>

                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={guestInputVal}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const cleanDigits = raw.replace(/\D/g, "");
                            if (cleanDigits === "") {
                              setGuestInputVal("");
                              return;
                            }
                            // Parse integer immediately to strip leading zeros like '0100' -> '100'
                            const parsed = parseInt(cleanDigits, 10);
                            setGuestInputVal(String(parsed));
                            if (!isNaN(parsed) && parsed > 0) {
                              setGuests(parsed);
                            }
                          }}
                          onBlur={() => {
                            if (!guestInputVal || isNaN(Number(guestInputVal))) {
                              setGuests(minGuests);
                              setGuestInputVal(String(minGuests));
                              toast(`Minimum requirement for this package is ${minGuests} guests`, "error");
                              return;
                            }
                            const parsed = parseInt(guestInputVal, 10);
                            if (parsed < minGuests) {
                              setGuests(minGuests);
                              setGuestInputVal(String(minGuests));
                              toast(`Minimum requirement for this package is ${minGuests} guests`, "error");
                            } else if (parsed > maxGuests) {
                              setGuests(maxGuests);
                              setGuestInputVal(String(maxGuests));
                              toast(`Maximum guest limit is ${maxGuests} guests`, "error");
                            } else {
                              setGuests(parsed);
                              setGuestInputVal(String(parsed));
                            }
                          }}
                          className="flex-1 w-full h-11 text-center font-sans font-extrabold text-xl text-[#0B1F17] bg-[#FBF7EE] focus:bg-white border border-[#E8C77A] hover:border-[#D9A323] focus:border-[#004B35] rounded-xl outline-none transition-all shadow-inner select-all tabular-nums"
                        />

                        <button
                          type="button"
                          onClick={incrementGuests}
                          className="w-11 h-11 flex items-center justify-center bg-gradient-to-b from-[#FFFDF8] to-[#F7E8C2] hover:from-white hover:to-[#FCEEBF] active:scale-95 text-[#0B1F17] rounded-xl border border-[#D9A323]/85 hover:border-[#B8860B] transition-all cursor-pointer shadow-2xs shrink-0"
                          title="Increase 10 guests"
                          aria-label="Increase guests"
                        >
                          <Plus size={17} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Estimate Summary Card */}
                    <div className="bg-[#FFFDF8] border border-[#E8C77A] rounded-2xl p-4 sm:p-5 shadow-[0_4px_16px_rgba(0,46,34,0.05)] relative overflow-hidden text-left w-full box-border">
                      <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-[#D9A323]/65">
                        <div className="w-6.5 h-6.5 rounded-md border border-[#D9A323]/75 bg-[#FBF2D8] text-[#B8860B] flex items-center justify-center shadow-2xs shrink-0">
                          <Calculator size={14} strokeWidth={2.2} />
                        </div>
                        <h4 className="font-sans font-extrabold text-sm sm:text-[15px] tracking-[0.06em] text-[#0B1F17] uppercase leading-none">
                          ESTIMATE SUMMARY
                        </h4>
                      </div>

                      <div className="space-y-2.5 text-xs sm:text-[13px]">
                        <div className="flex justify-between items-center text-left gap-3">
                          <span className="text-[#354B43] font-semibold uppercase tracking-[0.04em] font-sans">
                            CATERING PACKAGE
                          </span>
                          <span className="font-sans font-extrabold text-[#004B35] uppercase tracking-tight truncate max-w-[200px]">
                            {selectedPackage.packageName}
                          </span>
                        </div>

                        <div className="w-full h-px bg-[#E8C77A]/40" />

                        <div className="flex justify-between items-center text-left gap-3">
                          <span className="text-[#354B43] font-semibold uppercase tracking-[0.04em] font-sans">
                            PRICE PER PLATE
                          </span>
                          <span className="font-sans font-extrabold text-[#004B35] tabular-nums">
                            ₹{currentPerPlatePrice}
                          </span>
                        </div>

                        <div className="w-full h-px bg-[#E8C77A]/40" />

                        <div className="flex justify-between items-center text-left gap-3">
                          <span className="text-[#354B43] font-semibold uppercase tracking-[0.04em] font-sans">
                            EXPECTED GUEST COUNT
                          </span>
                          <span className="font-sans font-extrabold text-[#004B35] tabular-nums">
                            {guests} Guests
                          </span>
                        </div>

                        {/* Estimated Total Soft Gold Highlight Panel */}
                        <div className="pt-1.5">
                          <div className="bg-gradient-to-r from-[#FCE69B] via-[#F7D779] to-[#F1C95D] border border-[#D9A323]/90 rounded-xl px-4 py-3.5 flex justify-between items-center gap-3 shadow-[0_4px_14px_rgba(217,163,35,0.16)]">
                            <div className="flex flex-col text-left">
                              <span className="text-xs sm:text-[13px] font-sans font-extrabold text-[#0B1F17] uppercase tracking-[0.06em]">
                                ESTIMATED TOTAL
                              </span>
                              <span className="text-[11px] text-[#354B43] font-medium mt-0.5">
                                Inclusive of all taxes
                              </span>
                            </div>
                            <div className="pl-4 border-l border-[#D9A323]/45 shrink-0">
                              <span
                                className="font-serif font-extrabold text-2xl sm:text-[30px] text-[#0B1F17] leading-none tabular-nums"
                                style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                              >
                                ₹{(currentPerPlatePrice * guests).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer Policy */}
                    <div className="flex items-center gap-2 text-xs text-[#354B43] font-medium text-left px-1">
                      <Info size={15} className="text-[#C8941A] shrink-0" />
                      <span>Taxes and additional charges may apply as per venue policy.</span>
                    </div>

                    {/* Call To Action Button (Full-width Dark Emerald / Gold border) */}
                    <button
                      type="button"
                      onClick={() => {
                        const pkgMin = getPackageMinGuests(selectedPackage);
                        const numGuests = Number(guests);
                        if (!numGuests || isNaN(numGuests) || numGuests < pkgMin) {
                          setGuests(pkgMin);
                          setGuestInputVal(String(pkgMin));
                          toast(`Minimum requirement for this package is ${pkgMin} guests.`, "error");
                          return;
                        }
                        setViewMode("custom");
                      }}
                      className="w-full bg-gradient-to-r from-[#00513A] via-[#003B2A] to-[#00261B] hover:brightness-110 text-white font-sans font-extrabold text-sm uppercase tracking-[0.14em] py-3.5 px-6 min-h-[52px] rounded-xl shadow-[0_8px_20px_rgba(0,75,53,0.28)] hover:shadow-[0_10px_24px_rgba(0,75,53,0.34)] border-[1.5px] border-[#D9A323] hover:border-[#F8D76A] hover:scale-[1.005] active:scale-[0.99] transition-all outline-none flex items-center justify-center gap-2.5 cursor-pointer group"
                    >
                      <UtensilsCrossed size={17} className="text-[#F8D76A] shrink-0" />
                      <span>CONTINUE WITH MENU</span>
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1 text-[#F8D76A] stroke-[2.5] shrink-0"
                      />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "custom" && selectedPackage && (
        <>
          <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-20 lg:pb-14 relative z-10">
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-start">
              {/* LEFT COLUMN: Main Menu Selection Area */}
              <div id="active-category-content" className="flex-1 min-w-0 w-full">
                <div className="relative overflow-hidden bg-[#FFFDF8] rounded-2xl border border-[#E8C77A]/85 shadow-[0_8px_28px_rgba(23,61,48,0.06)] p-4 sm:p-6">
                  {/* Subtle Botanical Leaf Corner Artwork */}
                  <svg
                    viewBox="0 0 180 120"
                    fill="none"
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none select-none absolute -top-2 -left-2 w-40 h-28 opacity-15",
                      isActiveCatNonVeg ? "text-[#8B1E16]" : "text-[#004B35]",
                    )}
                  >
                    <path d="M12 10 C32 45 55 72 92 84 C65 55 40 28 12 10 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
                    <path d="M54 4 C66 32 82 52 110 62 C88 38 72 18 54 4 Z" stroke="currentColor" strokeWidth="1.1" fill="currentColor" fillOpacity="0.15" />
                    <path d="M2 50 C25 70 50 86 78 92 C52 72 28 58 2 50 Z" stroke="currentColor" strokeWidth="1.1" fill="currentColor" fillOpacity="0.15" />
                  </svg>
                  <svg
                    viewBox="0 0 180 120"
                    fill="none"
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none select-none absolute -top-2 -right-2 w-40 h-28 opacity-15 scale-x-[-1]",
                      isActiveCatNonVeg ? "text-[#8B1E16]" : "text-[#004B35]",
                    )}
                  >
                    <path d="M12 10 C32 45 55 72 92 84 C65 55 40 28 12 10 Z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.2" />
                    <path d="M54 4 C66 32 82 52 110 62 C88 38 72 18 54 4 Z" stroke="currentColor" strokeWidth="1.1" fill="currentColor" fillOpacity="0.15" />
                    <path d="M2 50 C25 70 50 86 78 92 C52 72 28 58 2 50 Z" stroke="currentColor" strokeWidth="1.1" fill="currentColor" fillOpacity="0.15" />
                  </svg>

                  {/* Category Header & Controls */}
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-[#E8C77A]/45">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-[3px] h-7 rounded-full bg-gradient-to-b from-[#F8D76A] to-[#D9A323] shrink-0" />
                        {isActiveCatNonVeg ? (
                          <NonVegDrumstickIcon className="w-6 h-6 text-[#8B1E16] shrink-0" />
                        ) : (
                          <VegLeafIcon className="w-6 h-6 text-[#15803D] shrink-0" />
                        )}
                        <h2
                          className={cn(
                            "font-serif font-bold text-xl sm:text-2xl lg:text-[26px] leading-tight tracking-tight",
                            isActiveCatNonVeg ? "text-[#4A0D09]" : "text-[#004B35]",
                          )}
                          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                        >
                          {activeCategory}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                        <span className="text-[11px] font-semibold text-[#4C665B] uppercase tracking-[0.22em] font-sans">
                          {getSelectionRuleLabel(
                            selectedPackage.categories?.find(
                              (c: any) => c.categoryName === activeCategory,
                            )?.selectionRule,
                          )}
                        </span>
                        {limitPerCategory > 0 && (
                          <>
                            <span className="text-[#D9A323]">•</span>
                            {(() => {
                              const catData = selectedPackage.categories?.find(
                                (c: any) => c.categoryName === activeCategory,
                              );
                              const itemsInCat = catData?.items || [];
                              const selectedCount = itemsInCat.filter(
                                (i: string) => selectedItems[i],
                              ).length;
                              const isFull = selectedCount >= limitPerCategory;
                              return isFull ? (
                                <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#14532D] font-bold px-3 py-0.5 rounded-full text-xs border border-[#86EFAC]">
                                  <Check size={12} strokeWidth={3} className="text-[#15803D]" />
                                  Completed ({selectedCount}/{limitPerCategory})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-[#FFF9EC] text-[#8B6A14] font-bold px-3 py-0.5 rounded-full text-xs border border-[#E8C77A]">
                                  Requires {limitPerCategory} ({selectedCount} selected)
                                </span>
                              );
                            })()}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Search Bar for filtering items within category */}
                    <div className="relative w-full sm:w-[250px] shrink-0">
                      <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#173D30]"
                      />
                      <input
                        type="text"
                        placeholder="Search dishes..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-[#FFFDF8] border border-[#E8C77A] rounded-full text-xs sm:text-sm font-medium text-[#173D30] placeholder:text-[#6B7E75] outline-none focus:border-[#D9A323] focus:ring-2 focus:ring-[#D9A323]/20 transition-all shadow-2xs"
                      />
                      {categorySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setCategorySearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7E75] hover:text-[#002E22] cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Completion Alert message */}
                  {highlightIncomplete && !isCategoryComplete(activeCategory) && (
                    <div className="relative z-10 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 text-xs font-semibold">
                      <span>⚠️</span>
                      <span>
                        Please select {getCategoryRemainingCount(activeCategory)} more item{getCategoryRemainingCount(activeCategory) > 1 ? "s" : ""} from {activeCategory}.
                      </span>
                    </div>
                  )}

                  {/* Menu Items Grid: Emerald (Veg) & Burgundy (Non-Veg) Selected Cards + Ivory Unselected Cards */}
                  <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-3.5">
                    {(() => {
                      const allCatItems =
                        selectedPackage.categories?.find(
                          (c: any) => c.categoryName === activeCategory,
                        )?.items || [];

                      const filteredItems = allCatItems.filter((item: string) =>
                        categorySearchQuery.trim() === ""
                          ? true
                          : item
                              .toLowerCase()
                              .includes(categorySearchQuery.toLowerCase().trim()),
                      );

                      if (filteredItems.length === 0) {
                        return (
                          <div className="col-span-full py-8 text-center text-[#6B7E75]">
                            <p className="text-xs sm:text-sm font-medium">
                              No dishes found matching "{categorySearchQuery}"
                            </p>
                            <button
                              type="button"
                              onClick={() => setCategorySearchQuery("")}
                              className="mt-1.5 text-xs font-bold text-[#B8860B] hover:underline cursor-pointer"
                            >
                              Clear search
                            </button>
                          </div>
                        );
                      }

                      return filteredItems.map((itemName: string, idx: number) => {
                        const isSelected = !!selectedItems[itemName];
                        const itemsInCat = allCatItems;
                        const selectedCount = itemsInCat.filter(
                          (i: string) => selectedItems[i],
                        ).length;
                        const isAtLimit =
                          limitPerCategory > 0 &&
                          selectedCount >= limitPerCategory;
                        const isDisabled = !isSelected && isAtLimit;
                        const isPremium = isItemPremium(itemName);
                        const isNonVeg = isItemNonVeg(
                          itemName,
                          activeCategory,
                        );

                        return (
                          <div
                            key={idx}
                            data-name={itemName}
                            onClick={() => {
                              if (!isDisabled) {
                                toggleItem(itemName, activeCategory);
                              }
                            }}
                            className={cn(
                              "relative rounded-xl p-3 sm:p-3.5 border transition-all duration-200 flex flex-col justify-between min-h-[108px] sm:min-h-[116px] select-none",
                              isSelected
                                ? isNonVeg
                                  ? "bg-gradient-to-br from-[#8B1E16] via-[#7A1912] to-[#5E110B] border-[#D9A323] ring-1 ring-[#F8D76A]/45 shadow-[0_8px_22px_rgba(139,30,22,0.28)] cursor-pointer"
                                  : "bg-gradient-to-br from-[#004B35] via-[#003F2E] to-[#00281D] border-[#D9A323] ring-1 ring-[#F8D76A]/45 shadow-[0_8px_22px_rgba(0,75,53,0.26)] cursor-pointer"
                                : isDisabled
                                  ? "bg-[#FFFDF8] border-[#E8C77A]/75 shadow-[0_2px_8px_rgba(217,163,35,0.06)] cursor-not-allowed"
                                  : "bg-[#FFFDF8] border-[#E8C77A] hover:border-[#D9A323] shadow-[0_2px_10px_rgba(217,163,35,0.08)] hover:shadow-[0_6px_16px_rgba(217,163,35,0.16)] cursor-pointer",
                            )}
                          >
                            {/* Top Row: Dietary Indicator (Veg / Non-Veg) & Status Badge */}
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <div>
                                {isNonVeg ? (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 text-[11px] font-bold font-sans",
                                      isSelected ? "text-[#FFE4E1]" : "text-[#8B1E16]",
                                    )}
                                  >
                                    <NonVegDrumstickIcon
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        isSelected ? "text-[#FCA5A5]" : "text-[#8B1E16]",
                                      )}
                                    />
                                    Non-Veg
                                  </span>
                                ) : (
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1.5 text-[11px] font-bold font-sans",
                                      isSelected ? "text-[#E6F4EE]" : "text-[#004B35]",
                                    )}
                                  >
                                    <VegLeafIcon
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        isSelected ? "text-[#4ADE80]" : "text-[#15803D]",
                                      )}
                                    />
                                    Veg
                                  </span>
                                )}
                              </div>

                              <div>
                                {isPremium ? (
                                  <span
                                    className={cn(
                                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                      isSelected
                                        ? "bg-gradient-to-r from-[#F8D76A] to-[#DFA91E] border-[#F8D76A] text-[#002E22]"
                                        : "bg-[#FAF1D6] border-[#D9A323]/60 text-[#8B6A14]",
                                    )}
                                  >
                                    Premium
                                  </span>
                                ) : (
                                  <span
                                    className={cn(
                                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                                      isSelected
                                        ? "bg-gradient-to-r from-[#F8D76A] to-[#DFA91E] border-[#F8D76A] text-[#002E22]"
                                        : "bg-[#FAF1D6]/90 border-[#E8C77A]/80 text-[#8B6A14]",
                                    )}
                                  >
                                    Included
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Middle: Dish Name (Clean modern sans typography) */}
                            <div className="my-1">
                              <h3
                                title={itemName}
                                className={cn(
                                  "font-sans font-bold text-[15px] leading-snug line-clamp-1",
                                  isSelected
                                    ? "text-white"
                                    : isNonVeg
                                      ? "text-[#3A0C09]"
                                      : "text-[#003F2E]",
                                )}
                              >
                                {itemName}
                              </h3>
                            </div>

                            {/* Bottom Row: Control button */}
                            <div
                              className={cn(
                                "mt-1.5 pt-2 border-t flex items-center justify-between gap-2",
                                isSelected ? "border-[#D9A323]/30" : "border-[#E8C77A]/35",
                              )}
                            >
                              <span className="text-[11px] font-medium font-sans">
                                {isSelected ? (
                                  <span className={isNonVeg ? "text-[#FDE4E1] font-semibold" : "text-[#D5E6DF] font-semibold"}>
                                    In your menu
                                  </span>
                                ) : isDisabled ? (
                                  <span className="text-[#6B7E75]">
                                    Limit reached
                                  </span>
                                ) : (
                                  <span className="text-[#5C7268]">Tap to add</span>
                                )}
                              </span>

                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(itemName, activeCategory);
                                  }}
                                  className={cn(
                                    "px-3 py-1 bg-gradient-to-r from-[#F8D76A] via-[#F4C430] to-[#DFA91E] hover:brightness-105 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0 font-sans whitespace-nowrap",
                                    isNonVeg ? "text-[#4A0D09]" : "text-[#002E22]",
                                  )}
                                >
                                  <Check size={11} strokeWidth={3} />
                                  <span>Selected</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) {
                                      toggleItem(itemName, activeCategory);
                                    }
                                  }}
                                  className={cn(
                                    "px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 select-none shrink-0 border font-sans whitespace-nowrap",
                                    isNonVeg
                                      ? isDisabled
                                        ? "bg-[#FFFDF8] text-[#8B1E16]/55 border-[#8B1E16]/35 cursor-not-allowed"
                                        : "bg-[#FFFDF8] hover:bg-[#FDF2F1] text-[#8B1E16] border-[#8B1E16] hover:shadow-2xs cursor-pointer"
                                      : isDisabled
                                        ? "bg-[#FFFDF8] text-[#004B35]/55 border-[#15803D]/35 cursor-not-allowed"
                                        : "bg-[#FFFDF8] hover:bg-[#EAF7EC] text-[#004B35] border-[#15803D] hover:shadow-2xs cursor-pointer",
                                  )}
                                >
                                  <Plus size={11} strokeWidth={2.5} />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Order Summary Panel (Desktop Sticky) */}
              <div className="hidden lg:block lg:w-[310px] xl:w-[335px] shrink-0">
                <div className="bg-[#FFFDF8] rounded-2xl border border-[#D9A323]/75 shadow-[0_12px_32px_rgba(0,46,34,0.10)] sticky top-[134px] max-h-[calc(100vh-150px)] flex flex-col overflow-hidden">
                  {/* Panel Emerald Header */}
                  <div className="relative p-4 pb-3.5 bg-gradient-to-br from-[#004B35] via-[#003B2A] to-[#00261B] text-white border-b border-[#D9A323]/55 overflow-hidden shrink-0">
                    {/* Subtle Decorative Ornamental Cloche & Mandala Accent */}
                    <svg
                      viewBox="0 0 120 120"
                      fill="none"
                      aria-hidden="true"
                      className="pointer-events-none select-none absolute -right-5 top-3 w-32 h-32 text-[#F8D76A] opacity-20"
                    >
                      <circle cx="60" cy="60" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx="60" cy="60" r="34" stroke="currentColor" strokeWidth="1" />
                      <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="1" />
                      <path d="M60 8 L64 28 L84 18 L72 38 L94 42 L74 54 L94 68 L72 72 L82 94 L62 82 L58 106 L52 82 L32 94 L42 72 L20 68 L40 54 L20 42 L42 38 L30 18 L50 28 Z" stroke="currentColor" strokeWidth="0.9" />
                    </svg>

                    <div className="relative z-10 flex items-center justify-between gap-2 pb-2.5 border-b border-[#D9A323]/30">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="14" viewBox="0 0 24 20" fill="none" className="text-[#F8D76A] shrink-0" aria-hidden="true">
                          <circle cx="12" cy="3.5" r="1.5" fill="currentColor" />
                          <path d="M4 14C4 9.58172 7.58172 6 12 6C16.4183 6 20 9.58172 20 14H4Z" fill="currentColor" fillOpacity="0.9" />
                          <path d="M2 16.5H22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#F8D76A] font-sans">
                          ORDER SUMMARY
                        </span>
                      </div>

                      {selectedItemsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to clear your selected menu items?",
                              )
                            ) {
                              setSelectedItems({});
                            }
                          }}
                          className="text-[11px] font-medium text-[#FBF7EF]/85 hover:text-[#F8D76A] transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-white/10"
                          title="Clear all selected items"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="relative z-10 mt-2.5">
                      <h3
                        className="font-serif font-bold text-xl text-white leading-tight"
                        style={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                        }}
                      >
                        {selectedPackage.packageName || "Curated Menu"}
                      </h3>
                      <p className="text-xs text-[#D5E6DF] font-medium mt-0.5 truncate">
                        {caterer.name}
                      </p>
                    </div>

                    {/* Guest & Base Price Row */}
                    <div className="relative z-10 mt-3 pt-2.5 border-t border-[#D9A323]/30 flex items-center justify-between text-xs font-semibold tabular-nums">
                      <div className="flex items-center gap-1.5 text-[#FBF7EF]">
                        <Users size={13} className="text-[#F8D76A]" />
                        <span>{guests} Guests</span>
                      </div>
                      <div className="text-[#FFFDF8] font-bold">
                        <span>₹{currentPerPlatePrice} / plate</span>
                      </div>
                    </div>

                    {/* Category Completion Progress Bar */}
                    <div className="relative z-10 mt-2.5 pt-2.5 border-t border-[#D9A323]/30">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[#FBF7EF]">Menu Completion</span>
                        <span className="text-[#F8D76A] font-bold tabular-nums">
                          {doneCategoriesCount} of {totalCategoriesCount} Categories
                        </span>
                      </div>
                      <div className="w-full bg-[#001D15] border border-[#D9A323]/35 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#F8D76A] via-[#ECC044] to-[#D9A323] h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(248,215,106,0.4)]"
                          style={{
                            width: `${Math.round(
                              (doneCategoriesCount /
                                (totalCategoriesCount || 1)) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Scrollable List of Selected Items grouped by category */}
                  <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#FFFDF8] no-scrollbar">
                    {selectedItemsCount === 0 ? (
                      <div className="py-6 text-center text-[#6B7E75]">
                        <p className="font-serif text-sm text-[#002E22] font-bold mb-0.5">
                          Your Menu is Empty
                        </p>
                        <p className="text-[11px] text-[#5C7268] max-w-[200px] mx-auto leading-relaxed">
                          Select dishes from the categories to build your custom catering package.
                        </p>
                      </div>
                    ) : (
                      menuCategories.map((cat: string) => {
                        const itemsInCat = (
                          selectedPackage.categories?.find(
                            (c: any) => c.categoryName === cat,
                          )?.items || []
                        ).filter((i: string) => selectedItems[i]);

                        if (itemsInCat.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10.5px] font-bold pb-0.5">
                              <span className="uppercase tracking-wider text-[10px] text-[#003F2E] font-sans">
                                {cat}
                              </span>
                              <span className="text-[10px] font-semibold text-[#B8860B]">
                                {itemsInCat.length} selected
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {itemsInCat.map((item: string) => {
                                const itemNonVeg = isItemNonVeg(item, cat);
                                return (
                                  <li
                                    key={item}
                                    className={cn(
                                      "flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors text-xs font-semibold border group",
                                      itemNonVeg
                                        ? "bg-[#FDF3F2] hover:bg-[#FAE7E5] text-[#4A0D09] border-[#8B1E16]/20"
                                        : "bg-[#EEF7F0] hover:bg-[#E2F1E6] text-[#002E22] border-[#004B35]/15",
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-1.5">
                                      <span
                                        className={cn(
                                          "w-4 h-4 rounded-sm text-white flex items-center justify-center shrink-0",
                                          itemNonVeg ? "bg-[#8B1E16]" : "bg-[#004B35]",
                                        )}
                                      >
                                        <Check size={10} strokeWidth={3} />
                                      </span>
                                      <span className="truncate font-sans">{item}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleItem(item, cat)}
                                      className="text-[#4A6459] hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                                      title={`Remove ${item}`}
                                    >
                                      <X size={13} />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Panel Footer: Pricing Breakdown & CTA */}
                  <div className="p-3.5 pt-3 border-t border-[#E8C77A]/55 bg-[#FFFDF8] shrink-0 space-y-2.5">
                    {/* Price breakdown */}
                    <div className="space-y-1 text-xs tabular-nums">
                      <div className="flex justify-between text-[#335247]">
                        <span>Package Subtotal ({guests} guests)</span>
                        <span className="font-bold text-[#002E22]">
                          ₹{(currentPerPlatePrice * guests).toLocaleString("en-IN")}
                        </span>
                      </div>
                      {platformFee > 0 && (
                        <div className="flex justify-between text-[#335247]">
                          <span>Platform Service Fee</span>
                          <span className="font-bold text-[#002E22]">
                            ₹{platformFee.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Highlighted Soft Gold Estimated Total Box */}
                    <div className="rounded-xl bg-gradient-to-r from-[#FBF0CC] via-[#F7E6B0] to-[#F2D98D] border border-[#D9A323]/65 px-3.5 py-2.5 shadow-2xs">
                      <div className="flex justify-between items-baseline">
                        <span
                          className="font-serif font-bold text-[#002E22] text-[15px]"
                          style={{
                            fontFamily: '"Playfair Display", Georgia, serif',
                          }}
                        >
                          Estimated Total
                        </span>
                        <span
                          className="font-serif font-extrabold text-xl text-[#002E22] tabular-nums"
                          style={{
                            fontFamily: '"Playfair Display", Georgia, serif',
                          }}
                        >
                          ₹
                          {(
                            currentPerPlatePrice * guests +
                            platformFee
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium text-[#4D3E12] text-right mt-0.5">
                        Inclusive of taxes & package curation
                      </p>
                    </div>

                    {/* CTA Button: Deep Emerald & Gold Premium Treatment */}
                    <button
                      type="button"
                      onClick={() => {
                        const incomplete = menuCategories.filter(
                          (cat) => !isCategoryComplete(cat),
                        );
                        if (incomplete.length === 0) {
                          setViewMode("checkout");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          const firstIncomplete = incomplete[0];
                          navigateToCategory(firstIncomplete);
                          setHighlightIncomplete(true);
                          setValidationTriggered(true);
                          toast(
                            `Please complete selections for ${firstIncomplete}`,
                            "error",
                          );
                        }
                      }}
                      className="w-full py-3 px-4 bg-gradient-to-r from-[#004B35] via-[#003B2A] to-[#00261B] hover:brightness-110 text-[#FFFDF8] rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(0,75,53,0.28)] active:scale-[0.99] border border-[#D9A323]"
                    >
                      <Calendar size={15} strokeWidth={2.2} className="text-[#F8D76A]" />
                      <span>Proceed to Booking</span>
                      <ArrowRight size={15} strokeWidth={2.5} className="text-[#F8D76A]" />
                    </button>

                    {/* Incomplete warning banner */}
                    {!allCategoriesComplete && (
                      <div className="text-[10px] text-[#8B6A14] bg-[#FFF9EC] border border-[#E8C77A] rounded-lg px-2.5 py-1.5 text-center font-medium">
                        Select required items in all categories to proceed.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* MOBILE STICKY BOTTOM ORDER BAR & EXPANDABLE DRAWER */}
          <div className="block lg:hidden">
            {/* Backdrop overlay */}
            {mobileCartExpanded && (
              <div
                className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                onClick={() => setMobileCartExpanded(false)}
              />
            )}

            {/* Bottom Sheet Card */}
            <div
              className={cn(
                "fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out flex flex-col overflow-hidden",
                mobileCartExpanded
                  ? "h-[85vh] rounded-t-[2rem] bg-[#FFFDF8] border-t border-[#D9A323]/70 shadow-2xl"
                  : "h-[58px] bg-gradient-to-r from-[#004B35] to-[#00261B] text-white border-t border-[#D9A323]/60 shadow-lg",
              )}
            >
              {!mobileCartExpanded ? (
                /* Collapsed Mobile Bar */
                <div
                  className="w-full h-full flex items-center justify-between px-4 cursor-pointer select-none"
                  onClick={() => setMobileCartExpanded(true)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F8D76A]"></span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      ₹{(currentPerPlatePrice * guests).toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#F8D76A] font-medium">
                      ({selectedItemsCount} {selectedItemsCount === 1 ? "item" : "items"})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#F8D76A] uppercase tracking-wider">
                    <span>View Order</span>
                    <ChevronUp size={14} />
                  </div>
                </div>
              ) : (
                /* Expanded Mobile Drawer */
                <div className="flex-1 flex flex-col h-full overflow-hidden">
                  {/* Drawer Handle */}
                  <div
                    className="w-full py-2.5 flex items-center justify-center cursor-pointer select-none border-b border-[#D9A323]/30 bg-[#004B35]"
                    onClick={() => setMobileCartExpanded(false)}
                  >
                    <div className="w-12 h-1 bg-[#F8D76A]/60 rounded-full" />
                  </div>

                  {/* Drawer Header */}
                  <div className="px-5 py-3.5 border-b border-[#D9A323]/40 flex items-center justify-between bg-gradient-to-r from-[#004B35] to-[#00261B] text-white">
                    <div>
                      <h3
                        className="font-serif font-bold text-xl text-white"
                        style={{
                          fontFamily: '"Playfair Display", Georgia, serif',
                        }}
                      >
                        {selectedPackage.packageName || "Order Summary"}
                      </h3>
                      <p className="text-xs text-[#D5E6DF] font-medium">
                        {guests} Guests • ₹{currentPerPlatePrice} / plate
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedItemsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                "Are you sure you want to clear your selected menu items?",
                              )
                            ) {
                              setSelectedItems({});
                            }
                          }}
                          className="text-xs font-bold text-[#FBF7EF]/85 hover:text-[#F8D76A] px-2 py-1 cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setMobileCartExpanded(false)}
                        className="w-8 h-8 rounded-full bg-[#00261B] border border-[#D9A323]/60 flex items-center justify-center text-[#F8D76A] cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Drawer Items List */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FFFDF8] no-scrollbar">
                    {selectedItemsCount === 0 ? (
                      <div className="py-12 text-center text-[#6B7E75]">
                        <p className="font-serif text-base text-[#002E22] font-bold mb-1">
                          Your Menu is Empty
                        </p>
                        <p className="text-xs text-[#5C7268] max-w-[220px] mx-auto leading-relaxed">
                          Select dishes from the categories to build your custom
                          catering package.
                        </p>
                      </div>
                    ) : (
                      menuCategories.map((cat: string) => {
                        const itemsInCat = (
                          selectedPackage.categories?.find(
                            (c: any) => c.categoryName === cat,
                          )?.items || []
                        ).filter((i: string) => selectedItems[i]);

                        if (itemsInCat.length === 0) return null;

                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold pb-1 border-b border-[#E8C77A]/35">
                              <span className="uppercase tracking-wider text-[11px] text-[#003F2E] font-sans">
                                {cat}
                              </span>
                              <span className="text-[10px] text-[#B8860B]">
                                {itemsInCat.length} selected
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {itemsInCat.map((item: string) => {
                                const itemNonVeg = isItemNonVeg(item, cat);
                                return (
                                  <li
                                    key={item}
                                    className={cn(
                                      "flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-semibold border",
                                      itemNonVeg
                                        ? "bg-[#FDF3F2] text-[#4A0D09] border-[#8B1E16]/20"
                                        : "bg-[#EEF7F0] text-[#002E22] border-[#004B35]/15",
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <span
                                        className={cn(
                                          "w-4 h-4 rounded-sm text-white flex items-center justify-center shrink-0",
                                          itemNonVeg ? "bg-[#8B1E16]" : "bg-[#004B35]",
                                        )}
                                      >
                                        <Check size={10} strokeWidth={3} />
                                      </span>
                                      <span className="truncate font-sans">{item}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleItem(item, cat)}
                                      className="text-[#4A6459] hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer shrink-0"
                                    >
                                      <X size={13} />
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Drawer Footer */}
                  <div className="p-4 border-t border-[#E8C77A]/55 bg-[#FFFDF8] space-y-3">
                    <div className="rounded-xl bg-gradient-to-r from-[#FBF0CC] via-[#F7E6B0] to-[#F2D98D] border border-[#D9A323]/65 px-3.5 py-2.5 flex items-baseline justify-between">
                      <span className="font-serif font-bold text-sm text-[#002E22]">
                        Estimated Total
                      </span>
                      <span className="font-serif font-extrabold text-xl text-[#002E22] tabular-nums">
                        ₹
                        {(
                          currentPerPlatePrice * guests +
                          platformFee
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const incomplete = menuCategories.filter(
                          (cat) => !isCategoryComplete(cat),
                        );
                        if (incomplete.length === 0) {
                          setMobileCartExpanded(false);
                          setViewMode("checkout");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else {
                          const firstIncomplete = incomplete[0];
                          navigateToCategory(firstIncomplete);
                          setHighlightIncomplete(true);
                          setValidationTriggered(true);
                          setMobileCartExpanded(false);
                          toast(
                            `Please complete selections for ${firstIncomplete}`,
                            "error",
                          );
                        }
                      }}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-[#004B35] via-[#003B2A] to-[#00261B] text-[#FFFDF8] rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(0,75,53,0.28)] border border-[#D9A323]"
                    >
                      <Calendar size={15} strokeWidth={2.2} className="text-[#F8D76A]" />
                      <span>Proceed to Booking</span>
                      <ArrowRight size={15} strokeWidth={2.5} className="text-[#F8D76A]" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {viewMode === "checkout" && (
        <div className="flex-1 max-w-[1380px] mx-auto w-full px-3 xs:px-4 sm:px-6 lg:px-8 pt-2 pb-28 md:pb-12 flex flex-col lg:flex-row gap-6 lg:gap-7 items-start relative z-10">
          {/* Left Column: Structured Luxury Booking Form with Emerald Section Banners */}
          <div className="flex-1 w-full bg-[#FFFDF8] rounded-2xl border border-[#D9A323]/75 shadow-[0_12px_34px_rgba(0,46,34,0.08)] divide-y divide-[#E8C77A]/40 text-left animate-fade-in">

            {/* Form Section 1: Event Details */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <Calendar size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Event Details
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Specify your occasion and date preferences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Occasion Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                      Select Occasion <span className="text-[#C82333]">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsOccasionDropdownOpen(!isOccasionDropdownOpen)}
                        className="w-full flex items-center justify-between border border-[#E8C77A] hover:border-[#D9A323] bg-white rounded-xl px-3.5 shadow-[0_2px_6px_rgba(217,163,35,0.08)] transition-all text-left cursor-pointer h-11"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <svg className="w-4.5 h-4.5 text-[#D9A323] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="9" cy="12" r="4" />
                            <circle cx="15" cy="12" r="4" />
                          </svg>
                          <span className="text-sm font-bold text-[#173D30] truncate">
                            {orderForm.type || "Select Occasion"}
                          </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-[#003F2E] transition-transform duration-200 shrink-0", isOccasionDropdownOpen && "rotate-180")} />
                      </button>
                      {isOccasionDropdownOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-[#FFFDF8] border border-[#E8C77A] rounded-xl shadow-xl z-50 overflow-hidden">
                          <div className="p-2.5 border-b border-[#E8C77A]/40 flex items-center gap-2 bg-[#FBF7EF]">
                            <Search size={15} className="text-[#8E6211] shrink-0" />
                            <input
                              type="text"
                              value={occasionSearchQuery}
                              onChange={(e) => setOccasionSearchQuery(e.target.value)}
                              placeholder="Search occasion..."
                              className="w-full bg-transparent border-none text-sm outline-none text-[#173D30]"
                              autoFocus
                            />
                            {occasionSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setOccasionSearchQuery("")}
                                className="text-stone-400 hover:text-[#003F2E] cursor-pointer"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                          <div className="max-h-60 overflow-y-auto py-1">
                            {OCCASIONS.filter(o => o.toLowerCase().includes(occasionSearchQuery.toLowerCase())).length > 0 ? (
                              OCCASIONS.filter(o => o.toLowerCase().includes(occasionSearchQuery.toLowerCase())).map((o) => (
                                <button
                                  key={o}
                                  type="button"
                                  onClick={() => {
                                    setOrderForm(prev => ({ ...prev, type: o }));
                                    setIsOccasionDropdownOpen(false);
                                    setOccasionSearchQuery("");
                                  }}
                                  className={cn(
                                    "w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-[#FBF5E4] transition-all flex items-center justify-between cursor-pointer",
                                    orderForm.type === o ? "text-[#004B35] font-bold bg-[#EAF7EC]/60" : "text-[#173D30]"
                                  )}
                                >
                                  <span>{o}</span>
                                  {orderForm.type === o && <Check size={14} className="text-[#004B35]" />}
                                </button>
                              ))
                            ) : (
                              <div className="text-center py-4 text-xs text-stone-400 italic">
                                No occasions found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Event Date Selector */}
                  <div>
                    <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                      Event Date <span className="text-[#C82333]">*</span>
                    </label>
                    <div className="relative z-25">
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Toggle custom calendar popup:", !isCalendarOpen);
                          setIsCalendarOpen(!isCalendarOpen);
                        }}
                        className="w-full flex items-center justify-between gap-2.5 border border-[#E8C77A] hover:border-[#D9A323] bg-white rounded-xl px-3.5 shadow-[0_2px_6px_rgba(217,163,35,0.08)] transition-all cursor-pointer relative z-10 text-left h-11"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <Calendar size={16} className="text-[#D9A323] shrink-0" />
                          <span className="text-sm font-bold text-[#173D30] truncate block">
                            {selectedDates.length > 0 ? selectedDates[0] : "Select Date"}
                          </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-[#003F2E] transform transition-transform shrink-0", isCalendarOpen && "rotate-180")} />
                      </button>

                      {/* Background Click dismiss overlay */}
                      {isCalendarOpen && (
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setIsCalendarOpen(false)}
                        />
                      )}

                      {/* Premium Custom Calendar Popover */}
                      {isCalendarOpen && (
                        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 bg-[#FFFDF8] border border-[#D9A323]/75 rounded-2xl shadow-2xl z-40 p-4 w-72 sm:w-80 select-none animate-fade-in">
                          {/* Header: Month Navigation */}
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              disabled={currentMonth.getFullYear() <= new Date().getFullYear() && currentMonth.getMonth() <= new Date().getMonth()}
                              onClick={() => {
                                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
                              }}
                              className="p-1.5 rounded-lg hover:bg-[#FBF5E4] text-[#173D30] hover:text-[#004B35] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                            >
                              <ChevronLeft size={18} />
                            </button>

                            <span className="text-sm font-bold text-[#003F2E] font-serif">
                              {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
                              }}
                              className="p-1.5 rounded-lg hover:bg-[#FBF5E4] text-[#173D30] hover:text-[#004B35] cursor-pointer transition-colors"
                            >
                              <ChevronRight size={18} />
                            </button>
                          </div>

                          {/* Weekday Labels Row */}
                          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                              <span key={dayName} className="text-[11px] font-bold text-[#8E6211] uppercase tracking-wider">
                                {dayName}
                              </span>
                            ))}
                          </div>

                          {/* Days Grid */}
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {getDaysInMonth(currentMonth).map((date, idx) => {
                              if (!date) {
                                return <div key={`empty-${idx}`} />;
                              }

                              const isSelected = isDateSelected(date);
                              const isPast = isDatePast(date);

                              return (
                                <button
                                  key={date.toISOString()}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => {
                                    toggleCalendarDate(date);
                                  }}
                                  className={cn(
                                    "h-8 sm:h-9 text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer tabular-nums",
                                    isPast
                                      ? "text-stone-300 cursor-not-allowed opacity-40"
                                      : isSelected
                                        ? "bg-[#004B35] text-white font-bold shadow-md ring-1 ring-[#D9A323]"
                                        : "text-[#173D30] hover:bg-[#FBF5E4] hover:text-[#004B35]"
                                  )}
                                >
                                  {date.getDate()}
                                </button>
                              );
                            })}
                          </div>

                          {/* Footer info/controls */}
                          <div className="mt-4 pt-3 border-t border-[#E8C77A]/40 flex items-center justify-between text-[11px]">
                            <span className="text-[#5B6D65] font-semibold">
                              {selectedDates.length} date{selectedDates.length !== 1 ? "s" : ""} selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsCalendarOpen(false)}
                              className="bg-[#004B35] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-[#003A29] transition-colors cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Dates Chips row */}
                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-0.5 animate-fade-in">
                    {selectedDates.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF7EC] text-[#004B35] text-xs font-bold border border-[#A3DFB5] shadow-2xs">
                        <Calendar size={12} className="text-[#004B35]" />
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => removeDate(d)}
                          className="text-[#004B35]/60 hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                          aria-label={`Remove date ${d}`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Section 2: Meal Selection & Timings */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <Utensils size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Meal Selection & Timing
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Choose which meals will be served.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3.5">
                {/* Meal interactive chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {["Breakfast", "Lunch", "Evening Snacks", "Dinner"].map((meal) => {
                    const isSelected = selectedMeals.includes(meal);
                    return (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            const updated = selectedMeals.filter((m) => m !== meal);
                            setSelectedMeals(updated);
                            const updatedTimings = { ...mealTimings };
                            delete updatedTimings[meal];
                            setMealTimings(updatedTimings);
                          } else {
                            setSelectedMeals([...selectedMeals, meal]);
                            const defaultTime = meal === "Breakfast" ? "8 AM onwards" : meal === "Lunch" ? "12 PM onwards" : meal === "Evening Snacks" ? "5 PM onwards" : "8 PM onwards";
                            setMealTimings(prev => ({ ...prev, [meal]: defaultTime }));
                          }
                        }}
                        className={cn(
                          "flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all font-bold text-xs sm:text-[13px] cursor-pointer min-h-[42px] whitespace-nowrap",
                          isSelected
                            ? "bg-gradient-to-r from-[#00513A] to-[#002E22] border-[#D9A323] ring-1 ring-[#F8D76A]/60 text-white shadow-[0_4px_12px_rgba(0,75,53,0.22)]"
                            : "bg-white border-[#E8C77A] hover:border-[#D9A323] text-[#173D30] hover:bg-[#FFF9E8] shadow-[0_2px_6px_rgba(217,163,35,0.08)]"
                        )}
                      >
                        {meal === "Breakfast" && <Coffee size={15} className={cn("shrink-0", isSelected ? "text-[#F8D76A]" : "text-[#D9A323]")} />}
                        {meal === "Lunch" && <Utensils size={15} className={cn("shrink-0", isSelected ? "text-[#F8D76A]" : "text-[#D9A323]")} />}
                        {meal === "Evening Snacks" && <Pizza size={15} className={cn("shrink-0", isSelected ? "text-[#F8D76A]" : "text-[#D9A323]")} />}
                        {meal === "Dinner" && <Soup size={15} className={cn("shrink-0", isSelected ? "text-[#F8D76A]" : "text-[#D9A323]")} />}
                        <span>{meal}</span>
                        {isSelected && <Check size={13} className="text-[#F8D76A] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Meal Timings options inside warm container */}
                {selectedMeals.length > 0 && (
                  <div className="space-y-3 pt-0.5 animate-fade-in">
                    {selectedMeals.map((meal) => (
                      <div key={meal} className="space-y-2">
                        <label className="text-xs font-bold text-[#173D30] flex items-center gap-1.5 font-sans">
                          <Clock size={14} className="text-[#D9A323] shrink-0" />
                          <span>{meal} Ready-by Time</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {MEAL_TIME_OPTIONS[meal]?.map((time) => {
                            const isTimeSelected = mealTimings[meal] === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setMealTimings(prev => ({ ...prev, [meal]: time }))}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer min-h-[34px] inline-flex items-center gap-1.5 tabular-nums",
                                  isTimeSelected
                                    ? "bg-gradient-to-r from-[#00513A] to-[#002E22] border-[#D9A323] ring-1 ring-[#F8D76A]/50 text-white shadow-sm"
                                    : "bg-white border-[#E8C77A]/80 hover:border-[#D9A323] text-[#173D30] hover:bg-[#FFF9E8]"
                                )}
                              >
                                <span>{time}</span>
                                {isTimeSelected && <Check size={12} className="text-[#F8D76A] shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Section 3: Guest Count */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <Users size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Guest Count
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Confirmed headcount for catering & pricing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-3.5 items-stretch">
                {/* Read-Only Confirmed Guests Card with Change action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#FDF6E2] to-[#F9EBC3] border border-[#D9A323]/75 rounded-xl px-4 py-3 select-none shadow-2xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#FFFDF8]/90 border border-[#E8C77A] text-[#C8941A] flex items-center justify-center shrink-0">
                      <Users size={19} />
                    </div>
                    <div className="text-left min-w-0">
                      <div className="text-sm font-extrabold text-[#173D30] leading-tight tabular-nums">
                        {guests} Guests Confirmed
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#004B35] mt-0.5 leading-tight">
                        <Check size={12} className="text-[#108A48] shrink-0" />
                        <span>Locked for catering estimate & preparation</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("package_detail");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFDF8] hover:bg-white border border-[#D9A323]/80 hover:border-[#B8860B] text-[#173D30] hover:text-[#003F2E] text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs self-start sm:self-center shrink-0 active:scale-95 whitespace-nowrap"
                    title="Modify guest count in package selection"
                  >
                    <span>Change Guests</span>
                    <ArrowRight size={12} className="text-[#C8941A]" />
                  </button>
                </div>

                {/* Package Minimum Guests Info Pill */}
                <div className="flex items-center gap-2.5 text-xs font-semibold text-[#004B35] bg-[#EAF7EE] border border-[#A5DFB7] rounded-xl px-3.5 py-2.5">
                  <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[#004B35] text-white text-[10px] font-serif font-black select-none shrink-0">
                    i
                  </span>
                  <span className="leading-snug">
                    Minimum requirement for {selectedPackage?.packageName || selectedPackage?.name || "this package"} is{" "}
                    <span className="font-extrabold text-[#002E22] tabular-nums">{getPackageMinGuests(selectedPackage)} guests.</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Form Section 4: Venue Location & Type */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <MapPin size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Venue Details
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Tell us where the feast takes place.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                      Venue Name <span className="text-[#C82333]">*</span>
                    </label>
                    <div className="relative">
                      <Building2 size={15} className="text-[#D9A323] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g. Kondapur, Taj Krishna, or Resort"
                        className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl pl-9 pr-4 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] h-11 shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                      Google Map Location (Optional)
                    </label>
                    <AddressAutocomplete
                      useTextarea={false}
                      value={mapLocation}
                      onChange={(val) => setMapLocation(val)}
                      onSelect={(data) => {
                        setVenueLat(data.latitude);
                        setVenueLng(data.longitude);
                        setOrderForm({ ...orderForm, venue: data.address });
                        if (data.address) {
                          const parts = data.address.split(",");
                          if (parts.length > 0 && parts[0].trim()) {
                            setVenueName(parts[0].trim());
                          }
                        }
                        setMapLocation(data.address);
                      }}
                      placeholder="Type location or paste link..."
                      theme="green"
                      leftIcon={<MapPin className="text-[#D9A323] w-4 h-4 hover:text-[#B8860B] transition-colors" />}
                      onIconClick={() => setIsVenueMapOpen(true)}
                      className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl !py-2.5 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] h-11 shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                      <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide">
                        Venue Address <span className="text-[#C82333]">*</span>
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          className="text-[11px] font-bold text-[#004B35]/85 hover:text-[#003F2E] hover:underline transition flex items-center gap-0.5 cursor-pointer"
                        >
                          📍 Use Current Location
                        </button>
                        <span className="text-[#E8C77A] text-xs hidden sm:inline">|</span>
                        <button
                          type="button"
                          onClick={() => setIsVenueMapOpen(true)}
                          className="text-[11px] font-bold text-[#004B35] hover:underline transition flex items-center gap-0.5 cursor-pointer"
                        >
                          🗺️ Select Event Location
                        </button>
                      </div>
                    </div>
                    <AddressAutocomplete
                      useTextarea={true}
                      rows={2}
                      value={orderForm.venue}
                      onChange={(val) => setOrderForm({ ...orderForm, venue: val })}
                      onSelect={(data) => {
                        setVenueLat(data.latitude);
                        setVenueLng(data.longitude);
                        setOrderForm({ ...orderForm, venue: data.address });
                        if (data.address) {
                          const parts = data.address.split(",");
                          if (parts.length > 0 && parts[0].trim()) {
                            setVenueName(parts[0].trim());
                          }
                        }
                        setMapLocation(data.address);
                      }}
                      placeholder="Enter Street Address, Hall No, Landmark in Hyderabad..."
                      theme="green"
                      leftIcon={<MapPin className="text-[#D9A323] w-4 h-4 hover:text-[#B8860B] transition-colors" />}
                      onIconClick={() => setIsVenueMapOpen(true)}
                      className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl !py-2.5 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                    />
                    <MapPickerModal
                      isOpen={isVenueMapOpen}
                      onClose={() => setIsVenueMapOpen(false)}
                      initialLat={venueLat}
                      initialLng={venueLng}
                      initialAddress={orderForm.venue}
                      onSave={(data) => {
                        setVenueLat(data.latitude);
                        setVenueLng(data.longitude);
                        setOrderForm({ ...orderForm, venue: data.address });
                        if (data.address) {
                          const parts = data.address.split(",");
                          if (parts.length > 0 && parts[0].trim()) {
                            setVenueName(parts[0].trim());
                          }
                        }
                        setMapLocation(data.address);
                      }}
                      title="Select Event Location"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                      Venue Type <span className="text-[#C82333]">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setVenueType("Indoor")}
                        className={cn(
                          "h-11 flex items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer",
                          venueType === "Indoor"
                            ? "bg-gradient-to-r from-[#00513A] to-[#002E22] border-[#D9A323] ring-1 ring-[#F8D76A]/60 text-white shadow-sm"
                            : "bg-white border-[#E8C77A] hover:border-[#D9A323] text-[#173D30] hover:bg-[#FFF9E8]"
                        )}
                      >
                        <span>Indoor Event</span>
                        {venueType === "Indoor" && <Check size={14} className="text-[#F8D76A] shrink-0" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setVenueType("Outdoor")}
                        className={cn(
                          "h-11 flex items-center justify-center gap-1.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer",
                          venueType === "Outdoor"
                            ? "bg-gradient-to-r from-[#00513A] to-[#002E22] border-[#D9A323] ring-1 ring-[#F8D76A]/60 text-white shadow-sm"
                            : "bg-white border-[#E8C77A] hover:border-[#D9A323] text-[#173D30] hover:bg-[#FFF9E8]"
                        )}
                      >
                        <span>Outdoor Event</span>
                        {venueType === "Outdoor" && <Check size={14} className="text-[#F8D76A] shrink-0" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section 5: Special Instructions */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <ClipboardList size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Special Instructions
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Any dietary needs, spices, or separate serving request tag filters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2.5">
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={250}
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                    placeholder="Any special requests, preferences or notes for the chef..."
                    className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl px-4 py-3 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all pr-16 placeholder:text-stone-400 bg-white text-[#173D30] shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                  ></textarea>
                  <span className="absolute bottom-2.5 right-3.5 text-[11px] font-bold font-mono text-[#173D30]/75 tabular-nums">
                    {orderForm.notes.length} / 250
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 select-none">
                  {["No Onion", "Jain Food", "Less Spice", "Kids Menu", "Separate Serving"].map((tag) => {
                    const isTagSelected = orderForm.notes.toLowerCase().includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = orderForm.notes.trim();
                          const normalizedTag = tag.toLowerCase();

                          if (current.toLowerCase().includes(normalizedTag)) {
                            const regex = new RegExp(`(,\\s*)?${tag}|${tag}(,\\s*)?`, 'gi');
                            let cleaned = current.replace(regex, '').trim();
                            if (cleaned.startsWith(",")) cleaned = cleaned.substring(1).trim();
                            if (cleaned.endsWith(",")) cleaned = cleaned.substring(0, cleaned.length - 1).trim();
                            setOrderForm({ ...orderForm, notes: cleaned });
                          } else {
                            const separator = current ? ", " : "";
                            setOrderForm({ ...orderForm, notes: `${current}${separator}${tag}` });
                          }
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer min-h-[30px] flex items-center justify-center",
                          isTagSelected
                            ? "bg-[#EAF7EC] border-[#004B35]/30 text-[#004B35]"
                            : "bg-white border-[#E8C77A]/70 text-[#173D30] hover:border-[#D9A323] hover:bg-[#FFF9E8]"
                        )}
                      >
                        {isTagSelected ? `× ${tag}` : `+ ${tag}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form Section 6: Contact Information */}
            <div className="p-4 sm:p-5 lg:px-6 lg:py-5 flex flex-col lg:grid lg:grid-cols-[315px_1fr] xl:grid-cols-[335px_1fr] gap-5 lg:gap-6 items-start">
              {/* Emerald-Gold Slanted Banner */}
              <div className="w-full drop-shadow-[0_6px_14px_rgba(184,134,11,0.22)] select-none">
                <div
                  className="rounded-l-xl bg-gradient-to-br from-[#F8D76A] via-[#D9A323] to-[#A6780E] p-[1.5px] pr-[6px] pb-[2.5px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 22px) 100%, 0 100%)" }}
                >
                  <div
                    className="relative rounded-l-[10.5px] bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] pl-4 pr-9 py-3.5 min-h-[82px] flex items-center gap-3.5 overflow-hidden"
                    style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 21px) 100%, 0 100%)" }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 100 84" fill="none" className="pointer-events-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-25">
                      <path d="M90 8 C66 26 48 50 38 78" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M72 24 C60 16 46 18 36 28 C48 34 62 32 72 24 Z" fill="currentColor" fillOpacity="0.45" />
                      <path d="M58 48 C44 40 30 44 22 56 C36 60 48 56 58 48 Z" fill="currentColor" fillOpacity="0.35" />
                      <path d="M84 44 C76 58 72 70 74 82 C84 72 88 58 84 44 Z" fill="currentColor" fillOpacity="0.35" />
                    </svg>
                    <User size={24} strokeWidth={1.75} className="text-[#F8D76A] shrink-0 relative z-10" />
                    <div className="flex-1 min-w-0 text-left relative z-10">
                      <h2
                        className="text-[19px] sm:text-[21px] font-serif font-bold text-white tracking-tight leading-tight"
                        style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                      >
                        Contact Information
                      </h2>
                      <p className="text-[11.5px] sm:text-xs text-[#E4EFEA] mt-0.5 font-sans font-medium leading-snug">
                        Your details for booking confirmation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                    Your Full Name <span className="text-[#C82333]">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="text-[#D9A323] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={orderForm.name}
                      onChange={(e) => setOrderForm({ ...orderForm, name: e.target.value })}
                      placeholder="e.g. Charan"
                      className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl pl-9 pr-3.5 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] h-11 shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                    Phone Number <span className="text-[#C82333]">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={15} className="text-[#D9A323] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={orderForm.phone}
                      onChange={(e) => setOrderForm({ ...orderForm, phone: e.target.value })}
                      placeholder="e.g. 98765 43210"
                      className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl pl-9 pr-3.5 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] h-11 shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#173D30] font-sans tracking-wide mb-1.5">
                    Email (Optional)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="text-[#D9A323] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={orderForm.email || ""}
                      onChange={(e) => setOrderForm({ ...orderForm, email: e.target.value })}
                      placeholder="e.g. charan@example.com"
                      className="w-full border border-[#E8C77A] hover:border-[#D9A323] rounded-xl pl-9 pr-3.5 text-sm focus:border-[#004B35] focus:ring-2 focus:ring-[#004B35]/10 outline-none transition-all placeholder:text-stone-400 bg-white text-[#173D30] h-11 shadow-[0_2px_6px_rgba(217,163,35,0.06)]"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="w-full lg:w-[375px] xl:w-[395px] shrink-0 lg:sticky lg:top-[84px]">
            <div className="bg-[#FFFDF8] rounded-2xl border-[1.5px] border-[#D9A323]/85 shadow-[0_14px_36px_rgba(0,46,34,0.11)] overflow-hidden text-left">
              {/* Deep Emerald Header with Gold Cloche Icon & Botanical Branch */}
              <div className="bg-gradient-to-br from-[#00583F] via-[#003F2E] to-[#00261B] px-6 py-4.5 border-b-2 border-[#D9A323]/75 flex items-center gap-3 relative overflow-hidden">
                <svg aria-hidden="true" viewBox="0 0 110 70" fill="none" className="pointer-events-none select-none absolute right-2 top-0 bottom-0 h-full w-24 text-[#D9A323] opacity-55">
                  <path d="M104 62 C78 46 56 32 22 24" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M84 48 C76 34 80 20 92 12 C94 26 90 38 84 48 Z" fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="0.9" />
                  <path d="M64 38 C56 26 60 14 70 8 C72 20 70 30 64 38 Z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="0.9" />
                  <path d="M44 30 C34 22 36 12 44 6 C48 16 48 24 44 30 Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="0.9" />
                  <path d="M62 42 C48 48 36 46 28 38 C40 36 52 38 62 42 Z" fill="currentColor" fillOpacity="0.35" />
                </svg>

                {/* Gold Catering Cloche Icon */}
                <svg viewBox="0 0 36 28" fill="none" className="w-8 h-6.5 text-[#F8D76A] shrink-0 relative z-10" aria-hidden="true">
                  <circle cx="18" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M6 19C6 12.3726 11.3726 7 18 7C24.6274 7 30 12.3726 30 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M2.5 22.5H33.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M4.5 19H31.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <h3
                  className="font-serif text-[23px] sm:text-[25px] font-bold text-white tracking-tight leading-none relative z-10"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  Order Summary
                </h3>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Package Metadata */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start text-sm gap-3">
                    <span className="text-[#5B6D65] font-semibold font-sans">Selected Package</span>
                    <div className="text-right">
                      <span className="font-bold text-[#0B1F17] block text-[15px] leading-tight">
                        {selectedPackage?.packageName}
                      </span>
                      <span className="inline-block text-[10px] text-[#8E6211] bg-[#FBF2D8] border border-[#E8C77A] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider mt-1">
                        {selectedPackage?.vegNonVeg || "Catering Package"}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-[#E8C77A]/35" />

                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="text-[#5B6D65] font-semibold font-sans">Selected Menu</span>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0B1F17] tabular-nums">
                        {Object.keys(selectedItems).filter((k) => selectedItems[k]).length} Items
                      </span>
                      <button
                        type="button"
                        onClick={() => setViewMode("custom")}
                        className="inline-flex items-center gap-1 text-[11px] text-[#8E6211] hover:text-[#003F2E] font-bold cursor-pointer bg-[#FFF9E8] hover:bg-[#F7EBC6] border border-[#D9A323]/70 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Pencil size={11} className="text-[#C8941A]" />
                        <span>Edit Menu</span>
                      </button>
                    </div>
                  </div>

                  {selectedMeals.length > 0 && (
                    <div className="flex justify-between items-start text-sm gap-3">
                      <span className="text-[#5B6D65] font-semibold font-sans">Meals Included</span>
                      <span className="font-extrabold text-[#0B1F17] text-right max-w-[200px] leading-snug">
                        {selectedMeals.join(", ")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="text-[#5B6D65] font-semibold font-sans">Guests Sizing</span>
                    <span className="font-extrabold text-[#0B1F17] tabular-nums">
                      {guests} Guests
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm gap-2">
                    <span className="text-[#5B6D65] font-semibold font-sans">Est. Price per Plate</span>
                    <span className="font-extrabold text-[#0B1F17] tabular-nums">
                      ₹{currentPerPlatePrice}
                    </span>
                  </div>
                </div>

                {/* Platform Fee & Coupons */}
                <div className="bg-[#FBF6EA] border border-[#E8C77A]/70 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#173D30] font-bold font-sans flex items-center gap-1">
                      <span>Platform Fee</span>
                      <span className="text-[11px] text-[#5B6D65] font-medium">
                        (₹{platformFeePerPlate}/plate)
                      </span>
                    </span>
                    <span
                      className={cn(
                        "font-extrabold tabular-nums",
                        appliedCoupon === "NEW"
                          ? "text-stone-400 line-through"
                          : "text-[#0B1F17]"
                      )}
                    >
                      ₹{(guests * platformFeePerPlate).toLocaleString()}
                    </span>
                  </div>

                  {appliedCoupon !== "NEW" ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="text-[#D9A323] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="COUPON CODE? (TRY 'NEW')"
                          className="w-full bg-white border border-[#E8C77A] rounded-lg pl-8 pr-3 py-2 text-[11px] outline-none focus:border-[#004B35] uppercase font-bold text-[#173D30] placeholder:text-[#5B6D65]/80 h-10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (couponCode === "NEW") {
                            setAppliedCoupon("NEW");
                            toast("Welcome Offer Applied!", "success");
                          } else {
                            toast("Invalid coupon code", "error");
                          }
                        }}
                        className="bg-gradient-to-b from-[#00513A] to-[#002E22] hover:brightness-110 text-white border border-[#D9A323]/80 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 h-10 flex items-center justify-center shadow-2xs"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs text-[#004B35] bg-[#EAF7EC] border border-[#A3DFB5] px-3 py-2 rounded-lg">
                      <span className="font-bold flex items-center gap-1.5">
                        <Check size={14} className="text-[#108A48] shrink-0" />
                        Code 'NEW' Applied
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold tabular-nums">
                          -₹{(guests * platformFeePerPlate).toLocaleString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon("");
                            setCouponCode("");
                          }}
                          className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          aria-label="Remove coupon"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm pt-2.5 border-t border-[#E8C77A]/50">
                    <span className="text-[#173D30] font-bold">
                      Payable Platform Fee
                    </span>
                    <span className="font-extrabold text-[#003F2E] tabular-nums">
                      ₹
                      {appliedCoupon === "NEW"
                        ? "0"
                        : (guests * platformFeePerPlate).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total Summary Highlight Box */}
                <div className="space-y-2.5">
                  <div className="rounded-xl bg-gradient-to-r from-[#FCE69B] via-[#F6D572] to-[#E9B941] border border-[#D9A323] shadow-[0_4px_14px_rgba(217,163,35,0.22)] px-4 py-3.5 flex items-center justify-between gap-2">
                    <span
                      className="font-serif text-[20px] font-extrabold text-[#0B1F17] leading-none"
                      style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                    >
                      Total Estimate
                    </span>
                    <span className="font-sans text-[25px] sm:text-[27px] font-extrabold text-[#0B1F17] tracking-tight tabular-nums leading-none">
                      ₹
                      {(
                        currentPerPlatePrice * guests +
                        (appliedCoupon === "NEW" ? 0 : guests * platformFeePerPlate)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-[#E8C77A]/60 text-[11px] text-[#354B43] font-semibold">
                    <div className="flex items-center justify-center gap-1.5 pr-2">
                      <CheckCircle2 size={13} className="text-[#C8941A] shrink-0" />
                      <span>Inclusive of Taxes</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 pl-2">
                      <CheckCircle2 size={13} className="text-[#C8941A] shrink-0" />
                      <span>No Hidden Charges</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log("[TRACE_LOG #1] Confirm Booking button clicked (isQuote = false)");
                    handleBooking(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#00513A] via-[#003B2A] to-[#00261B] hover:brightness-110 text-white border-[1.5px] border-[#D9A323] py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-[0_6px_18px_rgba(0,75,53,0.30)] select-none text-[16px] min-h-[52px] active:scale-[0.99]"
                >
                  <Calendar size={18} className="text-[#F8D76A] shrink-0" />
                  <span>Confirm Booking</span>
                  <ArrowRight size={18} className="shrink-0" />
                </button>

                {/* Security Shield Callout */}
                <p className="text-center text-[10px] text-[#354B43] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 pt-0.5">
                  <ShieldCheck size={14} className="text-[#C8941A] shrink-0" />
                  <span>No payment required today • Failsafe Lock</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Sticky Booking Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF8]/95 backdrop-blur-md border-t border-[#E8C77A] px-4 py-2.5 z-30 shadow-[0_-4px_18px_rgba(0,46,34,0.10)] flex items-center justify-between gap-3 animate-slide-up">
            <div className="text-left">
              <span className="text-[9px] text-[#8E6211] font-extrabold uppercase tracking-widest block leading-none mb-1">
                Total Estimate
              </span>
              <span className="font-sans text-lg font-extrabold text-[#0B1F17] tabular-nums">
                ₹{(currentPerPlatePrice * guests + (appliedCoupon === "NEW" ? 0 : guests * platformFeePerPlate)).toLocaleString("en-IN")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log("[TRACE_LOG #1] Confirm Booking via Sticky Mobile clicked");
                handleBooking(false);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-[#00513A] to-[#002E22] hover:brightness-110 text-white border border-[#D9A323] rounded-xl font-bold text-xs tracking-wide shadow-md select-none flex-1 max-w-[205px] text-center min-h-[44px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <Calendar size={14} className="text-[#F8D76A] shrink-0" />
              <span>Confirm Booking</span>
              <ArrowRight size={14} className="shrink-0" />
            </button>
          </div>

        </div>
      )}

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#011610]/60 backdrop-blur-sm">
          <div className="bg-[#FFFDF8] border border-[#DFC78A] rounded-[24px] p-8 max-w-sm w-full relative shadow-[0_24px_56px_rgba(1,22,16,0.28)]">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-2 bg-[#FAF3E2] border border-[#DFC78A] text-[#6B5A38] hover:bg-[#F3E6C6] hover:text-[#083A28] rounded-full transition-colors flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#FAF1DA] border border-[#DFC78A] text-[#9C6F11] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <User size={30} />
              </div>
              <h3 className="text-2xl font-bold font-display text-[#083A28] mb-2">
                Login Required
              </h3>
              <p className="text-[#5D665F] text-sm mb-8">
                Please login to continue your{" "}
                {pendingAction ? "quote request" : "booking"}. Your progress
                will be saved.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleProceedToLogin}
                  className="w-full bg-gradient-to-b from-[#065239] to-[#012217] hover:from-[#076043] hover:to-[#022B1E] border border-[#D4961B]/60 text-[#FFFDF8] font-bold py-3.5 rounded-xl transition-all shadow-[0_6px_16px_rgba(1,34,23,0.2)] cursor-pointer"
                >
                  Login to Continue
                </button>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="w-full bg-[#FAF3E2] text-[#132A1F] font-bold py-3.5 rounded-xl border border-[#DFC78A] hover:bg-[#F3E6C6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
