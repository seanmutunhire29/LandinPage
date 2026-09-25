import { useState } from "react"
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Loader2,
  Minus,
  Plus,
  Search,
  Sparkles,
  Zap,
  Image as ImageIcon,
  Star,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useScopedTheme, usePortalStyle } from "@/components/wizard/ThemeScope"
import { onColor, rgba } from "@/lib/color"
import { cn } from "@/lib/utils"

// Every option in the Components stage is a real, interactive shadcn/ui
// component (or composition of them), re-skinned by the surrounding ThemeScope.
// Clicks inside a preview bubble up, so trying a component also selects it.

function Heading({ children, className }) {
  const theme = useScopedTheme()
  return (
    <span className={className} style={theme?.headingStyle}>
      {children}
    </span>
  )
}

/* ---------------------------------- Buttons --------------------------------- */

function ButtonsPreview({ variant }) {
  const { controlStyle, gradient, colors } = useScopedTheme()
  const label = "Get started"
  switch (variant) {
    case "solid":
      return <Button size="lg" className="h-10 px-5" style={controlStyle}>{label}</Button>
    case "outline":
      return <Button variant="outline" size="lg" className="h-10 border-foreground/30 bg-transparent px-5">{label}</Button>
    case "ghost":
      return <Button variant="ghost" size="lg" className="h-10 px-5">{label}</Button>
    case "pill":
      return <Button size="lg" className="h-10 rounded-full px-6" style={controlStyle}>{label}</Button>
    case "icon-leading":
      return (
        <Button size="lg" className="h-10 px-5" style={controlStyle}>
          <Sparkles data-icon="inline-start" /> {label}
        </Button>
      )
    case "icon-trailing":
      return (
        <Button size="lg" className="h-10 px-5" style={controlStyle}>
          {label} <ArrowRight data-icon="inline-end" />
        </Button>
      )
    case "gradient":
      return (
        <Button
          size="lg"
          className="h-10 border-0 px-5 hover:opacity-90"
          style={{ ...controlStyle, backgroundImage: gradient, color: onColor(colors.primary) }}
        >
          {label}
        </Button>
      )
    case "underline-hover":
      return (
        <Button variant="link" size="lg" className="h-10 px-0 text-base text-foreground decoration-primary decoration-2 underline-offset-[6px]">
          {label} <ArrowRight data-icon="inline-end" />
        </Button>
      )
    default:
      return null
  }
}

/* ----------------------------------- Cards ---------------------------------- */

