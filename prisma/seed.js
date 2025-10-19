const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding users...");

  const users = [
    {
      name: "Sabbir Ahmad",
      email: "sabbir@example.com",
      phone: "017xxxxxxxx",
      role: "admin",
      blood_group: "A+",
      password_hash: "hashedpassword1",
      holding_no: "H101",
      status: "active"
    },
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "018xxxxxxxx",
      role: "member",
      blood_group: "B+",
      password_hash: "hashedpassword2",
      holding_no: "H102",
      status: "active"
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "019xxxxxxxx",
      role: "member",
      blood_group: "O-",
      password_hash: "hashedpassword3",
      holding_no: "H103",
      status: "pending"
    }
  ];

  const plots = [
    {
      plot_no: "P101",
      owner_name: "Sabbir Ahmad",
      size: 4.5,
      is_assigned: true
    },
    {
      plot_no: "P102",
      owner_name: "John Doe",
      size: 3.2,
      is_assigned: true
    },
    {
      plot_no: "P103",
      owner_name: "Unassigned",
      size: 5.0,
      is_assigned: false
    }
  ];

  // Create plots first
  for (const plot of plots) {
    await prisma.plot.upsert({
      where: { plot_no: plot.plot_no },
      update: {},
      create: plot,
    });
  }

  // Create users and associate plots if assigned
  for (const user of users) {
    const plotToAssign = plots.find(p => p.owner_name === user.name && p.is_assigned);
    await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        plot_no: plotToAssign ? plotToAssign.plot_no : null,
      },
    });
  }

  console.log("Seeding completed!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
