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

        <div>
          <label className={labelCls} htmlFor="site_name">
            站点名称
          </label>
          <input
            id="site_name"
            name="site_name"
            defaultValue={settings.site_name}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="site_description">
            站点描述
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