function CardsPreview({ variant }) {
  const { cardStyle, cardClass, colors } = useScopedTheme()
  const hasBorder = cardStyle.border && cardStyle.border !== "none"
  const hasShadow = cardStyle.boxShadow && cardStyle.boxShadow !== "none"

  const styles = {
    bordered: { ...cardStyle, boxShadow: "none", border: hasBorder ? cardStyle.border : `1px solid ${colors.border}` },
    shadowed: { ...cardStyle, border: "none", boxShadow: hasShadow ? cardStyle.boxShadow : `0 12px 28px -12px ${rgba(colors.text, 0.35)}` },
    filled: { ...cardStyle, background: "var(--muted)", boxShadow: "none" },
    "text-only": { background: "transparent", border: "none", boxShadow: "none" },
  }
  const style = styles[variant] ?? cardStyle
  const base = cn("w-full max-w-64 gap-3 py-4 ring-0", cardClass)

  const title = <CardTitle><Heading>Instant setup</Heading></CardTitle>
  const desc = <CardDescription>Connect your stack in minutes, with no code required.</CardDescription>

  switch (variant) {
    case "image-top":
      return (
        <Card className={cn(base, "pt-0")} style={style}>
          <div className="grid h-20 place-items-center" style={{ background: `linear-gradient(135deg, ${rgba(colors.primary, 0.25)}, ${rgba(colors.accent, 0.35)})` }}>
            <ImageIcon className="size-6 text-foreground/40" />
          </div>
          <CardHeader>{title}{desc}</CardHeader>
        </Card>
      )
    case "icon-top":
      return (
        <Card className={base} style={style}>
          <CardHeader>
            <span className="mb-2 grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            {title}
            {desc}
          </CardHeader>
        </Card>
      )
    case "horizontal":
      return (
        <Card className={cn(base, "max-w-72 flex-row gap-0 py-0")} style={style}>
          <div className="grid w-20 shrink-0 place-items-center" style={{ background: rgba(colors.primary, 0.18) }}>
            <ImageIcon className="size-5 text-foreground/40" />
          </div>
          <CardHeader className="py-4">{title}{desc}</CardHeader>
        </Card>
      )
    case "layered":
      return (
        <div className="relative w-full max-w-60 pt-3 pr-3">
          <div className="absolute inset-0 top-0 left-3 rounded-xl" style={{ background: colors.accent, borderRadius: "calc(var(--radius) * 1.4)" }} />
          <div className="absolute inset-0 top-1.5 left-1.5 rounded-xl opacity-80" style={{ background: colors.secondary, borderRadius: "calc(var(--radius) * 1.4)", right: 6, bottom: -6 }} />
          <Card className={cn(base, "relative")} style={{ ...cardStyle, background: colors.surface }}>
            <CardHeader>{title}{desc}</CardHeader>
          </Card>
        </div>
      )
    case "text-only":
      return (
        <Card className={cn(base, "px-0")} style={style}>
          <CardHeader className="px-0">{title}{desc}</CardHeader>
          <CardContent className="px-0">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">Learn more <ArrowRight className="size-3.5" /></span>
          </CardContent>
        </Card>
      )
    default:
      return (
        <Card className={base} style={style}>
          <CardHeader>{title}{desc}</CardHeader>
          <CardFooter className="border-0 bg-transparent pt-0">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">Learn more <ArrowRight className="size-3.5" /></span>
          </CardFooter>
        </Card>
      )
  }
}

/* ------------------------------- Navigation bar ------------------------------ */

function Brand({ light }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", light && "text-white")}>
      <span className="grid size-5 place-items-center rounded-md bg-primary">
        <Layers className="size-3 text-primary-foreground" />
      </span>
      <Heading>Acme</Heading>
    </span>
  )
}

function Links({ light, items = ["Product", "Pricing", "Docs"] }) {
  return (
    <div className={cn("flex items-center gap-4 text-[13px]", light ? "text-white/85" : "text-muted-foreground")}>
      {items.map((l) => (
        <span key={l} className={cn("cursor-pointer", light ? "hover:text-white" : "hover:text-foreground")}>{l}</span>
      ))}
    </div>
  )
}

function Cta({ small, light }) {
  const { controlStyle } = useScopedTheme()
  return (
    <Button size={small ? "sm" : "default"} className={cn(light && "bg-white text-black hover:bg-white/90")} style={controlStyle}>
      Sign up
    </Button>
  )
}

function ScrollNavDemo({ transparent }) {
  const [scrolled, setScrolled] = useState(false)
  const { colors, gradient } = useScopedTheme()
  const solid = !transparent || scrolled
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-foreground/10">
      <div className="h-40 overflow-y-auto" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 8)}>
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 transition-all duration-300"
          style={
            solid
              ? { background: scrolled || transparent ? colors.surface : "transparent", boxShadow: scrolled ? `0 4px 14px -6px ${rgba(colors.text, 0.3)}` : "none" }
              : { background: "transparent" }
          }
        >
          <Brand light={!solid} />
          <Links light={!solid} items={["Product", "Pricing"]} />
          <Cta small light={!solid} />
        </div>
        <div className={cn("-mt-11 flex h-28 flex-col justify-end gap-1.5 px-3 pb-3", !transparent && "mt-0 h-20")} style={transparent ? { background: gradient } : { background: "var(--muted)" }}>
          <div className={cn("h-2 w-2/3 rounded-full", transparent ? "bg-white/85" : "bg-foreground/60")} />
          <div className={cn("h-1.5 w-1/2 rounded-full", transparent ? "bg-white/60" : "bg-foreground/25")} />
        </div>
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-1.5 rounded-full bg-foreground/12" style={{ width: `${90 - (i % 3) * 18}%` }} />
          ))}
        </div>
      </div>
      <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background">
        Scroll inside ↓
      </span>
    </div>
  )
}

