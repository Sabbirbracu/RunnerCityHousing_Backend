const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - be careful in production!)
  console.log("🧹 Cleaning existing data...");
  await prisma.expenses.deleteMany();
  await prisma.contributionPayments.deleteMany();
  await prisma.contributions.deleteMany();
  await prisma.payrollPayments.deleteMany();
  await prisma.payrollAdjustments.deleteMany();
  await prisma.payrollAssignments.deleteMany();
  await prisma.feePayments.deleteMany();
  await prisma.fees.deleteMany();
  await prisma.users.deleteMany();
  await prisma.plot.deleteMany();

  // Create sample plots first
  console.log("🏠 Creating sample plots...");
  const plots = [];
  const plotNumbers = [
    "A-101",
    "A-102",
    "A-103",
    "B-201",
    "B-202",
    "B-203",
    "C-301",
    "C-302",
    "C-303",
    "D-401",
    "D-402",
    "D-403",
    "E-501",
    "E-502",
    "F-601",
    "F-602",
    "G-701",
    "G-702",
    "H-801",
    "H-802",
  ];

  for (const plotNo of plotNumbers) {
    const plot = await prisma.plot.create({
      data: {
        plot_no: plotNo,
        owner_name: faker.person.fullName(),
        is_assigned: faker.datatype.boolean({ probability: 0.7 }), // 70% chance of being assigned
        assigned_to: null, // Will be updated later
      },
    });
    plots.push(plot);
  }

  console.log(`✅ Created ${plots.length} plots`);

  // Create sample users
  console.log("👥 Creating sample users...");
  const users = [];

  // Create admin user
  const adminUser = await prisma.users.create({
    data: {
      name: "Admin User",
      email: "admin@gmail.com",
      phone: "+8801234567890",
      role: "admin",
      holding_no: "H-001",
      plot_no: null, // Admin doesn't need a plot
      status: "approved",
      blood_group: "O+",
      password_hash:
        "$2b$10$oKwOUFozD68ziKi06iESHejPQ9.KVPszNNCjxxGIWV1Yi904NETNu", // In real app, hash properly
    },
  });
  users.push(adminUser);

  // Create owner user
  const ownerUser = await prisma.users.create({
    data: {
      name: "Abdus Samad",
      email: "asamadbwdb2001@gmail.com",
      phone: "+8801712973475",
      role: "owner",
      holding_no: "H-002",
      plot_no: "D-003",
      status: "approved",
      blood_group: "B+",
      password_hash:
        "$2b$10$oKwOUFozD68ziKi06iESHejPQ9.KVPszNNCjxxGIWV1Yi904NETNu",
    },
  });
  users.push(ownerUser);

  // Create staff users
  for (let i = 0; i < 3; i++) {
    const staffUser = await prisma.users.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        role: "staff",
        holding_no: faker.helpers.arrayElement(["H-003", "H-004", "H-005"]),
        plot_no: null, // Staff typically don't have plots
        status: "approved",
        blood_group: faker.helpers.arrayElement([
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ]),
        password_hash: "$2b$10$dummy.hash.for.demo.purposes",
      },
    });
    users.push(staffUser);
  }

  // Create committee members
  for (let i = 0; i < 2; i++) {
    const availablePlot = plots.find((p) => p.is_assigned === false);
    const committeeUser = await prisma.users.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        role: "committee",
        holding_no: faker.helpers.arrayElement(["H-006", "H-007"]),
        plot_no: availablePlot ? availablePlot.plot_no : null,
        status: faker.helpers.arrayElement(["approved", "pending"]),
        blood_group: faker.helpers.arrayElement([
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ]),
        password_hash: "$2b$10$dummy.hash.for.demo.purposes",
      },
    });
    users.push(committeeUser);

    // Update plot assignment if user got a plot
    if (availablePlot && committeeUser.plot_no) {
      await prisma.plot.update({
        where: { plot_no: committeeUser.plot_no },
        data: {
          is_assigned: true,
          assigned_to: committeeUser.user_id,
        },
      });
    }
  }

  // Create regular residents
  for (let i = 0; i < 12; i++) {
    const availablePlot = plots.find((p) => p.is_assigned === false);
    const residentUser = await prisma.users.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        role: "resident",
        holding_no: `H-${String(8 + i).padStart(3, "0")}`,
        plot_no: availablePlot ? availablePlot.plot_no : null,
        status: faker.helpers.arrayElement(["approved", "pending", "rejected"]),
        blood_group: faker.helpers.arrayElement([
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
          "O+",
          "O-",
        ]),
        password_hash: "$2b$10$dummy.hash.for.demo.purposes",
      },
    });
    users.push(residentUser);

    // Update plot assignment if user got a plot
    if (availablePlot && residentUser.plot_no) {
      await prisma.plot.update({
        where: { plot_no: residentUser.plot_no },
        data: {
          is_assigned: true,
          assigned_to: residentUser.user_id,
        },
      });
    }
  }

  console.log(`✅ Created ${users.length} users`);

  // Create sample fees
  console.log("💰 Creating sample fees...");
  const fees = [];
  for (const user of users.slice(2)) {
    // Skip admin and owner
    for (let month = 0; month < 6; month++) {
      const fee = await prisma.fees.create({
        data: {
          user_id: user.user_id,
          month: new Date(2024, month, 1),
          amount_due: faker.number.float({
            min: 5000,
            max: 15000,
            fractionDigits: 2,
          }),
          status: faker.helpers.arrayElement([
            "pending",
            "paid",
            "partial",
            "overdue",
          ]),
        },
      });
      fees.push(fee);
    }
  }

  console.log(`✅ Created ${fees.length} fees`);

  // Create sample fee payments
  console.log("💳 Creating sample fee payments...");
  for (const fee of fees.filter(
    (f) => f.status === "paid" || f.status === "partial"
  )) {
    await prisma.feePayments.create({
      data: {
        fee_id: fee.fee_id,
        amount_paid:
          fee.status === "partial" ? fee.amount_due * 0.5 : fee.amount_due,
        payment_date: faker.date.recent({ days: 30 }),
        payment_method: faker.helpers.arrayElement([
          "cash",
          "bkash",
          "sslcommerz",
          "bank_transfer",
        ]),
        transaction_id: faker.string.alphanumeric(10),
      },
    });
  }

  // Create payroll assignments for staff
  console.log("👷 Creating payroll assignments...");
  const staffUsers = users.filter((u) => u.role === "staff");
  const payrollAssignments = [];

  for (const staff of staffUsers) {
    const assignment = await prisma.payrollAssignments.create({
      data: {
        staff_id: staff.user_id,
        role: faker.helpers.arrayElement([
          "security",
          "maintenance",
          "cleaning",
          "gardener",
        ]),
        base_amount: faker.number.float({
          min: 15000,
          max: 35000,
          fractionDigits: 2,
        }),
        frequency: "monthly",
        start_date: new Date(2024, 0, 1),
        end_date: null,
        is_active: true,
      },
    });
    payrollAssignments.push(assignment);
  }

  console.log(`✅ Created ${payrollAssignments.length} payroll assignments`);

  // Create sample contributions
  console.log("🎯 Creating sample contributions...");
  const contributions = [];

  const contributionTypes = [
    { title: "Building Maintenance Fund", target: 500000 },
    { title: "Emergency Fund", target: 300000 },
    { title: "Festival Celebration", target: 100000 },
    { title: "Security Enhancement", target: 200000 },
  ];

  for (const type of contributionTypes) {
    const contribution = await prisma.contributions.create({
      data: {
        title: type.title,
        description: faker.lorem.sentence(),
        target_amount: type.target,
        collected_amount: faker.number.float({
          min: 0,
          max: type.target * 0.7,
          fractionDigits: 2,
        }),
        start_date: faker.date.recent({ days: 90 }),
        end_date: faker.date.future({ years: 1 }),
        status: faker.helpers.arrayElement(["ongoing", "completed"]),
      },
    });
    contributions.push(contribution);
  }

  console.log(`✅ Created ${contributions.length} contributions`);

  // Create sample expenses
  console.log("📊 Creating sample expenses...");
  for (let i = 0; i < 15; i++) {
    await prisma.expenses.create({
      data: {
        category: faker.helpers.arrayElement([
          "maintenance",
          "utilities",
          "security",
          "cleaning",
          "repairs",
        ]),
        description: faker.lorem.sentence(),
        total_amount: faker.number.float({
          min: 1000,
          max: 50000,
          fractionDigits: 2,
        }),
        paid_by: faker.helpers.arrayElement(["cash", "bkash", "sslcommerz"]),
        payment_date: faker.date.recent({ days: 60 }),
        approved_by: faker.helpers.arrayElement([
          adminUser.user_id,
          ownerUser.user_id,
        ]),
        linked_contribution_id: faker.helpers.arrayElement([
          null,
          ...contributions.map((c) => c.contribution_id),
        ]),
        receipt_path: faker.system.filePath(),
        notes: faker.lorem.sentence(),
      },
    });
  }

  console.log("✅ Created sample expenses");

  console.log("🎉 Database seeding completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   - Plots: ${plots.length}`);
  console.log(`   - Users: ${users.length}`);
  console.log(`   - Fees: ${fees.length}`);
  console.log(`   - Payroll Assignments: ${payrollAssignments.length}`);
  console.log(`   - Contributions: ${contributions.length}`);
  console.log(`   - Expenses: 15`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
