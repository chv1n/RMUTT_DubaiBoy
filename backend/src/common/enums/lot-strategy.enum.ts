/**
 * Enum สำหรับกลยุทธ์ในการเลือก Lot/Batch
 * ใช้สำหรับการเบิกวัสดุตามเงื่อนไขต่างๆ
 */
export enum LotStrategy {
    /** First In, First Out - เบิกของที่เข้ามาก่อน (ตาม mfg_date) */
    FIFO = 'FIFO',

    /** First Expired, First Out - เบิกของที่หมดอายุก่อน (ตาม exp_date) */
    FEFO = 'FEFO',

    /** Last In, First Out - เบิกของที่เข้ามาล่าสุด */
    LIFO = 'LIFO',
}
