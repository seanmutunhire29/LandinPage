import { useSearchParams } from "react-router-dom"
import { ArrowDown, ArrowUp, FileText, GripVertical, Lock, Pin } from "lucide-react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useDesignStore } from "@/store/useDesignStore"
import { sectionVariantOptions, recommendedSectionVariant } from "@/lib/filters"
import { SECTION_TYPES, sectionById } from "@/data/sections"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { SubStepper } from "@/components/wizard/SubStepper"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ThemeScope } from "@/components/wizard/ThemeScope"
import { Wireframe } from "@/components/previews/Wireframe"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "sections", name: "Choose sections", blurb: "Pick which sections your landing page includes. Hero and footer are always included." },
  { id: "variants", name: "Choose layouts", blurb: "Pick a layout for each section. Options are filtered by your direction." },
  { id: "order", name: "Arrange", blurb: "Drag sections into order. Hero stays first and footer stays last." },
]

const Tag = ({ children, icon: Icon }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f2f8] px-2 py-0.5 text-[11px] font-semibold text-[#676879]">
    <Icon className="size-3" /> {children}
  </span>
)

/* ----------------------------- Step 1: sections ----------------------------- */

function SectionsStep({ theme, direction, sections, toggleSection }) {
  const included = new Set(sections.map((s) => s.type))
  return (
    <OptionGrid label="Sections" role="group" cols="sm:grid-cols-2 lg:grid-cols-3">
      {SECTION_TYPES.map((type) => {
        const variant = type.variants.find((v) => v.id === recommendedSectionVariant(direction, type.id))
        return (
          <OptionCard
            key={type.id}
            role="checkbox"
            selected={included.has(type.id)}
            disabled={type.required}
            onSelect={() => toggleSection(type.id)}
            title={type.name}
            subtitle={`${sectionVariantOptions(direction, type.id).length} layouts for your direction`}
            badges={
              <>
                {type.required && <Tag icon={Lock}>Required</Tag>}
                {type.contentBearing && <Tag icon={FileText}>Needs content</Tag>}
              </>
            }
          >
            <ThemeScope theme={theme}>
              <Wireframe wire={variant.wire} className="pointer-events-none min-h-32 origin-top" />
            </ThemeScope>
          </OptionCard>
        )
      })}
    </OptionGrid>
  )
}

/* ----------------------------- Step 2: variants ----------------------------- */

function VariantsStep({ theme, direction, sections, setSectionVariant }) {
  return (
    <div className="flex flex-col gap-14">
      <nav aria-label="Jump to section" className="-mt-2 flex flex-wrap gap-2">
        {sections.map((s) => (
          <a
            key={s.type}
            href={`#section-${s.type}`}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              s.variant ? "bg-brand/10 text-brand-navy" : "bg-white text-[#676879] ring-1 ring-[#e3e5f0]"
            )}
          >
            {s.variant ? "✓ " : ""}
            {sectionById[s.type].name}
          </a>
        ))}
      </nav>
      {sections.map((s, i) => {
        const type = sectionById[s.type]
        const recommended = recommendedSectionVariant(direction, s.type)
        return (
          <section key={s.type} id={`section-${s.type}`} className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="grid size-7 place-items-center rounded-full bg-brand-navy text-xs font-bold text-white">{i + 1}</span>
              <h2 className="font-display text-xl font-bold text-brand-navy">{type.name}</h2>
              {type.contentBearing && <Tag icon={FileText}>Needs content</Tag>}
            </div>
            <OptionGrid label={`${type.name} layouts`} cols="sm:grid-cols-2 lg:grid-cols-4" className="gap-4">
              {sectionVariantOptions(direction, s.type).map((v) => (
                <OptionCard
                  key={v.id}
                  selected={s.variant === v.id}
                  recommended={v.id === recommended}
                  onSelect={() => setSectionVariant(s.type, v.id)}
                  title={v.name}
                >
                  <ThemeScope theme={theme}>
                    <Wireframe wire={v.wire} />
                  </ThemeScope>
                </OptionCard>
              ))}
            </OptionGrid>
          </section>
        )
      })}
    </div>
  )
}

/* ------------------------------ Step 3: order ------------------------------- */

