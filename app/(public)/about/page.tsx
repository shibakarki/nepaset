import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — NEPASET",
  description:
    "NEPASET is a youth-focused customization and lifestyle brand from Nepal, helping students express their identity through personalized products.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <section className="py-20 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-4">
          About NEPASET
        </p>
        <h1 className="font-space text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight max-w-2xl">
          Made for those who want to stand out.
        </h1>
        <p className="mt-6 text-base text-muted leading-relaxed max-w-xl">
          NEPASET is a youth-focused customization and lifestyle brand built in
          Nepal. We help students and young people express who they are through
          personalized products — clothing, accessories, and more.
        </p>
      </section>

      {/* Mission + Vision */}
      <section className="py-16 border-b border-border grid grid-cols-1 sm:grid-cols-2 gap-12">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Our Mission
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            To provide affordable, high-quality, and meaningful customized
            products that allow students and young people to showcase their
            personality, creativity, and identity.
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Our Vision
          </p>
          <p className="text-[15px] text-foreground leading-relaxed">
            To become Nepal&apos;s most recognized youth customization and
            lifestyle brand — a platform where creativity, community, and
            culture meet.
          </p>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-16 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-10">
          What makes us different
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "We design, not just resell",
              body: "Most local sellers buy products and add minimal branding. We design, customize, and produce — creating items with real value and meaning.",
            },
            {
              title: "Built for students",
              body: "Our prices, products, and process are designed around students aged 16–25 — people who want something unique but don't want to overpay for it.",
            },
            {
              title: "Customization at the core",
              body: "Every product we make can be personalized. Names, logos, artwork, group branding — if you can imagine it, we can put it on something.",
            },
          ].map((item) => (
            <div key={item.title} className="space-y-4">
              <div className="w-8 h-px bg-foreground" />
              <div>
                <h3 className="font-space text-sm font-semibold text-foreground mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap / Phases */}
      <section className="py-16 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-10">
          Where we&apos;re headed
        </p>
        <div className="space-y-0">
          {[
            {
              phase: "Phase 1",
              label: "Now",
              title: "Customized apparel & accessories",
              body: "T-shirts, shirts, phone cases, and earbuds — customized to order. Building quality, learning production, and earning trust.",
              active: true,
            },
            {
              phase: "Phase 2",
              label: "Soon",
              title: "Full customization service",
              body: "Club apparel, event uniforms, team merchandise, and group orders. Becoming Nepal's go-to customization partner.",
              active: false,
            },
            {
              phase: "Phase 3",
              label: "Later",
              title: "Premium techniques",
              body: "Embroidery, layered graphics, mixed materials, and premium finishes — taking customization to the next level.",
              active: false,
            },
            {
              phase: "Phase 4",
              label: "Future",
              title: "Original lifestyle collections",
              body: "Student, Tech, Nepal, Creator — original branded collections that go beyond customization into full lifestyle brand territory.",
              active: false,
            },
          ].map((item, i) => (
            <div
              key={item.phase}
              className={`flex flex-col sm:flex-row gap-4 sm:gap-6 py-8 ${
                i !== 3 ? "border-b border-border" : ""
              }`}
            >
              {/* Left */}
              <div className="w-24 shrink-0 flex items-center sm:items-start sm:flex-col justify-between sm:justify-start gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                  {item.phase}
                </p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    item.active
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "text-muted border-border"
                  }`}
                >
                  {item.label}
                </span>
              </div>
              {/* Right */}
              <div className="flex-1 mt-1 sm:mt-0">
                <h3 className="font-space text-sm font-semibold text-foreground mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[13px] text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core values */}
      <section className="py-16 border-b border-border">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-10">
          Core values
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {[
            { value: "Creativity", desc: "Self-expression through design" },
            { value: "Affordability", desc: "Accessible to every student" },
            { value: "Quality", desc: "Products worth being proud of" },
            { value: "Innovation", desc: "Always improving, always new" },
            { value: "Community", desc: "Built around shared creativity" },
          ].map((item) => (
            <div key={item.value} className="text-center space-y-1 bg-surface-2/40 py-4 px-2 rounded-xl border border-border/20">
              <p className="font-space text-sm font-bold text-foreground">
                {item.value}
              </p>
              <p className="text-[11px] text-muted leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="font-space text-2xl font-bold text-foreground tracking-tight mb-3">
          Ready to make something yours?
        </h2>
        <p className="text-sm text-muted mb-8">
          Browse the shop or submit a custom order request.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">
          <a
            href="/shop"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-3 bg-foreground text-background rounded-xl hover:opacity-95 transition-all text-center cursor-pointer shadow-md"
          >
            Browse shop
          </a>
          <a
            href="/customize"
            className="w-full sm:w-auto text-sm font-semibold px-6 py-3 border border-border text-foreground bg-surface rounded-xl hover:bg-surface-2 transition-all text-center cursor-pointer"
          >
            Request customization
          </a>
        </div>
      </section>
    </div>
  );
}