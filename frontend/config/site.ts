export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + HeroUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "common.home",
      href: "/",
    },
    {
      label: "common.settings", // Using settings for TestAPI placeholder or similar
      href: "/test-api",
    },
    {
      label: "common.login",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "common.profile",
      href: "/profile",
    },
    {
      label: "common.dashboard",
      href: "/dashboard",
    },
    {
      label: "common.projects",
      href: "/projects",
    },
    {
      label: "common.team",
      href: "/team",
    },
    {
      label: "common.calendar",
      href: "/calendar",
    },
    {
      label: "common.settings",
      href: "/settings",
    },
    {
      label: "common.feedback",
      href: "/help-feedback",
    },
    {
      label: "common.logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
