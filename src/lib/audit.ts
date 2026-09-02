import db from "./db";

export async function createAuditLog({
  adminEmail,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
  ipAddress,
}: {
  adminEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}) {
  try {
    await db.auditLog.create({
      data: {
        adminEmail,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("Falha ao registrar log de auditoria:", error);
  }
}
