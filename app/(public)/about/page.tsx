import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — NEPASET",
  description:
    "NEPASET is a youth-focused customization and lifestyle brand from Nepal, helping students express their identity through personalized products.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-20 border-b border-neutral-150">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-4">
          About NEPASET
        </p>
        <h1 className="font-space text-4xl sm:text-5xl font-medium text-[#0a0a0a] tracking-tight leading-tight max-w-2xl">
          Made for those who want to stand out.
        </h1>
        <p className="mt-6 text-base text-neutral-500 leading-relaxed max-w-xl">
          NEPASET is a youth-focused customization and lifestyle brand built in
          Nepal. We help students and young people express who they are through
          personalized products — clothing, accessories, and more.
        </p>
      </section>

      {/* Mission + Vision */}
      <section className="py-16 border-b border-neutral-150 grid grid-cols-1 sm:grid-cols-2 gap-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-3">
            Our Mission
          </p>
          <p className="text-[15px] text-[#0a0a0a] leading-relaxed">
            To provide affordable, high-quality, and meaningful customized
            products that allow students and young people to showcase their
            personality, creativity, and identity.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-3">
            Our Vision
          </p>
          <p className="text-[15px] text-[#0a0a0a] leading-relaxed">
            To become Nepal&apos;s most recognized youth customization and
            lifestyle brand — a platform where creativity, community, and
            culture meet.
          </p>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-16 border-b border-neutral-150">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-10">
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
            <div key={item.title}>
              <div className="w-8 h-px bg-[#0a0a0a] mb-4" />
              <h3 className="font-space text-sm font-medium text-[#0a0a0a] mb-2 leading-snug">
                {item.title}
              </h3>
              <p className="text-[13px] text-neutral-500 leading-relaxed">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap / Phases */}
      <section className="py-16 border-b border-neutral-150">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-10">
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
              className={[
                "flex gap-6 py-8",
                i !== 3 ? "border-b border-neutral-150" : "",
              ].join(" ")}
            >
              {/* Left */}
              <div className="w-24 shrink-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                  {item.phase}
                </p>
                <span
                  className={[
                    "inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full border",
                    item.active
                      ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                      : "text-neutral-400 border-neutral-150",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </div>
              {/* Right */}
              <div className="flex-1">
                <h3 className="font-space text-sm font-medium text-[#0a0a0a] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core values */}
      <section className="py-16 border-b border-neutral-150">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400 mb-10">
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
            <div key={item.value} className="text-center">
              <p className="font-space text-sm font-medium text-[#0a0a0a] mb-1">
                {item.value}
              </p>
              <p className="text-[11px] text-neutral-400 leading-snug">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="font-space text-2xl font-medium text-[#0a0a0a] tracking-tight mb-3">
          Ready to make something yours?
        </h2>
        <p className="text-sm text-neutral-400 mb-8">
          Browse the shop or submit a custom order request.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/shop"
            className="text-sm font-medium px-6 py-2.5 bg-[#0a0a0a] text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Browse shop
          </a>
          <a
            href="/customize"
            className="text-sm font-medium px-6 py-2.5 border border-neutral-150 text-[#0a0a0a] rounded-xl hover:border-neutral-300 transition-colors"
          >
            Request customization
          </a>
        </div>
      </section>
    </div>
  );
}