function NavPreview({ variant }) {
  const bar = "flex w-full items-center justify-between rounded-lg border border-foreground/10 bg-card px-3 py-2.5"
  switch (variant) {
    case "centered-logo":
      return (
        <div className={bar}>
          <Links items={["Product", "Pricing"]} />
          <Brand />
          <Links items={["Docs", "Log in"]} />
        </div>
      )
    case "logo-left-right":
      return (
        <div className={bar}>
          <Brand />
          <div className="flex items-center gap-4">
            <Links />
            <Cta small />
          </div>
        </div>
      )
    case "logo-left-center":
      return (
        <div className={bar}>
          <Brand />
          <Links />
          <Cta small />
        </div>
      )
    case "sticky-bg":
      return <ScrollNavDemo />
    case "transparent-solid":
      return <ScrollNavDemo transparent />
    case "search-center":
      return (
        <div className={cn(bar, "gap-3")}>
          <Brand />
          <div className="relative max-w-48 flex-1">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="h-7 pl-8 text-xs" />
          </div>
          <Avatar size="sm"><AvatarFallback className="bg-primary text-[10px] text-primary-foreground">JD</AvatarFallback></Avatar>
        </div>
      )
    case "minimal-cta":
      return (
        <div className={bar}>
          <Brand />
          <Cta small />
        </div>
      )
    default:
      return null
  }
}

/* ---------------------------------- Inputs ---------------------------------- */

function InputsPreview({ variant, id }) {
  const fid = `${id}-email`
  const wrap = "flex w-full max-w-64 flex-col gap-1.5"
  switch (variant) {
    case "underline":
      return (
        <div className={wrap}>
          <Label htmlFor={fid}>Email</Label>
          <Input id={fid} placeholder="you@company.com" className="rounded-none border-0 border-b-2 border-foreground/25 bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0" />
        </div>
      )
    case "bordered":
      return (
        <div className={wrap}>
          <Label htmlFor={fid}>Email</Label>
          <Input id={fid} placeholder="you@company.com" className="h-9 border-foreground/25" />
        </div>
      )
    case "filled":
      return (
        <div className={wrap}>
          <Label htmlFor={fid}>Email</Label>
          <Input id={fid} placeholder="you@company.com" className="h-9 border-transparent bg-muted" />
        </div>
      )
    case "floating-label":
      return (
        <div className="relative w-full max-w-64">
          <Input id={fid} placeholder=" " className="peer h-12 border-foreground/25 px-3 pt-4" />
          <Label
            htmlFor={fid}
            className="pointer-events-none absolute top-2 left-3 text-[11px] text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-primary"
          >
            Email address
          </Label>
        </div>
      )
    case "inline-validation":
      return (
        <div className="flex w-full max-w-64 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="relative">
              <Input defaultValue="ada@lovelace.dev" className="h-9 pr-8" style={{ borderColor: "var(--dp-success)" }} aria-label="Valid email" />
              <Check className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2" style={{ color: "var(--dp-success)" }} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Input defaultValue="ada@" aria-invalid className="h-9" aria-label="Invalid email" />
            <span className="flex items-center gap-1 text-xs text-destructive"><CircleAlert className="size-3" /> Enter a complete email address</span>
          </div>
        </div>
      )
    case "stacked-group":
      return (
        <fieldset className="w-full max-w-64">
          <legend className="mb-1.5 text-sm font-medium">Contact details</legend>
          <div className="flex flex-col -space-y-px">
            <Input placeholder="Full name" aria-label="Full name" className="h-9 rounded-b-none border-foreground/25 focus-visible:z-10" />
            <Input placeholder="Company" aria-label="Company" className="h-9 rounded-none border-foreground/25 focus-visible:z-10" />
            <Input placeholder="Work email" aria-label="Work email" className="h-9 rounded-t-none border-foreground/25 focus-visible:z-10" />
          </div>
        </fieldset>
      )
    default:
      return null
  }
}

