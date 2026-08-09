/**
 * 双语字典（海外独立站）
 * lang: "zh" | "en"，默认中文。
 * 通过 route segment `[lang]` 传递，前台页面统一使用 getDict(lang)。
 */

export type Locale = "zh" | "en";

export const LOCALES: Locale[] = ["zh", "en"];
export const DEFAULT_LOCALE: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return value === "zh" || value === "en";
}

/** 前台界面文案 */
interface Dict {
  nav: {
    home: string;
    products: string;
    about: string;
    contact: string;
    blog: string;
    search: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    cta: string;
    products: string;
    productsMore: string;
    about: string;
    news: string;
  };
  product: {
    all: string;
    noProducts: string;
    detail: string;
    spec: string;
    inqTitle: string;
    inqName: string;
    inqEmail: string;
    inqWhatsapp: string;
    inqCountry: string;
    inqCompany: string;
    inqMessage: string;
    inqSubmit: string;
    inqSuccess: string;
    featured: string;
    views: string;
  };
  contact: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    formTitle: string;
  };
  footer: {
    rights: string;
  };
  langSwitch: string;
}

const ZH: Dict = {
  nav: {
    home: "首页",
    products: "产品中心",
    about: "关于我们",
    contact: "联系我们",
    blog: "资讯动态",
    search: "搜索",
  },
  home: {
    heroTitle: "专注品质，值得信赖",
    heroSubtitle: "专业工厂，先进设备，匠心制造",
    cta: "了解更多",
    products: "热销产品",
    productsMore: "查看全部产品",
    about: "关于我们",
    news: "最新动态",
  },
  product: {
    all: "全部分类",
    noProducts: "暂无产品",
    detail: "产品详情",
    spec: "规格参数",
    inqTitle: "产品询盘",
    inqName: "姓名",
    inqEmail: "邮箱",
    inqWhatsapp: "WhatsApp",
    inqCountry: "国家/地区",
    inqCompany: "公司名称",
    inqMessage: "询盘内容",
    inqSubmit: "提交询盘",
    inqSuccess: "询盘已提交，我们将尽快与您联系！",
    featured: "精选产品",
    views: "浏览",
  },
  contact: {
    title: "联系我们",
    subtitle: "欢迎来电或留言，我们将竭诚为您服务",
    email: "邮箱",
    phone: "电话",
    whatsapp: "WhatsApp",
    address: "地址",
    formTitle: "发送询盘",
  },
  footer: {
    rights: "版权所有",
  },
  langSwitch: "English",
} as const;

const EN: Dict = {
  nav: {
    home: "Home",
    products: "Products",
    about: "About Us",
    contact: "Contact",
    blog: "News",
    search: "Search",
  },
  home: {
    heroTitle: "Quality You Can Trust",
    heroSubtitle: "Professional factory, advanced equipment, crafted with care",
    cta: "Learn More",
    products: "Featured Products",
    productsMore: "View All Products",
    about: "About Us",
    news: "Latest News",
  },
  product: {
    all: "All Categories",
    noProducts: "No products yet",
    detail: "Product Details",
    spec: "Specifications",
    inqTitle: "Product Inquiry",
    inqName: "Name",
    inqEmail: "Email",
    inqWhatsapp: "WhatsApp",
    inqCountry: "Country / Region",
    inqCompany: "Company",
    inqMessage: "Inquiry Message",
    inqSubmit: "Send Inquiry",
    inqSuccess: "Inquiry submitted. We will contact you soon!",
    featured: "Featured Products",
    views: "views",
  },
  contact: {
    title: "Contact Us",
    subtitle: "Feel free to call or leave a message, we are always at your service",
    email: "Email",
    phone: "Phone",
    whatsapp: "WhatsApp",
    address: "Address",
    formTitle: "Send an Inquiry",
  },
  footer: {
    rights: "All rights reserved",
  },
  langSwitch: "中文",
};

const DICTS: Record<Locale, Dict> = { zh: ZH, en: EN };

export function getDict(lang: string): Dict {
  return isLocale(lang) ? DICTS[lang] : ZH;
}

/** 当前语言下的站点名称（设置项支持双语） */
export function siteName(lang: string, settings: Record<string, string>): string {
  return lang === "en"
    ? settings.site_name_en || settings.site_name || "My Factory"
    : settings.site_name || "My Factory";
}
