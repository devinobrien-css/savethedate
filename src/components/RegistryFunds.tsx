export type FundCardItem = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  mostWanted: boolean;
};

/**
 * "Contribute cash toward" cards. Unlike gifts, these have no price and no
 * claim flow — they're a sweet prompt for what a cash/check gift goes toward.
 * Rendered in their own section above the cash-gift (Venmo) block.
 */
export default function RegistryFunds({ funds }: { funds: FundCardItem[] }) {
  if (funds.length === 0) return null;

  return (
    <div id="contribute-toward" className="mt-20 scroll-mt-8 border-t border-v1-ink/10 pt-14">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-widest2 text-v1-denim">
          Contribute toward
        </p>
        <div className="mx-auto mt-6 h-px w-14 bg-v1-blush" />
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-v1-denim/80">
          If you&apos;d rather give cash or a check, here are a few things your gift
          could go toward.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {funds.map((fund) => (
          <div key={fund.id} className="relative flex flex-col border border-v1-ink/15 bg-white">
            {fund.mostWanted && (
              <span className="absolute left-3 top-3 z-10 bg-v1-blush px-2.5 py-1 text-[10px] uppercase tracking-widest2 text-v1-ink">
                ♥ Most wanted
              </span>
            )}
            {fund.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fund.imageUrl}
                alt=""
                className="aspect-[4/3] w-full bg-white object-contain p-4"
              />
            )}
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-xl leading-snug text-v1-ink">{fund.title}</h3>
              {fund.description && (
                <p className="mt-3 text-sm leading-relaxed text-v1-denim/80">
                  {fund.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