/* ---------------------------------- Badges ---------------------------------- */

function BadgesPreview({ variant }) {
  const { colors } = useScopedTheme()
  const dot = (color) => <span className="size-1.5 rounded-full" style={{ background: color }} />
  switch (variant) {
    case "pill":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge>New</Badge>
          <Badge variant="secondary">Pro plan</Badge>
          <Badge className="bg-accent text-accent-foreground">Beta</Badge>
        </div>
      )
    case "square":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge className="rounded-[3px]">New</Badge>
          <Badge variant="secondary" className="rounded-[3px]">Pro plan</Badge>
          <Badge className="rounded-[3px] bg-accent text-accent-foreground">Beta</Badge>
        </div>
      )
    case "outline":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-foreground/30">New</Badge>
          <Badge variant="outline" className="border-primary text-primary">Pro plan</Badge>
          <Badge variant="outline" className="border-foreground/30">Beta</Badge>
        </div>
      )
    case "dot":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-foreground/20">{dot(colors.success)} Operational</Badge>
          <Badge variant="outline" className="border-foreground/20">{dot(colors.warning)} Degraded</Badge>
          <Badge variant="outline" className="border-foreground/20">{dot(colors.error)} Outage</Badge>
        </div>
      )
    case "icon-label":
      return (
        <div className="flex flex-wrap gap-2">
          <Badge><Sparkles data-icon="inline-start" /> New</Badge>
          <Badge variant="secondary"><Star data-icon="inline-start" /> Popular</Badge>
          <Badge variant="outline" className="border-foreground/30"><Zap data-icon="inline-start" /> Fast</Badge>
        </div>
      )
    default:
      return null
  }
}

/* ---------------------------------- Toggles --------------------------------- */

function TogglesPreview({ variant, id }) {
  const [yearly, setYearly] = useState(true)
  switch (variant) {
    case "switch":
      return (
        <div className="flex items-center gap-3">
          <Switch id={`${id}-sw`} checked={yearly} onCheckedChange={setYearly} />
          <Label htmlFor={`${id}-sw`}>Yearly billing <span className="text-muted-foreground">(save 20%)</span></Label>
        </div>
      )
    case "checkbox":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Checkbox id={`${id}-cb1`} checked={yearly} onCheckedChange={(v) => setYearly(Boolean(v))} />
            <Label htmlFor={`${id}-cb1`}>Yearly billing</Label>
          </div>
          <div className="flex items-center gap-2.5">
            <Checkbox id={`${id}-cb2`} />
            <Label htmlFor={`${id}-cb2`}>Email me product updates</Label>
          </div>
        </div>
      )
    case "segmented":
      return (
        <div>
          <ToggleGroup
            type="single"
            variant="outline"
            spacing={0}
            value={yearly ? "yearly" : "monthly"}
            onValueChange={(v) => v && setYearly(v === "yearly")}
            aria-label="Billing period"
          >
            <ToggleGroupItem value="monthly" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="yearly" className="px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Yearly</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )
    default:
      return null
  }
}

/* ---------------------------------- Avatars --------------------------------- */

const PEOPLE = ["AL", "GH", "KJ", "MR"]

function AvatarsPreview({ variant }) {
  const { colors } = useScopedTheme()
  const tones = [colors.primary, colors.secondary, colors.accent, colors.textMuted]
  const fb = (i, className) => (
    <AvatarFallback className={cn("text-xs font-semibold", className)} style={{ background: tones[i], color: onColor(tones[i]) }}>
      {PEOPLE[i]}
    </AvatarFallback>
  )
  switch (variant) {
    case "circle":
      return (
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => <Avatar key={i} size="lg">{fb(i)}</Avatar>)}
        </div>
      )
    case "rounded-square":
      return (
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Avatar key={i} size="lg" className="rounded-lg after:rounded-lg">{fb(i, "rounded-lg")}</Avatar>
          ))}
        </div>
      )
    case "status-dot":
      return (
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <Avatar key={i} size="lg">
              {fb(i)}
              <AvatarBadge style={{ background: i === 2 ? colors.textMuted : colors.success }} />
            </Avatar>
          ))}
        </div>
      )
    case "stacked":
      return (
        <AvatarGroup>
          {[0, 1, 2, 3].map((i) => <Avatar key={i} size="lg">{fb(i)}</Avatar>)}
          <AvatarGroupCount className="size-10 text-xs">+12</AvatarGroupCount>
        </AvatarGroup>
      )
    default:
      return null
  }
}

