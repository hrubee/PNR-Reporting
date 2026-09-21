export interface OutletSheet {
  id: string;
  label: string;
  icon: string;
  route: string;
  description?: string;
}

export interface OutletConfig {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  sheets: OutletSheet[];
}

export const OUTLETS: OutletConfig[] = [
  {
    id: "bakery",
    name: "Bakery",
    icon: "🥐",
    tagline: "Main Bakery Facility",
    sheets: [
      { id: "HYGIENE_REPORT", label: "Hygiene Report", icon: "🧹", route: "/hygiene" },
      { id: "GLASS_REPORT", label: "Glass Report", icon: "🪟", route: "/glass" },
      { id: "FRIDGE_REPORT", label: "Fridge Report", icon: "🧊", route: "/fridge" },
      { id: "KITCHEN", label: "Kitchen", icon: "🍳", route: "/kitchen" },
      { id: "PRODUCTION", label: "Production", icon: "🏭", route: "/production" },
      { id: "PUFF_ROOM", label: "Puff Room", icon: "🥐", route: "/puff-room" },
      { id: "CAKE_ROOM", label: "Cake Room", icon: "🎂", route: "/cake-room" },
    ],
  },
  {
    id: "oreta-world",
    name: "Oreta World",
    icon: "🌐",
    tagline: "Oreta World Outlet",
    sheets: [
      {
        id: "ORETA_SHOP_CLEANING",
        label: "House Keeping",
        icon: "🧹",
        route: "/oreta/shop-cleaning",
        description: "4-Shift Daily House Keeping Checklist",
      },
      {
        id: "ORETA_EQUIPMENT",
        label: "Equipment Cleaning",
        icon: "⚙️",
        route: "/oreta/equipment",
        description: "Daily Kitchen & Cafe Equipment Sanitation Log",
      },
      {
        id: "ORETA_FRIDGE",
        label: "Fridge & Display Temp",
        icon: "🧊",
        route: "/oreta/fridge",
        description: "Kitchen Units & Cake Display Temperature Log",
      },
      {
        id: "ORETA_GLASS",
        label: "Glass Report",
        icon: "🪟",
        route: "/oreta/glass",
        description: "Ground Floor & Mezzanine Glass Inspection",
      },
      {
        id: "ORETA_MONTHLY",
        label: "Monthly Maintenance",
        icon: "🗓️",
        route: "/oreta/monthly",
        description: "Shutters, AC & Generator Deep Cleaning",
      },
      {
        id: "ORETA_FOOD",
        label: "Food",
        icon: "🍲",
        route: "/oreta/food",
        description: "Temp Control, Veg & Non-Veg Filling Logs",
      },
    ],
  },
  {
    id: "rns-world",
    name: "RNS World",
    icon: "🏢",
    tagline: "RNS World Outlet",
    sheets: [
      {
        id: "RNS_EQUIPMENT",
        label: "Equipment & Hygiene",
        icon: "⚙️",
        route: "/rns/equipment",
        description: "Daily Equipment Cleaning & Sanitation Checklist (30 Items)",
      },
    ],
  },
  {
    id: "symphony-world",
    name: "Symphony World",
    icon: "🎼",
    tagline: "Symphony World Outlet",
    sheets: [
      {
        id: "SYMPHONY_EQUIPMENT",
        label: "Equipment & Hygiene",
        icon: "⚙️",
        route: "/symphony/equipment",
        description: "Daily Equipment Cleaning & Sanitation Checklist (32 Items)",
      },
    ],
  },
];

export const DEFAULT_OUTLET = OUTLETS[0];

export function getOutletById(id?: string | null): OutletConfig {
  if (!id) return DEFAULT_OUTLET;
  return OUTLETS.find((o) => o.id === id) || DEFAULT_OUTLET;
}

