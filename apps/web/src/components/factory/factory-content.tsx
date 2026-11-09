import { assetUrl, type FactoryBlock } from "@/lib/factory";

/**
 * 工厂记录正文渲染
 * 只接受白名单块类型，避免把任意 HTML 直接塞进页面。
 */
export function FactoryContent({ blocks }: { blocks: FactoryBlock[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "heading") {
          return (
            <h2
              key={key}
              className="mt-14 mb-4 flex items-baseline gap-3 text-h3 font-normal text-ink-900 first:mt-0"
            >
              <span aria-hidden className="h-3.5 w-[3px] shrink-0 bg-champagne-500" />
              {block.text}
            </h2>
          );
        }

        if (block.type === "image") {
          const src = assetUrl(block.url);
          if (!src) return null;
          return (
            <figure key={key} className="mt-10">
              <img
                src={src}
                alt={block.caption ?? "现场记录配图"}
                loading="lazy"
                className="aspect-[3/2] w-full rounded-md border border-line bg-surface object-cover"
              />
              {block.caption ? (
                <figcaption className="mt-3 flex items-start gap-2 text-micro tracking-[0.08em] text-ink-400">
                  <span aria-hidden className="mt-1.5 h-px w-5 shrink-0 bg-line-strong" />
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="mt-10 border-l-2 border-champagne-400 bg-champagne-200/30 px-6 py-5 font-display text-xl leading-relaxed text-ink-800"
            >
              {block.text}
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={key} className="mt-6 space-y-4">
              {(block.items ?? []).map((item, itemIndex) => (
                <li key={itemIndex} className="flex gap-3 text-ink-700">
                  <span
                    aria-hidden
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lumen-500"
                  />
                  <span className="leading-[1.85]">{item}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="mt-6 text-[1.0625rem] leading-[1.9] text-ink-700 first:mt-0">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
