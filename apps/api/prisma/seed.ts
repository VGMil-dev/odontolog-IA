import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const BCRYPT_SALT = 12;
  const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_SALT);

  console.log('Seeding users...');

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@odontocare.com' },
    update: {},
    create: {
      email: 'superadmin@odontocare.com',
      passwordHash: await hashPassword('odontocare2026'),
      role: Role.SUPER_ADMIN,
    },
  });

  const clinicAdmin = await prisma.user.upsert({
    where: { email: 'admin@clinica1.com' },
    update: {},
    create: {
      email: 'admin@clinica1.com',
      passwordHash: await hashPassword('clinica2026'),
      role: Role.CLINIC_ADMIN,
      clinicId: null,
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@clinica1.com' },
    update: {},
    create: {
      email: 'doctor@clinica1.com',
      passwordHash: await hashPassword('doctor2026'),
      role: Role.DOCTOR,
      clinicId: null,
    },
  });

  console.log('Seeding complete!');
  console.log({ superAdmin, clinicAdmin, doctor });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });