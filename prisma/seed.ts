import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}
function dayName(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return DAYS[d.getDay()];
}

const HYGIENE_AREAS = [
  "Production Room", "Oven Room", "Fridge Room", "Utility Area",
  "Puff Department", "Admin", "Store 1", "Passage Ground Floor",
  "Security Area", "Toilet Guest", "Sir Office", "Toilet",
  "Cake Room", "Passage First Floor", "Store Room 2", "Outside Compound",
];

const GLASS_LOCATIONS = [
  "Oven Room 1", "Partition Glass 4", "Production Room 1", "Window 1",
  "Production Room Door", "Puff Room Partition Glass 2 Left",
  "Puff Room Partition Glass 2 Right", "Puff Room Door",
  "Admin Door", "Admin Window 1", "Admin Window 2",
  "Main Entrance Door", "Store Room Door Ground",
  "Cake Room Window 1", "Cake Room Window 2",
];

const FRIDGE_ITEMS = [
  // Kitchen
  { zone: "Kitchen", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },

  // Fridge Room
  { zone: "Fridge Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "1", referenceTemp: "0 to +10°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "2", referenceTemp: "0 to +10°C" },
  { zone: "Fridge Room", productName: "Fridge", machineNumber: "3", referenceTemp: "0 to +10°C" },

  // Production Room
  { zone: "Production Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Production Room", productName: "Fridge", machineNumber: "1", referenceTemp: "0 to +10°C" },

  // Cake Room
  { zone: "Cake Room", productName: "Cold Room", machineNumber: "1", referenceTemp: "0 to +10°C" },
  { zone: "Cake Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Cake Room", productName: "Freezer", machineNumber: "2", referenceTemp: "-1 to -18°C" },

  // Store Room
  { zone: "Store Room", productName: "Freezer", machineNumber: "1", referenceTemp: "-1 to -18°C" },
  { zone: "Store Room", productName: "Chiller Blaster", machineNumber: "1", referenceTemp: "—" },
];

const KITCHEN_EQUIPMENT = [
  "Rack Oven", "New Rack Oven", "Deck Oven", "Electric Gas Range 1", "Electric Gas Range 2",
  "3 Gas Burner", "1 Gas Burner",
  "Kitchen Work Table 1", "Kitchen Work Table 2", "Kitchen Work Table 3",
  "Kitchen Work Table 4", "Kitchen Work Table 5", "Kitchen Work Table 6", "Kitchen Work Table 7",
  "Wet - Dry Dustbin", "Mixer Grinder", "Masala Grinder", "Kheema Machine",
  "Proofer", "Tandoor", "Sink 1", "Chiller Blaster", "Weighing Scale",
];

const PRODUCTION_EQUIPMENT = [
  "PR Working Table 1", "PR Working Table 2", "PR Working Table 3", "PR Working Table 4",
  "PR Working Table 5", "PR Working Table 6", "PR Working Table 7", "PR Working Table 8", "PR Working Table 9",
  "Dough Kneader", "Spiral Mixer", "Planetary Mixer 1", "Planetary Mixer 2",
  "Planetary Mixer 3", "Planetary Mixer 4", "Planetary Mixer 5", "Planetary Mixer 6",
  "Bread Slicer 1 / Table", "Bread Slicer 2 / Table", "Bread Bun Divider",
  "Weighing Scale 1 / Table", "Weighing Scale 2 / Table", "Sealing Machine 1",
  "Sealing Machine 2", "Sealing Machine 3", "Wash Sink 1", "Wash Sink 2", "Flour Bin 1", "Flour Bin 2", "Flour Bin 3",
  "Wet - Dry Dustbin",
  "Trollies (1-10)",
];

const PUFF_EQUIPMENT = [
  "Dough Sheeter", "Table 1", "Table 2", "Table 3", "Table 4",
  "Wash Sink 1", "Wet - Dry Dustbin", "Office Desk", "Chair",
];

const STORE_ROOM_EQUIPMENT = [
  "Store Room 1", "Store Room 2", "Racks", "Cupboard 1", "Cupboard 2", "Lift",
];

const CAKE_EQUIPMENT = [
  "Planetary Mixer 1", "Planetary Mixer 2", "Table 1", "Table 2",
  "Table 3", "Table 4", "Table 5", "Machine Table 6",
  "Microwave 1", "Microwave 2", "Weighing Scale",
  "Store Cabinet", "Wet - Dry Dustbin", "Office Desk", "Stool / Chair",
];