function SectionRow({ section, index, count, theme, pinned, onMove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.type, disabled: pinned })
  const type = sectionById[section.type]
  const variant = type.variants.find((v) => v.id === section.variant)
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 ring-1 ring-[#e3e5f0]",
        isDragging && "relative z-10 shadow-[0_16px_40px_-12px_rgba(24,27,52,0.35)] ring-brand"
      )}
    >
      {pinned ? (
        <span className="grid size-9 place-items-center text-[#9699a6]" title="Pinned">
          <Pin className="size-4" />
        </span>
      ) : (
        <button
          type="button"
          className="grid size-9 cursor-grab touch-none place-items-center rounded-lg text-[#676879] hover:bg-[#f1f2f8] active:cursor-grabbing"
          aria-label={`Drag ${type.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
      )}
      <div className="hidden w-40 shrink-0 overflow-hidden rounded-lg ring-1 ring-[#eef0f6] sm:block">
        <ThemeScope theme={theme}>
          <Wireframe wire={variant.wire} className="pointer-events-none min-h-24 p-2.5" />
        </ThemeScope>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-brand-navy">
          <span className="mr-2 text-[#9699a6]">{index + 1}.</span>
          {type.name}
        </p>
        <p className="truncate text-sm text-[#676879]">{variant.name}</p>
      </div>
      {!pinned && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index <= 1}
            className="grid size-8 place-items-center rounded-lg text-[#676879] hover:bg-[#f1f2f8] disabled:opacity-30"
            aria-label={`Move ${type.name} up`}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index >= count - 2}
            className="grid size-8 place-items-center rounded-lg text-[#676879] hover:bg-[#f1f2f8] disabled:opacity-30"
            aria-label={`Move ${type.name} down`}
          >
            <ArrowDown className="size-4" />
          </button>
        </div>
      )}
    </li>
  )
}

function OrderStep({ theme, sections, reorderSections }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const last = sections.length - 1
  // Hero stays first and footer stays last; everything in between is movable.
  const move = (from, to) => {
    if (from <= 0 || from >= last || to <= 0 || to >= last) return
    reorderSections(arrayMove(sections, from, to))
  }
  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    move(
      sections.findIndex((s) => s.type === active.id),
      sections.findIndex((s) => s.type === over.id)
    )
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sections.map((s) => s.type)} strategy={verticalListSortingStrategy}>
        <ol className="mx-auto flex max-w-3xl flex-col gap-3">
          {sections.map((s, i) => (
            <SectionRow key={s.type} section={s} index={i} count={sections.length} theme={theme} pinned={i === 0 || i === last} onMove={move} />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

/* ---------------------------------- Page ------------------------------------ */

export default function Layout() {
  const state = useDesignStore()
  const { direction, sections, toggleSection, setSectionVariant, reorderSections } = state
  const { stage, goBack, goNext } = useStageNav("layout")
  const [params, setParams] = useSearchParams()
  const theme = resolveTheme(state)

  const allVariants = sections.every((s) => s.variant)
  const requested = Math.max(0, STEPS.findIndex((s) => s.id === params.get("step")))
  const index = requested === 2 && !allVariants ? 1 : requested
  const step = STEPS[index]
  const missing = sections.filter((s) => !s.variant).length

  const go = (i) => {
    setParams({ step: STEPS[i].id })
    window.scrollTo({ top: 0 })
  }

  const next = [
    { onNext: () => go(1), disabled: false, label: "Next: Choose layouts" },
    { onNext: () => go(2), disabled: !allVariants, label: "Next: Arrange", hint: missing ? `${missing} section${missing > 1 ? "s" : ""} still need a layout` : null },
    { onNext: goNext, disabled: !allVariants, label: "Next" },
  ][index]

  return (
    <>
      <StagePage>
        <StageHeader eyebrow={`Stage 5 · ${stage.label}`} title={step.name} blurb={step.blurb} />
        <SubStepper
          label="Layout steps"
          steps={STEPS}
          currentIndex={index}
          onJump={go}
          canJump={(_, i) => i < 2 || allVariants}
          isDone={(_, i) => (i === 0 ? index > 0 : i === 1 ? allVariants : false)}
        />
        {step.id === "sections" && <SectionsStep theme={theme} direction={direction} sections={sections} toggleSection={toggleSection} />}
        {step.id === "variants" && <VariantsStep theme={theme} direction={direction} sections={sections} setSectionVariant={setSectionVariant} />}
        {step.id === "order" && <OrderStep theme={theme} sections={sections} reorderSections={reorderSections} />}
      </StagePage>
      <WizardNav
        onBack={() => (index > 0 ? go(index - 1) : goBack())}
        onNext={next.onNext}
        nextDisabled={next.disabled}
        nextLabel={next.label}
        hint={next.hint ?? (index === 0 ? `${sections.length} sections selected` : null)}
      />
    </>
  )
}
