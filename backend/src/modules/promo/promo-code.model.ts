// Add to schema.prisma:
// model PromoCode {
//   id          String   @id @default(cuid())
//   code        String   @unique
//   type        String   // BALANCE_BONUS, DISCOUNT_PERCENT, DISCOUNT_FIXED
//   value       Decimal  @db.Decimal(12, 2)
//   maxUsages   Int?
//   usedCount   Int      @default(0)
//   isActive    Boolean  @default(true)
//   description String?
//   expiresAt   DateTime?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   usages      PromoUsage[]
//   @@index([code])
//   @@index([isActive])
// }
//
// model PromoUsage {
//   id        String    @id @default(cuid())
//   promoId   String
//   promo     PromoCode @relation(fields: [promoId], references: [id])
//   userId    String
//   amount    Decimal   @db.Decimal(12, 2)
//   createdAt DateTime  @default(now())
//   @@unique([promoId, userId])
//   @@index([userId])
// }