const DUCT_ITEMS = [
  "Duct Kitchen 1", "Duct Kitchen 2", "Duct Kitchen 3",
  "Oven Duct 1", "Oven Duct 2", "Oven Duct 3",
  "Production Central Duct",
];

const WET_UTILITY_ITEMS = [
  "Sink", "Work Table 1", "Work Table 2", "Mori",
];

const ORETA_HYGIENE_AREAS = [
  { id: 1, area: "Kitchen", morning: "Rameshwar / Bharti", afternoon: "Rameshwar / Bharti", evening: "Rameshwar / Bharti", night: "Rameshwar / Bharti" },
  { id: 2, area: "Wash Room", morning: "—", afternoon: "Mangla / Bharti", evening: "Mangla / Bharti", night: "Mangla / Bharti" },
  { id: 3, area: "Outdoor Cleaning", morning: "Mangla / Bharti", afternoon: "Mangla / Bharti", evening: "Mangla / Bharti", night: "Mangla / Bharti" },
  { id: 4, area: "Inside Top / Ground Cleaning", morning: "Mangla / Bharti", afternoon: "Mangla / Bharti", evening: "Mangla / Bharti", night: "Mangla / Bharti" },
  { id: 5, area: "Cash Counter", morning: "Arzaaan / New", afternoon: "Arzaaan / New", evening: "Arzaaan / New", night: "Arzaaan / New" },
  { id: 6, area: "Display Counters", morning: "Arzaaan / New", afternoon: "Arzaaan / New", evening: "Arzaaan / New", night: "Arzaaan / New" },
  { id: 7, area: "Freezer", morning: "Arzaaan / New", afternoon: "Arzaaan / New", evening: "Arzaaan / New", night: "Arzaaan / New" },
  { id: 8, area: "Racks", morning: "Arzaaan / New", afternoon: "Arzaaan / New", evening: "Arzaaan / New", night: "Arzaaan / New" },
  { id: 9, area: "Store", morning: "Arzaaan / New", afternoon: "Arzaaan / New", evening: "Arzaaan / New", night: "Arzaaan / New" },
  { id: 10, area: "Dusting", morning: "Bharti / Mangla", afternoon: "Bharti / Mangla", evening: "Bharti / Mangla", night: "Bharti / Mangla" },
  { id: 11, area: "Tables / Chairs", morning: "Bharti / Rameshwar", afternoon: "Bharti / Rameshwar", evening: "Bharti / Rameshwar", night: "Bharti / Rameshwar" },
  { id: 12, area: "Washing Vessels", morning: "Bharti - Rameshwar", afternoon: "Bharti - Rameshwar", evening: "Bharti - Rameshwar", night: "Bharti - Rameshwar" },
];

