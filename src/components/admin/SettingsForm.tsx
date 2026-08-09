"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/app/admin/(dashboard)/settings/actions";
import { PageHeader, btnPrimaryCls, inputCls, labelCls } from "@/components/admin/ui";

interface SettingsFormProps {
  settings: Record<string, string>;
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, null);

  return (
    <div>
      <PageHeader title="系统设置" />
      <form action={formAction} className="max-w-xl space-y-4">
        {state?.ok && (
          <div className="text-sm text-green-700 bg-green-50 rounded p-2.5">
            设置已保存
          </div>
        )}

        <h3 className="font-medium pt-2 border-t border-gray-100">基础信息</h3>
        <div>
          <label className={labelCls} htmlFor="site_name">
            站点名称（中文）
          </label>
          <input
            id="site_name"
            name="site_name"
            defaultValue={settings.site_name}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="site_name_en">
            站点名称（英文）
          </label>
          <input
            id="site_name_en"
            name="site_name_en"
            defaultValue={settings.site_name_en}
            className={inputCls}
            placeholder="如：ABC Machinery Co., Ltd."
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="site_description">
            站点描述（中文）
          </label>
          <textarea
            id="site_description"
            name="site_description"
            defaultValue={settings.site_description}
            className={inputCls}
            rows={3}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="site_description_en">
            站点描述（英文）
          </label>
          <textarea
            id="site_description_en"
            name="site_description_en"
            defaultValue={settings.site_description_en}
            className={inputCls}
            rows={3}
            placeholder="Professional factory, quality products, welcome inquiries"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="site_logo">
            站点 Logo URL
          </label>
          <input
            id="site_logo"
            name="site_logo"
            defaultValue={settings.site_logo}
            className={inputCls}
            placeholder="https://..."
          />
        </div>

        <h3 className="font-medium pt-2 border-t border-gray-100">前台主题（用户端整体风格）</h3>
        <div>
          <label className={labelCls} htmlFor="front_theme">
            主题风格
          </label>
          <select
            id="front_theme"
            name="front_theme"
            defaultValue={settings.front_theme || "light"}
            className={inputCls}
          >
            <option value="light">经典浅色（Apple 风，默认）</option>
            <option value="dark">深色科技</option>
            <option value="blue">商务蓝</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            保存后前台首页 /zh 与 /en 的配色、按钮、卡片会同步切换。
          </p>
        </div>

        <h3 className="font-medium pt-2 border-t border-gray-100">联系方式（海外买家可见）</h3>
        <div>
          <label className={labelCls} htmlFor="contact_email">
            询盘接收邮箱（必填，用于接收询盘通知）
          </label>
          <input
            id="contact_email"
            name="contact_email"
            type="email"
            defaultValue={settings.contact_email}
            className={inputCls}
            placeholder="sales@example.com"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="whatsapp_number">
            WhatsApp 号码（含国家区号）
          </label>
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            defaultValue={settings.whatsapp_number}
            className={inputCls}
            placeholder="+86 13800138000"
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="contact_phone">
            联系电话
          </label>
          <input
            id="contact_phone"
            name="contact_phone"
            defaultValue={settings.contact_phone}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="contact_address">
            工厂地址（中文）
          </label>
          <input
            id="contact_address"
            name="contact_address"
            defaultValue={settings.contact_address}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="contact_address_en">
            工厂地址（英文）
          </label>
          <input
            id="contact_address_en"
            name="contact_address_en"
            defaultValue={settings.contact_address_en}
            className={inputCls}
            placeholder="No.123, Industrial Park, Guangzhou, China"
          />
        </div>

        <h3 className="font-medium pt-2 border-t border-gray-100">
          邮件通知（SMTP，用于接收新询盘通知）
        </h3>
        <div>
          <label className={labelCls} htmlFor="smtp_host">
            SMTP 服务器
          </label>
          <input
            id="smtp_host"
            name="smtp_host"
            defaultValue={settings.smtp_host}
            className={inputCls}
            placeholder="smtp.qq.com / smtp.exmail.qq.com / smtp.gmail.com"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} htmlFor="smtp_port">
              SMTP 端口
            </label>
            <input
              id="smtp_port"
              name="smtp_port"
              defaultValue={settings.smtp_port}
              className={inputCls}
              placeholder="465 或 587"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="smtp_user">
              SMTP 账号
            </label>
            <input
              id="smtp_user"
              name="smtp_user"
              defaultValue={settings.smtp_user}
              className={inputCls}
              placeholder="发件邮箱"
            />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="smtp_password">
            SMTP 授权码
          </label>
          <input
            id="smtp_password"
            name="smtp_password"
            type="password"
            defaultValue={settings.smtp_password}
            className={inputCls}
            placeholder="邮箱授权码（非登录密码）"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="allow_register"
            defaultChecked={settings.allow_register === "true"}
            className="rounded"
          />
          允许用户注册
        </label>

        <button type="submit" disabled={pending} className={btnPrimaryCls}>
          {pending ? "保存中..." : "保存设置"}
        </button>
      </form>
    </div>
  );
}
