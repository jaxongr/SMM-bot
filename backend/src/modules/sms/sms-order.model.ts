// Add to schema.prisma:
// model SmsOrder {
//   id          String   @id @default(cuid())
//   userId      String
//   user        User     @relation(fields: [userId], references: [id])
//   service     String
//   country     String
//   phone       String?
//   smsCode     String?
//   status      String   @default("WAITING")
//   price       Decimal  @db.Decimal(12, 2)
//   providerId  String?
//   providerOrderId String?
//   expiresAt   DateTime?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   @@index([userId])
//   @@index([status])
// }
