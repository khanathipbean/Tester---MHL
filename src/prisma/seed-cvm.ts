import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

interface TestCaseData {
    key: string;
    condition: string;
    testSteps: string;
    expectedResult: string;
    priority: string;
    status: string;
    notes: string;
    clarificationRequired: boolean;
    inProgress: boolean;
    tested: boolean;
}

const testCases: TestCaseData[] = [
    // Load Page
    { key: "CVM_DT_01", condition: "ผู้ใช้มีสิทธิ์เข้าถึงเมนู Cost Variance", testSteps: "1) เปิดเมนู Cost Variance\n2) ตรวจสอบการโหลดหน้า", expectedResult: "ระบบต้องโหลดหน้า Cost Variance Management ได้สำเร็จ", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    // Title
    { key: "CVM_DT_02", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบข้อความ Title บนหน้า", expectedResult: "ระบบต้องแสดง Title เป็น \"Cost variance management\" โดยมีตัวอักษรตัวแรกเป็นตัวพิมพ์ใหญ่ และตัวอักษรถัดไปเป็นตัวพิมพ์เล็ก", priority: "LOW", status: "FAIL", notes: "ระบบแสดง Title เป็น \"Cost Variance Management\"", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_03", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบข้อความ Description ใต้ Title", expectedResult: "ระบบต้องแสดง Description ด้วยรูปแบบข้อความมาตรฐาน และสอดคล้องกับรูปแบบ Design ของระบบ", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    // Filter
    { key: "CVM_DT_04", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Search Filter", expectedResult: "ระบบต้องแสดงช่อง Search", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_05", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบ Placeholder ของ Search Filter", expectedResult: "ระบบต้องแสดง Placeholder ถูกต้อง", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_06", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Filter Period", expectedResult: "ระบบต้องแสดง Filter \"Period\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_07", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบค่า Default ของ Filter Period", expectedResult: "ระบบต้องแสดงค่า Default ถูกต้อง", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_08", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Dropdown Customer group", expectedResult: "ระบบต้องแสดง Dropdown \"Customer group\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_09", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบค่า Default ของ Dropdown Customer group", expectedResult: "ระบบต้องแสดงค่า Default \"All\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_10", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Dropdown Variance Status", expectedResult: "ระบบต้องแสดง Dropdown \"Variance Status\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_11", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบค่า Default ของ Dropdown Variance Status", expectedResult: "ระบบต้องแสดงค่า Default \"All\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_12", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Dropdown FG Status", expectedResult: "ระบบต้องแสดง Dropdown \"FG Status\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_13", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบค่า Default ของ Dropdown FG Status", expectedResult: "ระบบต้องแสดงค่า Default \"All\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_14", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบ Font-size ของ Label Filter", expectedResult: "ระบบต้องแสดง Font-size ของ Label Filter ถูกต้องและสม่ำเสมอตาม Design System", priority: "LOW", status: "FAIL", notes: "Label Filter \"Period\" มีขนาด Font-size เล็กกว่า Label Filter อื่น ๆ", clarificationRequired: false, inProgress: false, tested: true },
    // Clear Filter
    { key: "CVM_DT_15", condition: "มีการกรอกข้อมูลในช่อง Search", testSteps: "1) กดปุ่ม Clear Filter", expectedResult: "ระบบต้องล้างข้อความในช่อง Search", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_16", condition: "มีการเลือกค่า Customer group", testSteps: "1) กดปุ่ม Clear Filter", expectedResult: "ระบบต้องแสดงค่า Default \"All\" ของ Dropdown Customer group", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_17", condition: "มีการเลือกค่า Variance Status", testSteps: "1) กดปุ่ม Clear Filter", expectedResult: "ระบบต้องแสดงค่า Default \"All\" ของ Dropdown Variance Status", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_18", condition: "มีการเลือกค่า FG Status", testSteps: "1) กดปุ่ม Clear Filter", expectedResult: "ระบบต้องแสดงค่า Default \"All\" ของ Dropdown FG Status", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_19", condition: "มีการเลือกค่า Period", testSteps: "1) กดปุ่ม Clear Filter", expectedResult: "ระบบต้องแสดงค่า Default ของ Filter Period ตามที่ระบบกำหนด", priority: "LOW", status: "FAIL", notes: "ระบบไม่ล้างค่า Filter Period หลังกด Clear Filter", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_20", condition: "มีการใช้งาน Filter อย่างน้อย 1 รายการ", testSteps: "1) กดปุ่ม Clear Filter\n2) ตรวจสอบข้อมูลบนหน้า", expectedResult: "ระบบต้องแสดงข้อมูลทั้งหมดตามค่า Default ของระบบ", priority: "LOW", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    // Overall Threshold
    { key: "CVM_DT_21", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) กดปุ่ม Overall Threshold Settings", expectedResult: "ระบบต้องแสดง Popup \"Notification Threshold Settings\"", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_22", condition: "เปิด Popup Notification Threshold Settings สำเร็จ", testSteps: "1) ตรวจสอบ Default Tab", expectedResult: "ระบบต้องแสดง Tab \"Overall variance\" เป็นค่า Default เมื่อเปิด Popup", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_23", condition: "เปิด Popup Notification Threshold Settings สำเร็จ", testSteps: "1) ตรวจสอบ Tab Cost breakdown", expectedResult: "ระบบต้องแสดง Tab \"Cost breakdown\" สำหรับกำหนด Threshold แยกตาม Cost component", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_24", condition: "เปิด Tab Overall variance สำเร็จ", testSteps: "1) กรอกค่า Standard cost (%) ของระดับ Normal และ Warning", expectedResult: "ระบบต้องให้ผู้ใช้กำหนดค่า Standard cost (%) สำหรับระดับ Normal และ Warning ได้", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_25", condition: "มีการกำหนดค่า Threshold", testSteps: "1) ตรวจสอบระดับ Critical", expectedResult: "ระบบต้องคำนวณค่า Critical อัตโนมัติจาก Threshold ที่กำหนด", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_26", condition: "มีการแก้ไขค่า Threshold", testSteps: "1) กดปุ่ม Confirm", expectedResult: "ระบบต้องบันทึกค่า Threshold ระดับองค์กรสำเร็จ", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_27", condition: "มี Customer ที่ไม่ได้กำหนด Threshold เฉพาะ", testSteps: "1) ตรวจสอบการใช้งาน Threshold ระดับองค์กร", expectedResult: "ระบบต้องใช้ค่า Threshold ระดับองค์กรกับทุก Customer ที่ไม่มีการตั้งค่า Threshold ของตัวเอง", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_28", condition: "มี Customer ที่กำหนด Threshold เฉพาะ", testSteps: "1) ตรวจสอบการ Override Threshold", expectedResult: "ระบบต้องใช้ค่า Threshold ของ Customer ก่อนค่า Threshold ระดับองค์กร", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_29", condition: "มีการกำหนด Threshold ระดับองค์กร", testSteps: "1) ตรวจสอบการคำนวณ % FG", expectedResult: "ระบบต้องคำนวณเปอร์เซ็นต์ของ FG ตามค่า Threshold ระดับองค์กรที่กำหนด", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_30", condition: "มีข้อมูล FG ในระบบ", testSteps: "1) ตรวจสอบการแสดงผล Status ของ FG", expectedResult: "ระบบต้องแสดง Status ตามค่า Threshold ที่คำนวณได้", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_31", condition: "มีการแก้ไข Threshold สำเร็จ", testSteps: "1) ตรวจสอบข้อมูลหลังบันทึก", expectedResult: "ระบบต้องอัปเดตผลการคำนวณและ Status ของ FG ใหม่หลังบันทึก Threshold สำเร็จ", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_32", condition: "มีข้อมูล Variance ในระบบ", testSteps: "1) ตรวจสอบการคำนวณ Variance", expectedResult: "ระบบต้องคำนวณ Variance และจัดกลุ่มสถานะตาม Threshold ที่กำหนดอย่างถูกต้อง", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_33", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) ตรวจสอบหัวข้อ Material", expectedResult: "ระบบต้องแสดงช่องกำหนด Threshold สำหรับ Material", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_34", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) ตรวจสอบหัวข้อ Press", expectedResult: "ระบบต้องแสดงช่องกำหนด Threshold สำหรับ Press", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_35", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) ตรวจสอบหัวข้อ Assembly", expectedResult: "ระบบต้องแสดงช่องกำหนด Threshold สำหรับ Assembly", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_36", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) ตรวจสอบหัวข้อ Overhead", expectedResult: "ระบบต้องแสดงช่องกำหนด Threshold สำหรับ Overhead", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_37", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กรอกค่า Threshold ระดับ Normal", expectedResult: "ระบบต้องให้ผู้ใช้กำหนดค่า Threshold ของแต่ละ Cost component ได้", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_38", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กรอกค่า Threshold ระดับ Warning", expectedResult: "ระบบต้องให้ผู้ใช้กำหนดค่า Threshold ของแต่ละ Cost component ได้", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_39", condition: "มีการกำหนดค่า Threshold ใน Cost breakdown", testSteps: "1) ตรวจสอบระดับ Critical", expectedResult: "ระบบต้องกำหนดค่า Critical อัตโนมัติเมื่อค่าเกิน Threshold ของ Warning", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_40", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กรอกค่าติดลบในช่อง Threshold", expectedResult: "ระบบต้องไม่อนุญาตให้กรอกค่าติดลบ", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_41", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กำหนดค่า Warning น้อยกว่าหรือเท่ากับค่า Normal", expectedResult: "ระบบต้องไม่อนุญาตให้ค่า Warning น้อยกว่าหรือเท่ากับค่า Normal", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_42", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กรอกค่า \"-\" ในช่อง Threshold", expectedResult: "ระบบต้องอนุญาตให้กรอกเฉพาะ Number", priority: "MEDIUM", status: "FAIL", notes: "ระบบสามารถกรอก \"-\" ได้", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_43", condition: "มีการแก้ไขค่า Threshold ใน Cost breakdown", testSteps: "1) กดปุ่ม Confirm", expectedResult: "ระบบต้องบันทึกค่า Threshold แยกตาม Cost component ได้สำเร็จ", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_44", condition: "มีการบันทึกค่า Threshold สำเร็จ", testSteps: "1) ตรวจสอบผลการคำนวณ", expectedResult: "ระบบต้องคำนวณและแสดงผล Status ใหม่ตามค่า Threshold ล่าสุด", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_45", condition: "มี Customer ที่ไม่มี Threshold เฉพาะ", testSteps: "1) ตรวจสอบการใช้งาน Threshold ระดับองค์กร", expectedResult: "ระบบต้องใช้ค่า Threshold ระดับองค์กรในการคำนวณ", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_46", condition: "เปิด Tab Cost breakdown สำเร็จ", testSteps: "1) กดปุ่ม Confirm", expectedResult: "ระบบต้องบันทึกข้อมูลและปิด Popup สำเร็จ", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_47", condition: "มีการกรอกข้อมูลในแต่ละ Tab", testSteps: "1) สลับ Tab ระหว่าง Overall variance และ Cost breakdown", expectedResult: "ระบบต้องคงค่าที่กรอกไว้ก่อนกดบันทึก", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    // Card
    { key: "CVM_DT_48", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดงผล Card Customer", expectedResult: "ระบบต้องแสดง Card แยกตาม Customer", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_49", condition: "มีข้อมูล Customer ในระบบ", testSteps: "1) ตรวจสอบชื่อ Customer บน Card", expectedResult: "ระบบต้องแสดงชื่อ Customer ถูกต้อง เช่น \"FORD\"", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_50", condition: "มีข้อมูล Variance ในระบบ", testSteps: "1) ตรวจสอบการแสดงผล Variance Status บน Card", expectedResult: "ระบบต้องแสดงสถานะ Variance เช่น \"Cost Increase\"", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_51", condition: "มีข้อมูล Trend ในระบบ", testSteps: "1) ตรวจสอบการแสดงผลกราฟ Trend", expectedResult: "ระบบต้องแสดงกราฟ Trend ของ Cost Variance บน Card", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_52", condition: "มีข้อมูล Variance ในระบบ", testSteps: "1) ตรวจสอบการแสดงผล Total Variance", expectedResult: "ระบบต้องแสดงค่า Total Variance (฿) ถูกต้อง", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_53", condition: "มีข้อมูล Variance ในระบบ", testSteps: "1) ตรวจสอบการแสดงผลเปอร์เซ็นต์ Variance", expectedResult: "ระบบต้องแสดงค่าเปอร์เซ็นต์ Variance ถูกต้อง", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_54", condition: "มีข้อมูล Variance ในระบบ", testSteps: "1) ตรวจสอบการแสดงผลทิศทาง Variance", expectedResult: "ระบบต้องแสดง Icon เพิ่มขึ้นหรือลดลงตามค่า Variance", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_55", condition: "มีข้อมูล FG ในระบบ", testSteps: "1) ตรวจสอบการแสดงผล Total FG", expectedResult: "ระบบต้องแสดงจำนวน Total FG", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_56", condition: "มีข้อมูล FG สถานะ Critical", testSteps: "1) ตรวจสอบการแสดงผล Critical Count", expectedResult: "ระบบต้องแสดงจำนวน FG ที่มีสถานะ Critical ถูกต้อง", priority: "HIGH", status: "PASS", notes: "Critical Count มีจำนวนไม่ตรงกับข้อมูลในตาราง", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_57", condition: "มีข้อมูล FG สถานะ Warning", testSteps: "1) ตรวจสอบการแสดงผล Warning Count", expectedResult: "ระบบต้องแสดงจำนวน FG ที่มีสถานะ Warning ถูกต้อง", priority: "HIGH", status: "FAIL", notes: "Warning Count มีจำนวนไม่ตรงกับข้อมูลในตาราง", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_58", condition: "มีข้อมูล FG สถานะ Normal", testSteps: "1) ตรวจสอบการแสดงผล Normal Count", expectedResult: "ระบบต้องแสดงจำนวน FG ที่มีสถานะ Normal ถูกต้อง", priority: "HIGH", status: "FAIL", notes: "Normal Count มีจำนวนไม่ตรงกับข้อมูลในตาราง", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_59", condition: "มีการเปลี่ยนแปลง Filter", testSteps: "1) เปลี่ยนค่า Filter\n2) ตรวจสอบข้อมูลบน Card", expectedResult: "ระบบต้องอัปเดตข้อมูลบน Card หลังมีการเปลี่ยนแปลง Filter", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_60", condition: "มีการเปลี่ยนแปลง Threshold", testSteps: "1) แก้ไขค่า Threshold\n2) ตรวจสอบข้อมูลบน Card", expectedResult: "ระบบต้องอัปเดตข้อมูลบน Card หลังมีการเปลี่ยนแปลง Threshold", priority: "HIGH", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_61", condition: "ไม่มีข้อมูล Variance", testSteps: "1) ตรวจสอบการแสดงผลข้อมูลบน Card", expectedResult: "ระบบต้องแสดงค่า \"0.00\" เมื่อไม่มีข้อมูล", priority: "MEDIUM", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_62", condition: "Customer มีการกำหนด Threshold เฉพาะ", testSteps: "1) เปิดหน้า Cost Variance Management\n2) ตรวจสอบ Card Customer", expectedResult: "ระบบต้องแสดงแท็ก Customer Threshold บน Card เมื่อ Customer ใช้งาน Threshold ของตัวเอง", priority: "MEDIUM", status: "NOT_RUN", notes: "ยังทดสอบไม่ได้เนื่องจากเป็น New Request", clarificationRequired: true, inProgress: false, tested: false },
    { key: "CVM_DT_63", condition: "Customer ใช้ Threshold ระดับองค์กร", testSteps: "1) เปิดหน้า Cost Variance Management\n2) ตรวจสอบ Card Customer", expectedResult: "ระบบต้องไม่แสดงแท็ก Customer Threshold เมื่อ Customer ใช้ Threshold ระดับองค์กร", priority: "MEDIUM", status: "NOT_RUN", notes: "ยังทดสอบไม่ได้เนื่องจากเป็น New Request", clarificationRequired: true, inProgress: false, tested: false },
    { key: "CVM_DT_64", condition: "มีข้อมูล Variance เป็นค่าบวก", testSteps: "1) ตรวจสอบการแสดงผล % Variance บน Card", expectedResult: "ระบบต้องแสดงตัวอักษรสีแดงเมื่อค่า Variance เป็นบวก", priority: "LOW", status: "NOT_RUN", notes: "ยังทดสอบไม่ได้เนื่องจากเป็น New Request", clarificationRequired: true, inProgress: false, tested: false },
    { key: "CVM_DT_65", condition: "มีข้อมูล Variance เป็นค่าลบ", testSteps: "1) ตรวจสอบการแสดงผล % Variance บน Card", expectedResult: "ระบบต้องแสดงตัวอักษรสีเขียวเมื่อค่า Variance เป็นลบ", priority: "LOW", status: "NOT_RUN", notes: "ยังทดสอบไม่ได้เนื่องจากเป็น New Request", clarificationRequired: true, inProgress: false, tested: false },
    { key: "CVM_DT_66", condition: "มีการเปลี่ยนแปลงข้อมูล Variance", testSteps: "1) เปลี่ยนข้อมูล Variance\n2) ตรวจสอบค่า % Variance บน Card", expectedResult: "ระบบต้องอัปเดตค่าและสีของ % Variance ตามข้อมูลล่าสุด", priority: "MEDIUM", status: "NOT_RUN", notes: "ยังทดสอบไม่ได้เนื่องจากเป็น New Request", clarificationRequired: true, inProgress: false, tested: false },
    { key: "CVM_DT_67", condition: "มีข้อมูล Customer ในระบบ", testSteps: "1) คลิก Card Customer", expectedResult: "ระบบต้องเปิดหน้ารายละเอียดของ Customer ที่เลือก", priority: "CRITICAL", status: "PASS", notes: "", clarificationRequired: false, inProgress: false, tested: true },
    // Result
    { key: "CVM_DT_68", condition: "เปิดหน้า Cost Variance Management สำเร็จ", testSteps: "1) ตรวจสอบการแสดง Result ด้านขวาบนของรายการ Card", expectedResult: "ระบบต้องแสดง Result ด้านขวาบนของรายการ Card", priority: "LOW", status: "FAIL", notes: "ระบบไม่แสดง Result", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_69", condition: "มีการใช้งาน Filter", testSteps: "1) เลือกเงื่อนไข Filter\n2) ตรวจสอบจำนวน Result", expectedResult: "ระบบต้องแสดงจำนวนข้อมูล Result ตามเงื่อนไข Filter ที่เลือก", priority: "LOW", status: "BLOCKED", notes: "ทดสอบไม่ได้ เนื่องจากระบบไม่แสดง Result", clarificationRequired: false, inProgress: false, tested: false },
    { key: "CVM_DT_70", condition: "มีการใช้งาน Filter และกด Clear Filter", testSteps: "1) กดปุ่ม Clear Filter\n2) ตรวจสอบจำนวน Result", expectedResult: "ระบบต้องแสดงจำนวน Result ทั้งหมดตามค่า Default", priority: "LOW", status: "BLOCKED", notes: "ทดสอบไม่ได้ เนื่องจากระบบไม่แสดง Result", clarificationRequired: false, inProgress: false, tested: false },
    { key: "CVM_DT_71", condition: "ไม่มีข้อมูลตามเงื่อนไข Filter", testSteps: "1) เลือก Filter ที่ไม่พบข้อมูล\n2) ตรวจสอบ Result", expectedResult: "ระบบต้องแสดง Result = 0 เมื่อไม่พบข้อมูล", priority: "LOW", status: "BLOCKED", notes: "ทดสอบไม่ได้ เนื่องจากระบบไม่แสดง Result", clarificationRequired: false, inProgress: false, tested: false },
    // Other
    { key: "CVM_DT_72", condition: "ผู้ใช้เลือกค่า Period จากหน้า List ก่อนเข้า Customer Detail", testSteps: "1) เลือกค่า Period จากหน้า List\n2) เปิดหน้า Customer Detail\n3) ตรวจสอบค่า Period", expectedResult: "ระบบต้องใช้ค่า Period เดียวกันกับที่เลือกจากหน้า List", priority: "HIGH", status: "FAIL", notes: "หน้า Detail ไม่ใช้ Period เดียวกันกับหน้า List", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_73", condition: "เปิดหน้า Customer Detail และมีการเลือก Period", testSteps: "1) เลือกค่า Period\n2) Refresh หน้า Customer Detail\n3) ตรวจสอบค่า Period", expectedResult: "ระบบต้องคงค่า Period ล่าสุดที่เลือกไว้", priority: "HIGH", status: "FAIL", notes: "ระบบไม่คงค่า Period ล่าสุดหลัง Refresh หน้า", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_74", condition: "ผู้ใช้เปิดหน้า Customer Detail จากหน้า List", testSteps: "1) เลือกค่า Period จากหน้า List\n2) เปิดหน้า Customer Detail\n3) กลับไปหน้า List\n4) ตรวจสอบค่า Period", expectedResult: "ระบบต้องแสดงค่า Period เดิมที่ผู้ใช้เลือกก่อนเข้า Detail", priority: "HIGH", status: "FAIL", notes: "ระบบไม่คงค่า Period ล่าสุดเมื่อกลับไปหน้า List", clarificationRequired: false, inProgress: false, tested: true },
    { key: "CVM_DT_75", condition: "ใช้เงื่อนไข Filter เดียวกันทั้งหน้า List และ Customer Detail", testSteps: "1) เลือก Filter บนหน้า List\n2) ตรวจสอบข้อมูลกราฟ Time Series บนหน้า List\n3) เปิดหน้า Customer Detail\n4) ตรวจสอบข้อมูลกราฟ Time Series บนหน้า Customer Detail", expectedResult: "ระบบต้องแสดงข้อมูลกราฟ Time Series ตรงกันระหว่างหน้า List และ Detail เมื่อใช้เงื่อนไข Filter เดียวกัน", priority: "HIGH", status: "FAIL", notes: "ระบบแสดงข้อมูลกราฟ Time Series ไม่ตรงกัน", clarificationRequired: false, inProgress: false, tested: true },
];