export function getOutletByRoute(pathname: string): OutletConfig {
  if (pathname.startsWith("/oreta")) {
    return OUTLETS.find((o) => o.id === "oreta-world") || DEFAULT_OUTLET;
  }
  if (pathname.startsWith("/rns")) {
    return OUTLETS.find((o) => o.id === "rns-world") || DEFAULT_OUTLET;
  }
  if (pathname.startsWith("/symphony")) {
    return OUTLETS.find((o) => o.id === "symphony-world") || DEFAULT_OUTLET;
  }
  return DEFAULT_OUTLET;
}

// ─── 1. Oreta Shop Cleaning (4 Shifts) ────────────────────────────────────────
export interface OretaAreaDefinition {
  id: number;
  area: string;
  assignedStaff: string[];
  defaultStaff: string;
  morningDisabled?: boolean;
}

export const ORETA_HYGIENE_AREAS: OretaAreaDefinition[] = [
  { id: 1, area: "KITCHEN", assignedStaff: ["Rameshwar", "Bharti"], defaultStaff: "Rameshwar" },
  { id: 2, area: "WASH ROOM", assignedStaff: ["Mangla", "Bharti"], defaultStaff: "Mangla", morningDisabled: true },
  { id: 3, area: "OUTDOOR CLEANING", assignedStaff: ["Mangla", "Bharti"], defaultStaff: "Mangla" },
  { id: 4, area: "GROUND FLOOR", assignedStaff: ["Mangla", "Bharti"], defaultStaff: "Mangla" },
  { id: 5, area: "MEZZANINE FLOOR", assignedStaff: ["Mangla", "Bharti"], defaultStaff: "Mangla" },
];

