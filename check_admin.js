const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  const u = await p.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  console.log("id:", u?.id);
  console.log("username:", u?.username);
  console.log("role:", u?.role);
  console.log("has_password:", u?.password ? "YES" : "NO");
  await p.$disconnect();
}
main().catch(console.error);
