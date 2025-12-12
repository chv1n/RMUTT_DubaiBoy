/**
 * Enum สำหรับประเภทของ Inventory Transaction
 * ใช้เพื่อกำหนดประเภทการเคลื่อนไหวของสินค้าคงคลัง
 */
export enum TransactionType {
    /** รับเข้าวัสดุ - Goods Receipt */
    IN = 'IN',

    /** เบิก/จ่ายวัสดุ - Goods Issue */
    OUT = 'OUT',

    /** โอนย้ายออก - Transfer Out (ใช้คู่กับ TRANSFER_IN) */
    TRANSFER_OUT = 'TRANSFER_OUT',

    /** โอนย้ายเข้า - Transfer In (ใช้คู่กับ TRANSFER_OUT) */
    TRANSFER_IN = 'TRANSFER_IN',

    /** ปรับปรุงยอดเพิ่ม - Adjustment (เพิ่มยอด) */
    ADJUSTMENT_IN = 'ADJUSTMENT_IN',

    /** ปรับปรุงยอดลด - Adjustment (ลดยอด) */
    ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
}

/**
 * ประเภทที่เพิ่มยอดคงคลัง
 */
export const INCREASE_TYPES = [
    TransactionType.IN,
    TransactionType.TRANSFER_IN,
    TransactionType.ADJUSTMENT_IN,
];

/**
 * ประเภทที่ลดยอดคงคลัง
 */
export const DECREASE_TYPES = [
    TransactionType.OUT,
    TransactionType.TRANSFER_OUT,
    TransactionType.ADJUSTMENT_OUT,
];