// ─── 2. Oreta Equipment Cleaning (41 items) ──────────────────────────────────
export const ORETA_EQUIPMENT_ITEMS = [
  // Kitchen & Cooking
  { id: 1, name: "Oven", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 2, name: "Microwave", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 3, name: "Gas range", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 4, name: "Oil fryer", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 5, name: "Table 1", category: "Kitchen & Cooking", defaultCleanedBy: "Bharti" },
  { id: 6, name: "Table 2", category: "Kitchen & Cooking", defaultCleanedBy: "Bharti" },
  { id: 7, name: "Table 3", category: "Kitchen & Cooking", defaultCleanedBy: "Bharti" },
  { id: 8, name: "Bar counter", category: "Kitchen & Cooking", defaultCleanedBy: "Bharti" },
  { id: 9, name: "Kitchen Rack", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 10, name: "Wash Sink", category: "Kitchen & Cooking", defaultCleanedBy: "Bharti" },
  { id: 11, name: "Chimney", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 12, name: "Griller 1", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  { id: 13, name: "Griller 2", category: "Kitchen & Cooking", defaultCleanedBy: "Rameshwar" },
  // Beverage & Cold Storage
  { id: 14, name: "Iced tea machine", category: "Beverage & Refrigeration", defaultCleanedBy: "Arzaaan" },
  { id: 15, name: "Coffee machine 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Arzaaan" },
  { id: 16, name: "Coffee machine 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Arzaaan" },
  { id: 17, name: "Fridge 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Rameshwar" },
  { id: 18, name: "Fridge 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Rameshwar" },
  { id: 19, name: "Fridge Top", category: "Beverage & Refrigeration", defaultCleanedBy: "Rameshwar" },
  { id: 20, name: "Freezer 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Rameshwar" },
  // Containers & Prep
  { id: 21, name: "Food containers", category: "Containers & Prep", defaultCleanedBy: "Bharti" },
  { id: 22, name: "Sauce containers", category: "Containers & Prep", defaultCleanedBy: "Bharti" },
  { id: 23, name: "Spice containers", category: "Containers & Prep", defaultCleanedBy: "Bharti" },
  { id: 24, name: "Weighing Scale 1", category: "Containers & Prep", defaultCleanedBy: "Arzaaan" },
  { id: 25, name: "Weighing Scale 2", category: "Containers & Prep", defaultCleanedBy: "Arzaaan" },
  { id: 26, name: "Wet and Dry Dustbins", category: "Containers & Prep", defaultCleanedBy: "Mangla" },
  // Display & Retail
  { id: 27, name: "Cake counter 1", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 28, name: "Cake counter 2", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 29, name: "Ice cream counter", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 30, name: "Food rack", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 31, name: "Food Rack Top", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 32, name: "Store rack", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 33, name: "Store room", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 34, name: "Cabinet cleaning", category: "Display & Retail", defaultCleanedBy: "Mangla" },
  { id: 35, name: "Cash Counter", category: "Display & Retail", defaultCleanedBy: "Arzaaan" },
  { id: 36, name: "Gods Altar", category: "Display & Retail", defaultCleanedBy: "Bharti" },
  // Facility & Outdoor
  { id: 37, name: "Pest control", category: "Facility & Environment", defaultCleanedBy: "Mangla" },
  { id: 38, name: "Pest - Flies Machine", category: "Facility & Environment", defaultCleanedBy: "Mangla" },
  { id: 39, name: "Outdoor sitting area", category: "Facility & Environment", defaultCleanedBy: "Mangla" },
  { id: 40, name: "Web Cleaning", category: "Facility & Environment", defaultCleanedBy: "Mangla" },
  { id: 41, name: "Signage board", category: "Facility & Environment", defaultCleanedBy: "Mangla" },
];

// ─── 3. Oreta Fridge & Temperature Units ──────────────────────────────────────
export interface OretaFridgeItem {
  id: number;
  section: "Kitchen" | "Cake Display";
  productName: string;
  machineNumber: string;
  referenceTemp: string;
}

export const ORETA_FRIDGE_ITEMS: OretaFridgeItem[] = [
  // Kitchen Group
  { id: 1, section: "Kitchen", productName: "FRIDGE UNDER TABLE", machineNumber: "1", referenceTemp: "+3 to +8°C" },
  { id: 2, section: "Kitchen", productName: "FRIDGE 1", machineNumber: "2", referenceTemp: "+3 to +8°C" },
  { id: 3, section: "Kitchen", productName: "FRIDGE 2", machineNumber: "3", referenceTemp: "+3 to +8°C" },
  { id: 4, section: "Kitchen", productName: "FREEZER 1", machineNumber: "1", referenceTemp: "-18 to -15°C" },
  { id: 5, section: "Kitchen", productName: "FREEZER 2", machineNumber: "2", referenceTemp: "-18 to -15°C" },
  // Cake Display Group (Confirmed Reference: +2 to +10°C)
  { id: 6, section: "Cake Display", productName: "Cake display counter 1", machineNumber: "1", referenceTemp: "+2 to +10°C" },
  { id: 7, section: "Cake Display", productName: "Cake display counter 2", machineNumber: "2", referenceTemp: "+2 to +10°C" },
];

// ─── 4. Oreta Glass Report (Ground & Mezzanine) ───────────────────────────────
export const ORETA_GLASS_ITEMS = [
  { id: 1, floor: "Ground Floor", location: "Glass Ground floor 1", defaultCleanedBy: "Mangla" },
  { id: 2, floor: "Ground Floor", location: "Glass Ground floor 2", defaultCleanedBy: "Mangla" },
  { id: 3, floor: "Ground Floor", location: "Glass Ground floor 3", defaultCleanedBy: "Mangla" },
  { id: 4, floor: "Ground Floor", location: "Glass Ground floor 4", defaultCleanedBy: "Mangla" },
  { id: 5, floor: "Mezzanine Floor", location: "Mezzanine floor 1", defaultCleanedBy: "Bharti" },
  { id: 6, floor: "Mezzanine Floor", location: "Mezzanine floor 2", defaultCleanedBy: "Bharti" },
];

// ─── 5. Oreta Monthly Maintenance ────────────────────────────────────────────
export const ORETA_MONTHLY_ITEMS = [
  { id: 1, task: "Shutter", category: "Physical Security", defaultCleanedBy: "Mangla" },
  { id: 2, task: "Shutter Locks", category: "Physical Security", defaultCleanedBy: "Mangla" },
  { id: 3, task: "Generator area", category: "Electrical & Power", defaultCleanedBy: "Rameshwar" },
  { id: 4, task: "Generator maintenance", category: "Electrical & Power", defaultCleanedBy: "Technician / Rameshwar" },
  { id: 5, task: "Air condition maintenance", category: "HVAC & Climate", defaultCleanedBy: "AC Technician" },
  { id: 6, task: "Fridge maintenance", category: "Refrigeration", defaultCleanedBy: "Chiller Technician" },
];

export const ORETA_STAFF = [
  "Rameshwar",
  "Bharti",
  "Mangla",
  "Arzaaan",
  "New Staff",
  "Admin",
];

// ─── 6. Oreta Food Safety & Product Logs ───────────────────────────────────────
export interface FoodGuideline {
  condition: string;
  requirement: string;
  notes: string;
}

export const FOOD_GUIDELINES: FoodGuideline[] = [
  { condition: "Freezer Storage", requirement: "-15°C to -18°C", notes: "Store in Freezer" },
  { condition: "Fridge Storage (Opened)", requirement: "+1°C to +5°C", notes: "Once opened, store in fridge" },
  { condition: "Warming Rule", requirement: "Do not re-use once warmed", notes: "Single-use after warming" },
  { condition: "Thawing Requirement", requirement: "Refrigerate it & thaw", notes: "If you need to thaw, must go via fridge" },
  { condition: "Prohibited Thawing", requirement: "DO NOT thaw in room temperature", notes: "Strictly prohibited" },
  { condition: "Shelf Life (Opened)", requirement: "Use within 2 days (48 hrs)", notes: "Once open use within 2 days - 48 hrs" },
];

export const ORETA_TEMP_CONTROL_ITEMS = [
  { id: 1, name: "Boiled chicken", defaultCookingTemp: "77", defaultHoldingTemp: "55", defaultUseBy: "48 hrs / OK" },
  { id: 2, name: "Spinach", defaultCookingTemp: "77", defaultHoldingTemp: "55", defaultUseBy: "48 hrs / OK" },
  { id: 3, name: "Boiled Potato", defaultCookingTemp: "77", defaultHoldingTemp: "55", defaultUseBy: "48 hrs / OK" },
];

export const ORETA_VEG_FILLING_ITEMS = [
  { id: 1, name: "Paneer Tikka", hasOpenDate: true },
  { id: 2, name: "Paneer Chilly", hasOpenDate: true },
  { id: 3, name: "Veg Mexican", hasOpenDate: false },
  { id: 4, name: "Schezwan Sauce", hasOpenDate: false },
  { id: 5, name: "Tikka Sauce", hasOpenDate: false },
  { id: 6, name: "Chutney", hasOpenDate: false },
];

export const ORETA_NON_VEG_FILLING_ITEMS = [
  { id: 1, name: "Chicken Tikka" },
  { id: 2, name: "Chicken Mexican" },
  { id: 3, name: "Chicken Chilly" },
];

// Dropdown Pre-set Options for Food Safety Inputs
export const COOKING_TEMP_OPTIONS = [
  "70°C", "72°C", "75°C", "77°C", "80°C", "82°C", "85°C", "88°C", "90°C", ">90°C"
];

export const HOLDING_TEMP_OPTIONS = [
  "+1°C", "+2°C", "+3°C", "+4°C", "+5°C", "45°C", "50°C", "52°C", "55°C", "58°C", "<60°C"
];

export const FRIDGE_TEMP_OPTIONS = [
  "+1°C", "+2°C", "+3°C", "+4°C", "+5°C", "+6°C", "+7°C", "+8°C"
];

export const USE_BY_OPTIONS = [
  "12 hrs",
  "24 hrs",
  "48 hrs",
  "OK",
  "48 hrs / OK",
  "Use within 2 days",
  "Use Today",
  "Discard",
];

export const WASTAGE_OPTIONS = [
  "0 / None",
  "25g",
  "50g",
  "100g",
  "150g",
  "200g",
  "250g",
  "300g",
  "500g",
  "1 kg",
  "1.5 kg",
  "2 kg+",
];

export const TIME_PRESET_OPTIONS = [
  "08:00 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:30 PM",
  "08:00 PM",
  "09:30 PM",
  "10:00 PM",
];

// ─── 7. RNS World Equipment & Hygiene Items (30 items) ────────────────────────
export const RNS_EQUIPMENT_ITEMS = [
  // Kitchen & Cooking
  { id: 1, name: "Exhaust Fan", category: "Kitchen & Cooking", defaultCleanedBy: "Madhavi" },
  { id: 2, name: "Griller 1", category: "Kitchen & Cooking", defaultCleanedBy: "Madhavi" },
  { id: 3, name: "Griller 2", category: "Kitchen & Cooking", defaultCleanedBy: "Madhavi" },
  // Beverage & Refrigeration
  { id: 4, name: "Iced Tea Machine", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 5, name: "Coffee Machine 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 6, name: "Coffee Machine 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 7, name: "Fridge 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 8, name: "Fridge 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 9, name: "Freezer 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  { id: 10, name: "Freezer 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Madhavi" },
  // Containers & Prep
  { id: 11, name: "Food Containers", category: "Containers & Prep", defaultCleanedBy: "Ashok" },
  { id: 12, name: "Sauce Containers", category: "Containers & Prep", defaultCleanedBy: "Ashok" },
  { id: 13, name: "Spice Containers", category: "Containers & Prep", defaultCleanedBy: "Ashok" },
  { id: 14, name: "Weighing Scale 1", category: "Containers & Prep", defaultCleanedBy: "Ashok" },
  { id: 15, name: "Weighing Scale 2", category: "Containers & Prep", defaultCleanedBy: "Ashok" },
  { id: 16, name: "Wet and Dry Dustbins", category: "Containers & Prep", defaultCleanedBy: "Mavshi" },
  // Display & Retail
  { id: 17, name: "Cake Counter 1", category: "Display & Retail", defaultCleanedBy: "Nisha" },
  { id: 18, name: "Cake Counter 2", category: "Display & Retail", defaultCleanedBy: "Nisha" },
  { id: 19, name: "IceCream Counter 1", category: "Display & Retail", defaultCleanedBy: "Sachin" },
  { id: 20, name: "IceCream Counter 2", category: "Display & Retail", defaultCleanedBy: "Sachin" },
  { id: 21, name: "Food Rack", category: "Display & Retail", defaultCleanedBy: "Navin" },
  { id: 22, name: "Cabinet Cleaning", category: "Display & Retail", defaultCleanedBy: "Ashok" },
  { id: 23, name: "Cash Counter", category: "Display & Retail", defaultCleanedBy: "Nisha" },
  { id: 24, name: "Gods Altar", category: "Display & Retail", defaultCleanedBy: "Nisha" },
  { id: 25, name: "Pest Stop Cleaning", category: "Display & Retail", defaultCleanedBy: "Mavshi" },
  { id: 26, name: "Pest Control", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  { id: 27, name: "Indoor Seating & Tables", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  // Facility & Environment
  { id: 28, name: "Outdoor Area", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  { id: 29, name: "Web Cleaning", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  { id: 30, name: "Signage Board", category: "Facility & Environment", defaultCleanedBy: "Ashok" },
];

export const RNS_STAFF = ["Madhavi", "Ashok", "Mavshi", "Nisha", "Sachin", "Navin"];

// ─── 8. Symphony World Equipment & Hygiene Items (32 items) ───────────────────
export const SYMPHONY_EQUIPMENT_ITEMS = [
  // Kitchen & Cooking
  { id: 1, name: "Chimney", category: "Kitchen & Cooking", defaultCleanedBy: "Kamran" },
  { id: 2, name: "Griller 1", category: "Kitchen & Cooking", defaultCleanedBy: "Kamran" },
  { id: 3, name: "Griller 2", category: "Kitchen & Cooking", defaultCleanedBy: "Kamran" },
  // Beverage & Refrigeration
  { id: 4, name: "Iced Tea Machine", category: "Beverage & Refrigeration", defaultCleanedBy: "Bapu" },
  { id: 5, name: "Coffee Machine 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Bapu" },
  { id: 6, name: "Coffee Machine 2", category: "Beverage & Refrigeration", defaultCleanedBy: "Bapu" },
  { id: 7, name: "Fridge 1 Under Table", category: "Beverage & Refrigeration", defaultCleanedBy: "Kamran" },
  { id: 8, name: "Freezer 1", category: "Beverage & Refrigeration", defaultCleanedBy: "Kamran" },
  { id: 9, name: "Freezer 2 Store", category: "Beverage & Refrigeration", defaultCleanedBy: "Kamran" },
  // Containers & Prep
  { id: 10, name: "Food Containers", category: "Containers & Prep", defaultCleanedBy: "Bapu" },
  { id: 11, name: "Sauce Containers", category: "Containers & Prep", defaultCleanedBy: "Bapu" },
  { id: 12, name: "Spice Containers", category: "Containers & Prep", defaultCleanedBy: "Bapu" },
  { id: 13, name: "Weighing Scale 1", category: "Containers & Prep", defaultCleanedBy: "Bapu" },
  { id: 14, name: "Weighing Scale 2", category: "Containers & Prep", defaultCleanedBy: "Bapu" },
  { id: 15, name: "Wet and Dry Dustbins", category: "Containers & Prep", defaultCleanedBy: "Mavshi" },
  // Display & Retail
  { id: 16, name: "Cake Counter 1", category: "Display & Retail", defaultCleanedBy: "Deva" },
  { id: 17, name: "Cake Counter 2", category: "Display & Retail", defaultCleanedBy: "Deva" },
  { id: 18, name: "Cake Counter 3", category: "Display & Retail", defaultCleanedBy: "Deva" },
  { id: 19, name: "IceCream Counter", category: "Display & Retail", defaultCleanedBy: "Shagir" },
  { id: 20, name: "Food Rack", category: "Display & Retail", defaultCleanedBy: "Gaurav" },
  { id: 21, name: "Food Rack Top Counter", category: "Display & Retail", defaultCleanedBy: "Gaurav" },
  { id: 22, name: "Cabinet Below Rack", category: "Display & Retail", defaultCleanedBy: "Rahul" },
  { id: 23, name: "Store Rack", category: "Display & Retail", defaultCleanedBy: "Someshwar" },
  { id: 24, name: "Store Room", category: "Display & Retail", defaultCleanedBy: "Someshwar" },
  { id: 25, name: "Cash Counter", category: "Display & Retail", defaultCleanedBy: "Deva" },
  { id: 26, name: "Gods Altar", category: "Display & Retail", defaultCleanedBy: "Rahul" },
  { id: 27, name: "Pest Stop Cleaning", category: "Display & Retail", defaultCleanedBy: "Mavshi" },
  { id: 28, name: "Pest Control", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  // Facility & Environment
  { id: 29, name: "Indoor Seating & Tables", category: "Facility & Environment", defaultCleanedBy: "HK" },
  { id: 30, name: "Outdoor Sitting Area", category: "Facility & Environment", defaultCleanedBy: "HK" },
  { id: 31, name: "Web Cleaning", category: "Facility & Environment", defaultCleanedBy: "Mavshi" },
  { id: 32, name: "Signage board", category: "Facility & Environment", defaultCleanedBy: "Rahul" },
];

export const SYMPHONY_STAFF = [
  "Kamran",
  "Bapu",
  "Mavshi",
  "Someshwar",
  "Deva",
  "Shagir",
  "Gaurav",
  "Rahul",
  "HK",
  "New Staff",
];

// ─── 9. Bakery Facility Categorized Equipment Items ───────────────────────────
export interface BakeryEquipmentItem {
  id: number;
  name: string;
  category: string;
}

export const BAKERY_KITCHEN_ITEMS: BakeryEquipmentItem[] = [
  { id: 1, name: "OVEN 1", category: "Cooking & Ovens" },
  { id: 2, name: "OVEN 2", category: "Cooking & Ovens" },
  { id: 3, name: "OVEN 3", category: "Cooking & Ovens" },
  { id: 4, name: "ELECTRIC GAS RANGE 1", category: "Cooking & Ovens" },
  { id: 5, name: "ELECTRIC GAS RANGE 2", category: "Cooking & Ovens" },
  { id: 6, name: "GAS BURNER 3 BURNER", category: "Cooking & Ovens" },
  { id: 7, name: "GAS BURNER SINGLE", category: "Cooking & Ovens" },
  { id: 8, name: "TANDOOR", category: "Cooking & Ovens" },
  { id: 9, name: "WORKING TABLE 1", category: "Preparation Tables" },
  { id: 10, name: "WORKING TABLE 2", category: "Preparation Tables" },
  { id: 11, name: "WORKING TABLE 3", category: "Preparation Tables" },
  { id: 12, name: "WORKING TABLE 4", category: "Preparation Tables" },
  { id: 13, name: "WORKING TABLE 5", category: "Preparation Tables" },
  { id: 14, name: "WORKING TABLE 6", category: "Preparation Tables" },
  { id: 15, name: "MIXER GRINDER", category: "Grinders & Machinery" },
  { id: 16, name: "MASALA GRINDER", category: "Grinders & Machinery" },
  { id: 17, name: "KHEEMA MACHINE", category: "Grinders & Machinery" },
  { id: 18, name: "PROOFER", category: "Grinders & Machinery" },
  { id: 19, name: "CHILLER BLASTER", category: "Grinders & Machinery" },
  { id: 20, name: "SINK 1", category: "Sanitation & Waste" },
  { id: 21, name: "WET - DRY DUSTBIN", category: "Sanitation & Waste" },
];

export const BAKERY_PRODUCTION_ITEMS: BakeryEquipmentItem[] = [
  { id: 1, name: "WORKING TABLE 1", category: "Working Tables" },
  { id: 2, name: "WORKING TABLE 2", category: "Working Tables" },
  { id: 3, name: "WORKING TABLE 3", category: "Working Tables" },
  { id: 4, name: "WORKING TABLE 4", category: "Working Tables" },
  { id: 5, name: "WORKING TABLE 5", category: "Working Tables" },
  { id: 6, name: "WORKING TABLE 6", category: "Working Tables" },
  { id: 7, name: "WORKING TABLE 7", category: "Working Tables" },
  { id: 8, name: "DOUGH KNEADER", category: "Mixers & Dough Processing" },
  { id: 9, name: "SPIRAL MIXER", category: "Mixers & Dough Processing" },
  { id: 10, name: "PLANETARY MIXER 1", category: "Mixers & Dough Processing" },
  { id: 11, name: "PLANETARY MIXER 2", category: "Mixers & Dough Processing" },
  { id: 12, name: "PLANETARY MIXER 3", category: "Mixers & Dough Processing" },
  { id: 13, name: "PLANETARY MIXER 4", category: "Mixers & Dough Processing" },
  { id: 14, name: "PLANETARY MIXER 5", category: "Mixers & Dough Processing" },
  { id: 15, name: "PLANETARY MIXER 6", category: "Mixers & Dough Processing" },
  { id: 16, name: "BREAD SLICER 1 / TABLE", category: "Slicing & Packaging" },
  { id: 17, name: "BREAD SLICER 2 / TABLE", category: "Slicing & Packaging" },
  { id: 18, name: "BREAD BUN DIVIDER", category: "Slicing & Packaging" },
  { id: 19, name: "WEIGHING SCALE 1 / TABLE", category: "Slicing & Packaging" },
  { id: 20, name: "WEIGHING SCALE 2 / TABLE", category: "Slicing & Packaging" },
  { id: 21, name: "SEALING MACHINE 1", category: "Slicing & Packaging" },
  { id: 22, name: "SEALING MACHINE 2", category: "Slicing & Packaging" },
  { id: 23, name: "FLOUR BIN 1", category: "Storage & Washing" },
  { id: 24, name: "FLOUR BIN 2", category: "Storage & Washing" },
  { id: 25, name: "FLOUR BIN 3", category: "Storage & Washing" },
  { id: 26, name: "WASH SINK 1", category: "Storage & Washing" },
  { id: 27, name: "WASH SINK 2", category: "Storage & Washing" },
  { id: 28, name: "WET - DRY DUSTBIN", category: "Storage & Washing" },
];

export const BAKERY_PUFF_ROOM_ITEMS: BakeryEquipmentItem[] = [
  { id: 1, name: "DOUGH SHEETER", category: "Machinery & Tables" },
  { id: 2, name: "TABLE 1", category: "Machinery & Tables" },
  { id: 3, name: "TABLE 2", category: "Machinery & Tables" },
  { id: 4, name: "TABLE 3", category: "Machinery & Tables" },
  { id: 5, name: "TABLE 4", category: "Machinery & Tables" },
  { id: 6, name: "STORE ROOM 1", category: "Storage & Racks" },
  { id: 7, name: "STORE ROOM 2", category: "Storage & Racks" },
  { id: 8, name: "RACKS", category: "Storage & Racks" },
  { id: 9, name: "CUPBOARD 1", category: "Storage & Racks" },
  { id: 10, name: "CUPBOARD 2", category: "Storage & Racks" },
  { id: 11, name: "WASH SINK 1", category: "Facility & Wash" },
  { id: 12, name: "WET - DRY DUSTBIN", category: "Facility & Wash" },
  { id: 13, name: "LIFT", category: "Facility & Wash" },
  { id: 14, name: "OFFICE DESK", category: "Facility & Wash" },
  { id: 15, name: "CHAIR", category: "Facility & Wash" },
];

export const BAKERY_CAKE_ROOM_ITEMS: BakeryEquipmentItem[] = [
  { id: 1, name: "PLANETARY MIXER 1", category: "Mixers & Tables" },
  { id: 2, name: "PLANETARY MIXER 2", category: "Mixers & Tables" },
  { id: 3, name: "TABLE 1", category: "Mixers & Tables" },
  { id: 4, name: "TABLE 2", category: "Mixers & Tables" },
  { id: 5, name: "TABLE 3", category: "Mixers & Tables" },
  { id: 6, name: "TABLE 4", category: "Mixers & Tables" },
  { id: 7, name: "TABLE 5", category: "Mixers & Tables" },
  { id: 8, name: "MACHINE TABLE 6", category: "Mixers & Tables" },
  { id: 9, name: "MICROWAVE 1", category: "Heating & Scales" },
  { id: 10, name: "MICROWAVE 2", category: "Heating & Scales" },
  { id: 11, name: "WEIGHING SCALE 1", category: "Heating & Scales" },
  { id: 12, name: "WEIGHING SCALE 2", category: "Heating & Scales" },
  { id: 13, name: "STORE CABINET", category: "Storage & Facility" },
  { id: 14, name: "WET - DRY DUSTBIN", category: "Storage & Facility" },
  { id: 15, name: "OFFICE DESK", category: "Storage & Facility" },
  { id: 16, name: "STOOL / CHAIR", category: "Storage & Facility" },
];


