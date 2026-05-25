const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create Admin Account
  const adminPassword = await bcrypt.hash("L0veAllah/", 10);
  const admin = await prisma.users.upsert({
    where: { email: "sabbirahmad653@gmail.com" },
    update: {},
    create: {
      name: "Sabbir Ahmad",
      email: "sabbirahmad653@gmail.com",
      phone: "01304867542",
      role: "admin",
      status: "approved",
      password_hash: adminPassword,
    },
  });
  console.log(`✅ Admin created: ${admin.name} (${admin.email})`);

  // 2. Create Plots
  const plots = [];

  // A Block: A-1 to A-21
  for (let i = 1; i <= 21; i++) {
    plots.push({ plot_no: `A-${i}`, plot_type: "single_unit" });
  }

  // B Block: B-1 to B-36
  for (let i = 1; i <= 36; i++) {
    plots.push({ plot_no: `B-${i}`, plot_type: "single_unit" });
  }

  // C Block: C-1 to C-26
  for (let i = 1; i <= 26; i++) {
    plots.push({ plot_no: `C-${i}`, plot_type: "single_unit" });
  }

  // D Block: D-1 to D-11
  for (let i = 1; i <= 11; i++) {
    plots.push({ plot_no: `D-${i}`, plot_type: "single_unit" });
  }

  // E Block: E-1 to E-20
  for (let i = 1; i <= 20; i++) {
    plots.push({ plot_no: `E-${i}`, plot_type: "single_unit" });
  }

  // F Block: F-1 to F-35
  for (let i = 1; i <= 35; i++) {
    plots.push({ plot_no: `F-${i}`, plot_type: "single_unit" });
  }

  // Railway space (govt): C-01 to C-010
  for (let i = 1; i <= 10; i++) {
    const plotNo = `C-0${i}`;
    plots.push({ plot_no: plotNo, plot_type: "single_unit" });
  }

  // Insert plots (skip if already exists)
  let created = 0;
  let skipped = 0;
  for (const plot of plots) {
    try {
      await prisma.plot.upsert({
        where: { plot_no: plot.plot_no },
        update: {},
        create: plot,
      });
      created++;
    } catch (err) {
      skipped++;
    }
  }

  console.log(`✅ Plots: ${created} created, ${skipped} skipped (already exist)`);
  console.log(`   A Block: A-1 to A-21 (21 plots)`);
  console.log(`   B Block: B-1 to B-36 (36 plots)`);
  console.log(`   C Block: C-1 to C-26 (26 plots)`);
  console.log(`   D Block: D-1 to D-11 (11 plots)`);
  console.log(`   E Block: E-1 to E-20 (20 plots)`);
  console.log(`   F Block: F-1 to F-35 (35 plots)`);
  console.log(`   Railway (Govt): C-01 to C-010 (10 plots)`);
  console.log(`   Total: ${plots.length} plots`);

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
