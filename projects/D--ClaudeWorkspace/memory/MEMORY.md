# 记忆索引

- [用户信息](user_profile.md) — 用户角色、偏好、知识背景
- [项目背景](project_context.md) — 当前工作项目的背景信息
- [使用反馈](usage_feedback.md) — 用户对AI助手的使用反馈和偏好
- [工具权限](tool_permissions.md) — 常用工具权限配置记录
- [工作流程](workflow_patterns.md) — 常用工作流程和模式
- [配置双层架构](config-dual-layer.md) — 规则系统需要参考层(CLAUDE.md)+强制层(hooks)，单靠任一层不够；清单≤7条/动词不用原则

- [P4P优化技能手册](p4p_optimization_skill.md) — 阿里巴巴国际站 P4P 两计划优化方法论（产品分层/地域调整/标题B2B/操作清单）
- [GrsAI MCP + 主图合成](grsai_mcp_image_compositing.md) — GrsAI MCP 配置 / 产品特征坐标 / 合成脚本参数
- [Claude Code 两个界面区分](cc_interface_distinction.md) — 终端面板（左/CLI）与 Chat 面板（右/扩展）的能力差异

- [PI 生成规则](pi_generation_rules.md) — 地址填写/全英文/有效期计算/仅填用户提供信息
- [看板报告格式](report_format.md) — 必须输出为格式美观的Word文档(.docx)，而非Markdown

- [输出语言规则](output_language_rules.md) — 回复默认中文，公司/人名/地址/联系方式必须英文原文
- [知识检索强制协议](feedback_search_protocol.md) — 报告"没有"前搜 2 源×2 关键词；向用户提问前先检索 memory→OB→知识库，穷举后才问
- [问题解决思维](problem_solving_approach.md) — 穷举所有可行路径，不因工具限制说"不行"；不盲信陈旧分析结论
- [货运报价规则](shipping_freight_rules.md) — 客户无地址只报产品价/有地址分两种场景/加价15-25%/绝不跟客户说运输自理
- [MOQ 区分规则](moq_rules.md) — 定制订单MOQ=500，现货按链接起订量；回复数量/报价前必须先判断订单类型
- [批量分析输出方式](feedback_batch_output.md) — 批量分析>3人直接写文件，不逐条输出到对话框
- [上下文容量管理](context_management_rules.md) — 大任务分对话执行+主动评估容量+提前拆分
- [手机报告偏好](mobile_report_preference.md) — 不主动生成手机端长图，用户明确说需要才生成
- [审计反馈不可盲信](feedback_audit_validation.md) — 外部审计结论需独立复算验证，审计方也可能算错

- [OKKI分析经验教训](okki_analysis_lessons.md) — 10条规则：平台消息区分+9条用户反馈修正（样品查证/关系型不逼单/禁替用户决策/高价值不唯算法/沉默穷举根因/报价从源数据核对/已读不回心理分析/延迟回复须致歉/重复强调=焦虑点）
- [OKKI分析分批工作流](okki_workflow_split.md) — 分类和深度分析分离：先批量出阶段+类型，用户挑人后独立对话深度分析
- [OKKI订单同步](okki_order_sync.md) — OKKI 订单页 DOM 结构 / sync_orders.js 选择器/字段索引/滚动抓取策略
- [OKKI驱动因子模型](okki_driver_factors.md) — 废弃NOW/SOON/COLD单标签热度，转向驱动因子（未回复/承诺未兑现/该追问/该回访等）；双轴矩阵看板方案；阶段流转表定稿+因子终点对齐

- [AI判定 × 脚本分工三层框架](ai_script_judgment_pattern.md) — AI批量判定客户阶段/状态时的三层规则框架（语义定义+边界判例+证据要求），脚本vsAI分工原则

- [OB对话归档系统](ob_archive_system.md) — 231→223个对话已归档 OB，46客户档案，13主题索引，V2脚本+双链

- [台式机同步 → 笔记本同步流程](desktop-sync-workflow.md) — 台式机 push 后笔记本三仓库 pull + OB 全量归档的完整步骤
- [push=三仓库+OB全量归档](push_full_sync_rule.md) — push命令必须三仓库全推+当天对话归档OB+更新索引，缺一不可；2026-05-22只推一个仓库被纠正
- [push = 三仓库全量同步](push-three-repos.md) — 用户说 push 时默认三仓库 (OB/Workspace/.claude) 全部 add+commit+pull+push，不是只推当前目录
- [迭代哲学](iteration_philosophy.md) — AI时代的护城河不是工具，是"不将就"的迭代密度；能用的系统 vs 持续进化的系统
- [货代询价模板与装箱数据](freight_inquiry_template.md) — 货代询价标准模板+箱规库+训练裤重量/装箱数据；客户分析后自动输出询价草稿
- [产品参数自动存档](product_params_auto_save.md) — 深度分析客户后自动提取产品参数 → 更新 products.json → 跑脚本刷新桌面 Excel

*记忆文件存储在 memory/ 目录中，此文件仅为索引*
