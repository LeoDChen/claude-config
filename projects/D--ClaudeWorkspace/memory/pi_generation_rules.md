---
name: PI 生成规则
description: 客户对 PI 报价文件生成的格式要求和操作规范
type: feedback
originSessionId: 3253b406-64d6-46d1-aa23-7bacac83b8b1
---
# PI 生成规则（用户指定）

1. **买方地址**：客户有货代则填货代发货地址，无货代则填最终收货地址。
2. **买家信息**：只填用户提供的内容，没给的不填。最终目的国只填客户给的收货国家。
3. **全英文**：整份 PI 不允许出现中文。用户给的中文信息全部翻译成英文。产品名如"婴儿布尿裤"固定译为"Baby Cloth Diaper"。
4. **报价有效期**：模板中 `4.QUOTATION VALIDITY: ONLY YYYY-M-D(FOR GOODS ONLY)` 的日期 = PI 制作日期往后推一个月。例如 4/28 制作 → 日期为 2026-5-28。
5. **Trade Terms**：从第二次生成起，在 DELIVERY TIME 上方增加 "Trade Terms:" 行。通过 J10 和 L10 合并单元格内换行实现（J10 = "Trade Terms:\nDELIVERY TIME:"，L10 = "EXW\n7-15 days after payment"）。
6. **Shipment**：用户输入中必须包含 Shipment（运输方式），默认不设值。
