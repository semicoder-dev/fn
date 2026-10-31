# 手机内测准备

本轮只构建和本地验证，不上传 TestFlight。取得明确发行授权后，先核对 `project.yml`、Release xcconfig、签名团队、生产 Bundle ID、CloudKit 容器及 Push entitlement，再准备版本/build。

使用 `cloudkit-schema.ckdb` 核对 FnRelayHost、FnRelayRequest、FnRelayStatus、FnRelayReply；生产 schema 部署是独立远端动作。通过 README 中的真机矩阵后再归档上传，并验证安装、账号环境与文字补送。不得用模拟器构建或历史内测证据替代当前协议验收。