/* ----------------------------- Tooltips / popovers ---------------------------- */

function TooltipsPreview({ variant }) {
  const portal = usePortalStyle()
  const trigger = (label) => (
    <Button variant="outline" className="border-foreground/30 bg-transparent">{label}</Button>
  )
  switch (variant) {
    case "dark-tooltip":
      return (
        <Tooltip>
          <TooltipTrigger asChild>{trigger("Hover me")}</TooltipTrigger>
          <TooltipContent sideOffset={6} style={portal} className="[&_svg]:hidden">Copied to clipboard</TooltipContent>
        </Tooltip>
      )
    case "light-popover":
      return (
        <Popover>
          <PopoverTrigger asChild>{trigger("Click me")}</PopoverTrigger>
          <PopoverContent style={portal} className="w-60 border border-border shadow-lg">
            <PopoverHeader>
              <PopoverTitle>Usage-based pricing</PopoverTitle>
              <PopoverDescription>Pay only for what you use. Cancel any time.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      )
    case "arrow-callout":
      return (
        <Tooltip>
          <TooltipTrigger asChild>{trigger("Hover me")}</TooltipTrigger>
          <TooltipContent
            sideOffset={8}
            style={portal}
            className="bg-primary px-3.5 py-2 text-sm text-primary-foreground [&_svg]:bg-primary [&_svg]:fill-primary"
          >
            <Sparkles className="size-3.5" /> New: AI suggestions
          </TooltipContent>
        </Tooltip>
      )
    default:
      return null
  }
}

/* --------------------------------- Accordions -------------------------------- */

const FAQS = [
  ["Is there a free plan?", "Yes. The free plan includes every core feature for up to 3 projects."],
  ["Can I cancel any time?", "You can cancel from your settings, and you'll keep access until the end of the period."],
]