async function main() {
    // Get or create project
    let project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } });
    if (!project) {
        project = await prisma.project.create({
            data: { key: "DEFAULT", name: "Default Project", description: "Default project" },
        });
    }

    // Get or create module "Cost Variance Management"
    let suite = await prisma.testSuite.findFirst({
        where: { projectId: project.id, name: "Cost Variance Management" },
    });
    if (!suite) {
        suite = await prisma.testSuite.create({
            data: {
                projectId: project.id,
                name: "Cost Variance Management",
                description: "Test cases for Cost Variance Management module",
            },
        });
    }

    console.log(`Project: ${project.name} (${project.id})`);
    console.log(`Module: ${suite.name} (${suite.id})`);

    let created = 0;
    let updated = 0;

    for (const tc of testCases) {
        const existing = await prisma.testCase.findFirst({
            where: { projectId: project.id, key: tc.key },
        });

        const data = {
            projectId: project.id,
            suiteId: suite.id,
            key: tc.key,
            title: tc.key, // Title is the key identifier
            condition: tc.condition,
            testSteps: tc.testSteps,
            expectedResult: tc.expectedResult,
            priority: tc.priority,
            status: tc.status,
            notes: tc.notes || null,
            clarificationRequired: tc.clarificationRequired,
            inProgress: tc.inProgress,
            tested: tc.tested,
            type: "FUNCTIONAL",
            automationStatus: "MANUAL",
        };

        if (existing) {
            await prisma.testCase.update({ where: { id: existing.id }, data });
            updated++;
        } else {
            await prisma.testCase.create({ data });
            created++;
        }
    }

    console.log(`\nDone! Created: ${created}, Updated: ${updated}, Total: ${testCases.length}`);
    await prisma.$disconnect();
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
