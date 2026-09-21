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