function AccordionsPreview({ variant }) {
  const hideDefault = "[&>[data-slot=accordion-trigger-icon]]:hidden"
  const itemClass = {
    "bordered-panel": "mb-2 rounded-lg border border-foreground/20 px-3 not-last:border-b",
    divider: "border-foreground/15",
    "plus-minus": "border-foreground/15",
    chevron: "border-foreground/15",
  }[variant]

  const icon = (v) => {
    if (v === "plus-minus")
      return (
        <>
          <Plus className="ml-auto size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden" />
          <Minus className="ml-auto hidden size-4 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:block" />
        </>
      )
    if (v === "chevron")
      return <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/accordion-trigger:rotate-180" />
    return null
  }

  const custom = variant === "plus-minus" || variant === "chevron"
  return (
    <Accordion type="single" collapsible defaultValue="q0" className="w-full max-w-72">
      {FAQS.map(([q, a], i) => (
        <AccordionItem key={q} value={`q${i}`} className={itemClass}>
          <AccordionTrigger className={cn("gap-3 hover:no-underline", custom && hideDefault)}>
            <Heading>{q}</Heading>
            {icon(variant)}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

/* ------------------------------------ Tabs ----------------------------------- */

function TabsPreview({ variant }) {
  const content = (
    <>
      <TabsContent value="a" className="pt-1 text-muted-foreground">Plan, track and ship in one place.</TabsContent>
      <TabsContent value="b" className="pt-1 text-muted-foreground">Dashboards that update in real time.</TabsContent>
      <TabsContent value="c" className="pt-1 text-muted-foreground">Connect 100+ tools in a click.</TabsContent>
    </>
  )
  const triggers = (className) =>
    [["a", "Overview"], ["b", "Analytics"], ["c", "Integrations"]].map(([v, l]) => (
      <TabsTrigger key={v} value={v} className={className}>{l}</TabsTrigger>
    ))

  switch (variant) {
    case "underline":
      return (
        <Tabs defaultValue="a" className="w-full max-w-72">
          <TabsList variant="line" className="w-full justify-start gap-3 border-b border-foreground/10 pb-1">
            {triggers("flex-none px-0 after:bg-primary")}
          </TabsList>
          {content}
        </Tabs>
      )
    case "pill":
      return (
        <Tabs defaultValue="a" className="w-full max-w-72">
          <TabsList className="rounded-full bg-muted p-1 group-data-horizontal/tabs:h-9">
            {triggers("rounded-full px-3 data-active:bg-primary data-active:text-primary-foreground")}
          </TabsList>
          {content}
        </Tabs>
      )
    case "boxed":
      return (
        <Tabs defaultValue="a" className="w-full max-w-72">
          <TabsList className="w-full gap-0 rounded-none border border-foreground/20 bg-transparent p-0 group-data-horizontal/tabs:h-9">
            {triggers("h-full rounded-none border-0 not-last:border-r not-last:border-foreground/20 data-active:bg-foreground data-active:text-background data-active:shadow-none")}
          </TabsList>
          {content}
        </Tabs>
      )
    default:
      return null
  }
}

/* ---------------------------------- Progress --------------------------------- */

function ProgressPreview({ variant }) {
  switch (variant) {
    case "linear":
      return (
        <div className="flex w-full max-w-64 flex-col gap-2">
          <div className="flex justify-between text-xs"><span>Uploading</span><span className="text-muted-foreground">62%</span></div>
          <Progress value={62} />
        </div>
      )
    case "stepped":
      return (
        <div className="flex w-full max-w-64 items-center">
          {["Account", "Team", "Plan", "Done"].map((s, i) => (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border-2 text-[11px] font-semibold",
                    i < 2 ? "border-primary bg-primary text-primary-foreground" : i === 2 ? "border-primary text-primary" : "border-foreground/25 text-muted-foreground"
                  )}
                >
                  {i < 2 ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="text-[10px] text-muted-foreground">{s}</span>
              </div>
              {i < 3 && <div className={cn("mx-1 mb-4 h-0.5 flex-1", i < 2 ? "bg-primary" : "bg-foreground/15")} />}
            </div>
          ))}
        </div>
      )
    case "spinner":
      return (
        <div className="flex items-center gap-2.5 text-sm">
          <Loader2 className="size-6 animate-spin text-primary" /> Loading your workspace…
        </div>
      )
    case "skeleton":
      return (
        <div className="flex w-full max-w-64 items-center gap-3">
          <Skeleton className="size-10 shrink-0 rounded-full bg-foreground/10" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3 w-4/5 bg-foreground/10" />
            <Skeleton className="h-3 w-3/5 bg-foreground/10" />
          </div>
        </div>
      )
    default:
      return null
  }
}

const PREVIEWS = {
  buttons: ButtonsPreview,
  cards: CardsPreview,
  nav: NavPreview,
  inputs: InputsPreview,
  badges: BadgesPreview,
  toggles: TogglesPreview,
  avatars: AvatarsPreview,
  tooltips: TooltipsPreview,
  accordions: AccordionsPreview,
  tabs: TabsPreview,
  progress: ProgressPreview,
}

/** Live preview of one component variant. Must be rendered inside a ThemeScope. */
export function ComponentPreview({ category, variant }) {
  const Preview = PREVIEWS[category]
  const { colors, surface, gradient } = useScopedTheme()
  return (
    <div
      className="flex min-h-40 items-center justify-center p-5"
      style={{
        // Glass-type surfaces only read as glass over a busy backdrop.
        background: surface.backdrop && category === "cards" ? gradient : colors.background,
        "--dp-success": colors.success,
      }}
    >
      <Preview variant={variant} id={`${category}-${variant}`} />
    </div>
  )
}