async function main() {
  console.log("🌱 Seeding PNR Bakery & Oreta World Staff and Demo Reports...");

  const defaultPassword = await bcrypt.hash("Pnr@123", 12);
  const adminPassword = await bcrypt.hash("Admin@123", 12);

  // 1. Administrators / Bakery Supervisors
  const admin = await prisma.user.upsert({
    where: { email: "admin@pnr.com" },
    update: { outletId: "all" },
    create: { name: "Admin", email: "admin@pnr.com", passwordHash: adminPassword, role: "ADMIN", outletId: "all" },
  });

  const aboli = await prisma.user.upsert({
    where: { email: "aboli@pnr.com" },
    update: { outletId: "bakery" },
    create: { name: "Aboli Wagh", email: "aboli@pnr.com", passwordHash: defaultPassword, role: "SUPERVISOR", outletId: "bakery" },
  });

  const sandeep = await prisma.user.upsert({
    where: { email: "sandeep@pnr.com" },
    update: { outletId: "bakery" },
    create: { name: "Sandeep Gargate", email: "sandeep@pnr.com", passwordHash: defaultPassword, role: "SUPERVISOR", outletId: "bakery" },
  });

  // 2. Employees / Staff across Outlets
  const staffList = [
    // Bakery Staff
    { name: "Shridhar Jadhav", email: "shridhar@pnr.com", outletId: "bakery", sheets: ["HYGIENE_REPORT"] },
    { name: "Pravin Jadhav", email: "pravin@pnr.com", outletId: "bakery", sheets: ["HYGIENE_REPORT", "PRODUCTION", "KITCHEN", "DUCT", "WET_UTILITY", "STORE_ROOM"] },
    { name: "Mavshi", email: "mavshi@pnr.com", outletId: "bakery,rns-world,symphony-world", sheets: ["HYGIENE_REPORT", "GLASS_REPORT", "FRIDGE_REPORT", "PRODUCTION", "KITCHEN", "DUCT", "WET_UTILITY", "STORE_ROOM", "RNS_EQUIPMENT", "SYMPHONY_EQUIPMENT"] },
    { name: "Sanjay Jadhav", email: "sanjay@pnr.com", outletId: "bakery", sheets: ["GLASS_REPORT"] },
    { name: "Suresh", email: "suresh@pnr.com", outletId: "bakery", sheets: ["GLASS_REPORT", "KITCHEN"] },
    { name: "Sagar Yadav", email: "sagar@pnr.com", outletId: "bakery", sheets: ["PRODUCTION", "KITCHEN"] },
    { name: "Dilip", email: "dilip@pnr.com", outletId: "bakery", sheets: ["PUFF_ROOM"] },
    { name: "Meraj Khan", email: "meraj@pnr.com", outletId: "bakery", sheets: ["CAKE_ROOM"] },
    { name: "Jaseen Siddique", email: "jaseen@pnr.com", outletId: "bakery", sheets: ["CAKE_ROOM"] },
    { name: "Nadeem Faruqi", email: "nadeem@pnr.com", outletId: "bakery", sheets: ["CAKE_ROOM"] },
    // Oreta World Staff
    { name: "Rameshwar", email: "rameshwar@pnr.com", outletId: "oreta-world", sheets: ["ORETA_SHOP_CLEANING", "ORETA_EQUIPMENT", "ORETA_FRIDGE", "ORETA_GLASS", "ORETA_MONTHLY", "ORETA_FOOD"] },
    { name: "Bharti", email: "bharti@pnr.com", outletId: "oreta-world", sheets: ["ORETA_SHOP_CLEANING", "ORETA_EQUIPMENT", "ORETA_FRIDGE", "ORETA_GLASS", "ORETA_MONTHLY", "ORETA_FOOD"] },
    { name: "Mangla", email: "mangla@pnr.com", outletId: "oreta-world", sheets: ["ORETA_SHOP_CLEANING", "ORETA_EQUIPMENT", "ORETA_FRIDGE", "ORETA_GLASS", "ORETA_MONTHLY", "ORETA_FOOD"] },
    { name: "Arzaaan", email: "arzaaan@pnr.com", outletId: "oreta-world", sheets: ["ORETA_SHOP_CLEANING", "ORETA_EQUIPMENT", "ORETA_FRIDGE", "ORETA_GLASS", "ORETA_MONTHLY", "ORETA_FOOD"] },
    // RNS World Staff
    { name: "Madhavi", email: "madhavi@pnr.com", outletId: "rns-world", sheets: ["RNS_EQUIPMENT"] },
    { name: "Ashok", email: "ashok@pnr.com", outletId: "rns-world", sheets: ["RNS_EQUIPMENT"] },
    { name: "Nisha", email: "nisha@pnr.com", outletId: "rns-world", sheets: ["RNS_EQUIPMENT"] },
    { name: "Sachin", email: "sachin@pnr.com", outletId: "rns-world", sheets: ["RNS_EQUIPMENT"] },
    { name: "Navin", email: "navin@pnr.com", outletId: "rns-world", sheets: ["RNS_EQUIPMENT"] },
    // Symphony World Staff
    { name: "Kamran", email: "kamran@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Bapu", email: "bapu@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Someshwar", email: "someshwar@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Deva", email: "deva@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Shagir", email: "shagir@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Gaurav", email: "gaurav@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "Rahul", email: "rahul@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
    { name: "HK", email: "hk@pnr.com", outletId: "symphony-world", sheets: ["SYMPHONY_EQUIPMENT"] },
  ];

  const createdStaff: Record<string, string> = {};

  for (const s of staffList) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, outletId: s.outletId || "bakery" },
      create: { name: s.name, email: s.email, passwordHash: defaultPassword, role: "EMPLOYEE", outletId: s.outletId || "bakery" },
    });
    createdStaff[s.name] = user.id;

    for (const sheet of s.sheets) {
      await prisma.sheetAccess.upsert({
        where: { userId_sheet: { userId: user.id, sheet } },
        update: {},
        create: { userId: user.id, sheet },
      });
    }
  }

  console.log("✅ All Bakery & Oreta World Staff Created with Sheet Access!");

  // Clean previous demo entries
  await prisma.hygieneEntry.deleteMany({});
  await prisma.glassEntry.deleteMany({});
  await prisma.fridgeEntry.deleteMany({});
  await prisma.kitchenEntry.deleteMany({});
  await prisma.productionEntry.deleteMany({});
  await prisma.puffRoomEntry.deleteMany({});
  await prisma.cakeRoomEntry.deleteMany({});
  await prisma.oretaHygieneEntry.deleteMany({});

  // Seed 7 days of realistic historical demo data
  for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
    const date = dateStr(daysAgo);
    const day = dayName(daysAgo);
    const supervisor = daysAgo % 2 === 0 ? "Aboli Wagh" : "Sandeep Gargate";

    // 1. Hygiene (Shridhar Jadhav & Pravin Jadhav)
    await prisma.hygieneEntry.create({
      data: {
        date, day,
        areaChecks: JSON.stringify(
          HYGIENE_AREAS.map((area, i) => ({
            area,
            checkedBy: i % 3 === 0 ? "Mavshi" : i % 2 === 0 ? "Pravin Jadhav" : "Shridhar Jadhav",
            time: "09:15",
          }))
        ),
        supervisorName: supervisor,
        comments: "All areas clean and sanitized.",
        correctiveAction: "No action needed.",
        submittedById: createdStaff["Shridhar Jadhav"] || admin.id,
        createdAt: new Date(`${date}T09:15:00.000Z`),
      },
    });

    // 2. Glass (Sanjay Jadhav & Suresh)
    await prisma.glassEntry.create({
      data: {
        date,
        locationChecks: JSON.stringify(
          GLASS_LOCATIONS.map((location, i) => ({
            location,
            name: i % 2 === 0 ? "Sanjay Jadhav" : "Suresh",
          }))
        ),
        supervisorName: supervisor,
        comments: "Glass and partitions wiped clean.",
        correctiveAction: "",
        submittedById: createdStaff["Sanjay Jadhav"] || admin.id,
        createdAt: new Date(`${date}T10:00:00.000Z`),
      },
    });

    // 3. Fridge (Aboli Wagh / Sandeep Gargate)
    await prisma.fridgeEntry.create({
      data: {
        date,
        supervisedBy: supervisor,
        fridgeChecks: JSON.stringify(
          FRIDGE_ITEMS.map((item, idx) => {
            const isNA = idx === 3 || idx === 4 || idx === 8;
            return {
              ...item,
              actualTempMorning: isNA ? "N/A" : item.zone.includes("FREEZER") ? "-17.5°C" : "+4.2°C",
              actualTempEvening: isNA ? "N/A" : item.zone.includes("FREEZER") ? "-18.0°C" : "+5.0°C",
            };
          })
        ),
        hygiene: "Good",
        comments: "3 main fridges running normal; standby extra fridges powered down (N/A).",
        correctiveAction: "",
        submittedById: aboli.id,
        createdAt: new Date(`${date}T08:30:00.000Z`),
      },
    });

    // 4. Kitchen (Sagar Yadav, Pravin Jadhav, Mavshi)
    await prisma.kitchenEntry.create({
      data: {
        date,
        equipmentChecks: JSON.stringify(
          KITCHEN_EQUIPMENT.map((equipment, i) => ({
            equipment,
            yesNo: "YES",
            time: "11:00",
            name: i % 3 === 0 ? "Mavshi" : i % 2 === 0 ? "Pravin Jadhav" : "Sagar Yadav",
          }))
        ),
        supervisorName: supervisor,
        workerName: "Sagar Yadav",
        comments: "Kitchen equipment washed and checked.",
        correctiveAction: "",
        submittedById: createdStaff["Sagar Yadav"] || admin.id,
        createdAt: new Date(`${date}T11:00:00.000Z`),
      },
    });

    // 5. Production (Sagar Yadav, Pravin Jadhav, Mavshi)
    await prisma.productionEntry.create({
      data: {
        date,
        equipmentChecks: JSON.stringify(
          PRODUCTION_EQUIPMENT.map((equipment, i) => ({
            equipment,
            yesNo: "YES",
            time: "12:00",
            name: i % 3 === 0 ? "Mavshi" : i % 2 === 0 ? "Pravin Jadhav" : "Sagar Yadav",
          }))
        ),
        supervisorName: supervisor,
        workerName: "Pravin Jadhav",
        comments: "Mixers and tables sanitized.",
        correctiveAction: "",
        submittedById: createdStaff["Pravin Jadhav"] || admin.id,
        createdAt: new Date(`${date}T12:00:00.000Z`),
      },
    });

    // 6. Puff Room (Dilip & Sandeep Gargate)
    await prisma.puffRoomEntry.create({
      data: {
        date,
        equipmentChecks: JSON.stringify(
          PUFF_EQUIPMENT.map((equipment, i) => ({
            equipment,
            yesNo: "YES",
            time: "13:30",
            name: i % 2 === 0 ? "Dilip" : "Sandeep Gargate",
          }))
        ),
        supervisorName: "Sandeep Gargate",
        workerName: "Dilip",
        comments: "Sheeter and tables cleaned.",
        correctiveAction: "",
        submittedById: createdStaff["Dilip"] || admin.id,
        createdAt: new Date(`${date}T13:30:00.000Z`),
      },
    });

    // 7. Cake Room (Meraj Khan, Jaseen Siddique, Nadeem Faruqi)
    await prisma.cakeRoomEntry.create({
      data: {
        date,
        equipmentChecks: JSON.stringify(
          CAKE_EQUIPMENT.map((equipment, i) => ({
            equipment,
            yesNo: "YES",
            time: "14:00",
            name: i % 3 === 0 ? "Meraj Khan" : i % 2 === 0 ? "Jaseen Siddique" : "Nadeem Faruqi",
          }))
        ),
        supervisorName: "Aboli Wagh",
        workerName: "Meraj Khan",
        comments: "Planetary mixers and cold tables ready.",
        correctiveAction: "",
        submittedById: createdStaff["Meraj Khan"] || admin.id,
        createdAt: new Date(`${date}T14:00:00.000Z`),
      },
    });

    // 8. Oreta World Hygiene SOP (Rameshwar, Bharti, Mangla, Arzaaan)
    await prisma.oretaHygieneEntry.create({
      data: {
        date,
        day,
        areaChecks: JSON.stringify(
          ORETA_HYGIENE_AREAS.map((item) => ({
            id: item.id,
            area: item.area,
            morning: {
              status: item.morning === "—" ? "N/A" : "YES",
              staff: item.morning === "—" ? "—" : item.morning,
              time: "09:00",
            },
            afternoon: {
              status: "YES",
              staff: item.afternoon,
              time: "14:00",
            },
            evening: {
              status: "YES",
              staff: item.evening,
              time: "18:30",
            },
            night: {
              status: "YES",
              staff: item.night,
              time: "22:00",
            },
          }))
        ),
        supervisorName: "Admin",
        comments: "All 4 shifts completed at Oreta World outlet.",
        correctiveAction: "",
        submittedById: createdStaff["Rameshwar"] || admin.id,
        createdAt: new Date(`${date}T22:15:00.000Z`),
      },
    });

    console.log(`✅ Seeded historical reports for ${date} (${day}) across Bakery & Oreta World`);
  }

  console.log("\n📋 Login Credentials for Staff & Supervisors:");
  console.log("   Admin:       admin@pnr.com    / Admin@123");
  console.log("   Supervisor:  aboli@pnr.com    / Pnr@123  (Aboli Wagh)");
  console.log("   Supervisor:  sandeep@pnr.com  / Pnr@123  (Sandeep Gargate)");
  console.log("   Bakery:      shridhar@pnr.com / Pnr@123  (Shridhar Jadhav)");
  console.log("   Bakery:      pravin@pnr.com   / Pnr@123  (Pravin Jadhav)");
  console.log("   Bakery:      sagar@pnr.com    / Pnr@123  (Sagar Yadav)");
  console.log("   Bakery:      dilip@pnr.com    / Pnr@123  (Dilip)");
  console.log("   Bakery:      meraj@pnr.com    / Pnr@123  (Meraj Khan)");
  console.log("   Oreta World: rameshwar@pnr.com / Pnr@123 (Rameshwar)");
  console.log("   Oreta World: bharti@pnr.com    / Pnr@123 (Bharti)");
  console.log("   Oreta World: mangla@pnr.com    / Pnr@123 (Mangla)");
  console.log("   Oreta World: arzaaan@pnr.com   / Pnr@123 (Arzaaan)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
